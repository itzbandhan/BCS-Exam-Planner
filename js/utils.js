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
