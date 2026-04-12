// ============================================================
// UTILS.JS — Global helpers for BCS Exam Planner
// ============================================================

/**
 * Standardized date comparison: ignores hours.
 * Returns true if the target date is strictly in the future.
 */
function isDateLocked(targetDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const cardDate = new Date(targetDate);
    cardDate.setHours(0, 0, 0, 0);
    
    return cardDate > today;
}

/**
 * Returns a human-readable countdown string to the target date.
 */
function getCountdownText(targetDate) {
    const now = new Date();
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0); // Available at start of day
    
    const diff = target - now;
    if (diff <= 0) return "Available now!";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    let parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    
    const timeStr = parts.slice(0, 2).join(' ') || "less than a minute";
    return `Locks will lift in ${timeStr}. Focus on today's goals for now!`;
}

/**
 * Sleek non-intrusive notification engine.
 */
function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast-msg').forEach(t => t.remove());
    
    const config = {
        locked:  { icon: '<svg width="20" height="20" fill="none" stroke="#f59e0b" stroke-width="2" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>', color: '#f59e0b' },
        success: { icon: '<svg width="20" height="20" fill="none" stroke="#10b981" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>', color: '#10b981' },
        info:    { icon: '<svg width="20" height="20" fill="none" stroke="#6366f1" stroke-width="2" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>', color: '#6366f1' }
    };
    
    const style = config[type] || config.info;
    
    const toast = document.createElement('div');
    toast.className = `toast-msg toast-${type}`;
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            ${style.icon}
            <span class="font-semibold text-sm">${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation with micro-delay for reliable transition
    setTimeout(() => {
        toast.classList.add('visible');
    }, 10);
    
    // Auto-remove
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 500);
    }, 3500);
}

/**
 * Debounce helper for inputs
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Settings Modal Logic
 */
function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;
    
    // Load current values on open
    if (!modal.classList.contains('active')) {
        const keyInput = document.getElementById('gemini-key');
        const syncInput = document.getElementById('sync-key');
        const configInput = document.getElementById('firebase-config');
        
        if (keyInput) keyInput.value = PlannerStorage.get('gemini_api_key') || '';
        if (syncInput) syncInput.value = PlannerStorage.get('sync_key') || '';
        if (configInput) configInput.value = localStorage.getItem('firebase_config') || '';
    }
    
    modal.classList.toggle('active');
}

async function saveSettings() {
    const keyInput = document.getElementById('gemini-key');
    const syncInput = document.getElementById('sync-key');
    const configInput = document.getElementById('firebase-config');
    
    if (!keyInput) return;
    
    const geminiVal = keyInput.value.trim();
    const syncKeyVal = syncInput ? syncInput.value.trim() : null;
    let configVal = configInput ? configInput.value.trim() : null;

    // If UI config is empty (hidden), check localStorage for the pre-filled default
    if (!configVal) {
        configVal = localStorage.getItem('firebase_config');
    }

    const btn = document.querySelector('#settings-modal .btn-primary');
    if (btn) btn.innerHTML = '<span class="animate-pulse">Active Syncing...</span>';
    
    try {
        // 1. Handle Cloud Sync Setup first
        if (configVal && syncKeyVal) {
            try {
                const configParsed = JSON.parse(configVal);
                localStorage.setItem('firebase_config', configVal);
                const success = await PlannerStorage.initCloud(configParsed, syncKeyVal);
                if (!success) throw new Error("Cloud config error");
            } catch (e) {
                showToast("Firebase Config is not valid JSON.", "locked");
                return;
            }
        } else if (!syncKeyVal && localStorage.getItem('sync_key')) {
            // User cleared sync key
            localStorage.removeItem('sync_key');
            localStorage.removeItem('firebase_config');
            location.reload(); // Hard reset to stop Firebase
        }

        // 2. Validate Gemini Key (if changed)
        if (geminiVal && geminiVal !== PlannerStorage.get('gemini_api_key')) {
            const val = geminiVal;
            let lastError = null;

            try {
                // Use the 'models' list endpoint to verify the key without using generation quota
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${val}`);
                
                // 200 = Success, 429 = Valid key but quota hit. 
                // Both prove the key is structurally correct and active.
                if (response.ok || response.status === 429) {
                    await PlannerStorage.set('gemini_api_key', val);
                    const msg = response.status === 429 
                        ? "Key added! 🚨 Note: You currently have 0 quota on this key." 
                        : "Gemini API Key verified and saved! 🚀";
                    showToast(msg, response.status === 429 ? "info" : "success");
                    toggleSettings();
                    return;
                }
                
                const errData = await response.json().catch(() => ({}));
                lastError = `API Error (${response.status}): ${errData.error ? errData.error.message : response.statusText}`;
            } catch (err) {
                lastError = err.message;
            }
            throw new Error(lastError || "Failed to validate API key");
        }
        
        // 3. Success Feedback
        showToast("Configurations synced and saved! 🚀", "success");
        toggleSettings();
        if (syncKeyVal) updateCloudStatus(true);
    } catch (err) {
        console.error("Gemini Validation Error:", err);
        showToast(`Validation Failed: ${err.message}`, "locked");
    } finally {
        if (btn) btn.innerHTML = 'Save & Sync';
    }
}

function updateCloudStatus(active) {
    const el = document.getElementById('cloud-status');
    if (!el) return;
    const dot = el.querySelector('.status-dot');
    const text = el.querySelector('span');
    
    if (active) {
        dot.style.background = '#10b981';
        dot.classList.add('animate-pulse');
        text.textContent = 'Synced';
        el.style.opacity = '1';
    } else {
        dot.style.background = '#64748b';
        dot.classList.remove('animate-pulse');
        text.textContent = 'Local';
        el.style.opacity = '0.6';
    }
}

document.addEventListener('cloudSynced', () => updateCloudStatus(true));


/**
 * Export data function
 */
function exportData() {
    const data = {};
    const excludedKeys = ['firebase_config', 'sync_key', 'gemini_api_key'];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!excludedKeys.includes(key)) {
            data[key] = localStorage.getItem(key);
        }
    }
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const dt = new Date();
    const fileName = `bcs_planner_backup_${dt.getFullYear()}${dt.getMonth()+1}${dt.getDate()}.json`;
    
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    showToast("Data exported successfully", "success");
}
