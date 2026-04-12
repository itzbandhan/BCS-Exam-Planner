// ============================================================
// APP.JS — Orchestration, routing, and UI lifecycle
// ============================================================

// ── Initialise on load ──
window.addEventListener('load', () => {
    renderSubjects();
    renderTimetable();
    renderExamSchedule();
    renderNightlyFocus();
    renderMorningReview();
    renderGreetingAndBrief();
    initCountdown();
    setupFAB();
    
    // Notes module
    if (typeof initNotes === 'function') initNotes();
    
    if (typeof checkUrgency === 'function') checkUrgency();
    
    nav('overview');              // Default section

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .catch(err => console.log('SW registration failed:', err));
    }

    // Initialize New Premium Features
    initConsoleSignature();
    initKeyboardShortcuts();
});

// ── Navigation ──
function nav(targetId) {
    // Close mobile menu
    const menuEl = document.getElementById('mobile-menu');
    if (menuEl && menuEl.classList.contains('open')) {
        toggleMobileMenu();
    }

    // Swap sections
    document.querySelectorAll('.view-section').forEach(sec => {
        sec.classList.remove('active');
    });
    const targetSec = document.getElementById(targetId);
    if (targetSec) targetSec.classList.add('active');

    // Update nav button states (desktop + mobile)
    document.querySelectorAll('[data-target]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.target === targetId);
    });

    // Section-specific side effects
    if (targetId === 'overview') {
        setTimeout(initCharts, 60);    // chart needs rendered dimensions
        updateAllProgress();
        renderGreetingAndBrief();      // Refreshes the active view explicitly
    }
}

function setupFAB() {
    const fab = document.getElementById('fab-top');
    if (!fab) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            fab.style.display = 'flex';
        } else {
            fab.style.display = 'none';
        }
    });
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const iconHam = document.getElementById('icon-hamburger');
    const iconClose = document.getElementById('icon-close');
    
    if (!menu) return;
    
    const isOpen = menu.classList.toggle('open');
    if (iconHam && iconClose) {
        iconHam.style.display = isOpen ? 'none' : 'block';
        iconClose.style.display = isOpen ? 'block' : 'none';
    }
    
    // Freeze background scrolling
    document.body.style.overflow = isOpen ? 'hidden' : '';
}

// ── Render exam schedule in Overview ──
function renderExamSchedule() {
    const el = document.getElementById('exam-schedule');
    if (!el) return;

    const now = Date.now();
    let nextFound = false;

    const eSchedule = window.examSchedule || [];
    el.innerHTML = eSchedule.map((exam, idx) => {
        const isPast  = exam.target.getTime() < now;
        const isNext  = !nextFound && !isPast;
        if (isNext) nextFound = true;
        const staggerClass = idx < 8 ? `stagger-${idx + 1}` : '';

        return `
        <div class="schedule-item animate-fade-slide-up ${staggerClass} ${isNext ? 'next-exam' : ''} ${isPast ? 'opacity-40' : ''}">
            <div>
                <span class="font-semibold text-sm ${isNext ? 'text-indigo-300' : 'text-slate-400'}">${exam.date}</span>
                <span class="mx-2 text-slate-700">—</span>
                <span class="font-semibold text-sm text-white">${exam.subject}</span>
            </div>
            <span class="pill ${isNext ? 'pill-indigo' : (isPast ? 'pill-amber' : 'pill-emerald')}">${isNext ? 'UP NEXT' : (isPast ? 'DONE' : exam.code)}</span>
        </div>`;
    }).join('');
}

// ── Render Personal Greeting and Dashboard Daily Summary ──
function renderGreetingAndBrief() {
    const el = document.getElementById('greeting-briefing');
    if (!el) return;

    const currentHour = new Date().getHours();
    let greeting = "Good Evening";
    if (currentHour < 12) greeting = "Good Morning";
    else if (currentHour < 18) greeting = "Good Afternoon";

    const now = new Date();
    const todayStr = now.toDateString();
    
    const tData = window.timetableData || [];
    const eSchedule = window.examSchedule || [];
    const sData = window.subjectsData || {};

    let todayData = tData.find(d => new Date(d.date).toDateString() === todayStr);
    const nextExam = eSchedule.find(e => e.target.getTime() > now.getTime());
    
    let briefContent = '';
    
    if (todayData) {
        const total = todayData.sessions.length;
        let comp = 0;
        const dIdx = tData.indexOf(todayData);
        todayData.sessions.forEach((_, sIdx) => {
            if (PlannerStorage.get(`check-${dIdx}-${sIdx}`) === 'true') comp++;
        });
        
        const pct = total > 0 ? Math.round((comp / total) * 100) : 0;
        const streak = calculateStreak();
        const randomTip = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

        const isExamDay = nextExam && now.toDateString() === nextExam.target.toDateString();
        
        let daysLeftText = '';
        if (nextExam && !isExamDay) {
            const timeDiff = nextExam.target.getTime() - now.getTime();
            const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            if (daysLeft >= 0) {
                daysLeftText = `<span class="pill pill-rose">🚨 ${daysLeft} Days to ${nextExam.subject}</span>`;
            }
        }

        // Find a pending target topic
        let nxtTarget = "All Targets Mastered";
        for (let key in sData) {
            let pending = (sData[key].targets || []).find(t => PlannerStorage.get(`mastery_${t.id}`) !== 'true');
            if (pending) {
                nxtTarget = pending.title;
                break;
            }
        }
        
        briefContent = `
            <div class="mt-4 p-4 border rounded-lg border-indigo-500-30" style="background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);">
                <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <span class="font-bold text-sm tracking-wide">TODAY'S INTEL: <span style="color:var(--accent-indigo)">${todayData.day}</span></span>
                    <div class="flex items-center gap-2">
                        ${streak > 0 ? `<span class="pill pill-amber" title="Operational Streak">🔥 ${streak} DAY STRK</span>` : ''}
                        <span class="pill pill-indigo">${pct}% DONE</span>
                        ${daysLeftText}
                    </div>
                </div>
                
                <div class="grid-responsive grid-md-2 gap-3 mb-4">
                    <div class="p-3 rounded-lg border-l-[3px] border-indigo-500" style="background: rgba(255,255,255,0.03)">
                        <p class="text-[10px] uppercase tracking-widest text-indigo-400 mb-1 font-bold">Action Status</p>
                        <p class="text-xs text-slate-300">
                            ${total - comp} sessions remaining. Main Focus: <strong class="text-white">${todayData.sessions[0]?.sub || 'Review'}</strong>.
                        </p>
                    </div>
                    <div class="p-3 rounded-lg border-l-[3px] border-emerald-500" style="background: rgba(255,255,255,0.03)">
                        <p class="text-[10px] uppercase tracking-widest text-emerald-400 mb-1 font-bold">Prime Target</p>
                        <p class="text-xs text-slate-300">
                            You need to master: <strong class="text-white">${nxtTarget}</strong>
                        </p>
                    </div>
                </div>

                <div class="p-3 rounded-lg mb-4 border-l-[3px] border-slate-600" style="background: rgba(255,255,255,0.02)">
                    <p class="text-[10px] uppercase tracking-widest text-amber-400 mb-1 font-bold">Tactical Tip</p>
                    <p class="text-xs text-slate-300 italic">"${randomTip}"</p>
                </div>
                
                <div class="flex gap-2 mt-2">
                    <button class="brief-action-btn flex-1 justify-center" onclick="nav('${isExamDay ? 'survival' : 'timetable'}'); ${isExamDay ? '' : `setTimeout(() => document.getElementById('anchor-day-${dIdx}')?.scrollIntoView({behavior:'smooth'}), 100)`}">
                        ${isExamDay ? 'Exam Protocol' : "Jump to Tasks"}
                    </button>
                    <button class="brief-action-btn flex-1 justify-center" onclick="nav('notes');" style="border-color: rgba(139, 92, 246, 0.4); background: rgba(139, 92, 246, 0.05);">
                        <svg width="14" height="14" fill="none" class="mr-2" stroke="var(--accent-violet)" stroke-width="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        AI Study Hub
                    </button>
                </div>
            </div>
        `;
    } else {
        briefContent = `<p class="mt-4 text-slate-400 text-sm italic">Routine maintenance mode active. No custom schedule for today.</p>`;
    }

    el.innerHTML = `
        <div class="glass-card" style="border-left: 4px solid var(--accent-indigo); padding: 1.5rem; position: relative;">
            <h2 class="text-3xl font-bold font-display text-white mb-1">
                ${greeting}, <span class="text-gradient">Pramesh</span>!
            </h2>
            <div class="flex items-center gap-2 text-slate-500 text-sm">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} — ${now.toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})}
            </div>
            ${briefContent}
        </div>
    `;
}

function calculateStreak() {
    let streak = 0;
    const now  = new Date();
    
    const tData = window.timetableData || [];
    
    // Check backwards from today
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dStr = d.toDateString();
        const dIdx = tData.findIndex(day => new Date(day.date).toDateString() === dStr);
        
        if (dIdx !== -1) {
            let dayDone = false;
            // A day counts if at least one session is checked
            tData[dIdx].sessions.forEach((_, sIdx) => {
                if (PlannerStorage.get(`check-${dIdx}-${sIdx}`) === 'true') dayDone = true;
            });
            
            if (dayDone) streak++;
            else if (i > 0) break; // Break if we hit a gap (ignore today's gap if we just started)
        } else if (i > 0) {
            break;
        }
    }
    return streak;
}

// ── Render nightly focus rows in Survival section ──
function renderNightlyFocus() {
    const el = document.getElementById('nightly-focus');
    if (!el) return;

    el.innerHTML = eveningFocus.map((item, idx) => {
        const uid = `night-${idx}`;
        const isChecked = PlannerStorage.get(uid) === 'true';
        const isLocked = isDateLocked(item.date);
        const staggerClass = idx < 8 ? `stagger-${idx + 1}` : '';
        
        return `
        <div class="task-row animate-fade-slide-up ${staggerClass} ${isChecked ? 'completed' : ''} ${isLocked ? 'day-locked' : ''}" id="row-${uid}" onclick="toggleSurvivalTask('${uid}', this, ${idx}, 'night')" style="border-radius: 0; border-bottom: 1px solid var(--glass-border); position: relative;">
            <div class="custom-check">
                <svg class="check-svg" viewBox="0 0 12 10"><polyline points="1,5 4.5,9 11,1"/></svg>
            </div>
            <div style="min-width:160px; margin-top: 1px;">
                <span class="pill pill-${item.color}">${item.night}</span>
            </div>
            <div class="flex-1">
                <strong class="text-white task-text">${item.subject}</strong>
                <span class="mx-2 text-slate-600">·</span>
                <span class="task-text" style="color: var(--text-muted); font-size: 0.9rem;">${item.focus}</span>
            </div>
        </div>`;
    }).join('');
}

// ── Render morning review rows in Survival section ──
function renderMorningReview() {
    const el = document.getElementById('morning-review');
    if (!el) return;

    el.innerHTML = morningReview.map((item, idx) => {
        const uid = `morn-${idx}`;
        const isChecked = PlannerStorage.get(uid) === 'true';
        const isLocked = isDateLocked(item.date);
        const staggerClass = idx < 8 ? `stagger-${idx + 1}` : '';
        
        return `
        <div class="task-row animate-fade-slide-up ${staggerClass} ${isChecked ? 'completed' : ''} ${isLocked ? 'day-locked' : ''}" id="row-${uid}" onclick="toggleSurvivalTask('${uid}', this, ${idx}, 'morn')" style="border-radius: 0; border-bottom: 1px solid var(--glass-border); position: relative;">
            <div class="custom-check">
                <svg class="check-svg" viewBox="0 0 12 10"><polyline points="1,5 4.5,9 11,1"/></svg>
            </div>
            <div style="min-width:160px; margin-top: 1px;">
                <span class="pill pill-${item.color}">${item.morning}</span>
            </div>
            <div class="flex-1">
                <strong class="text-white task-text">${item.subject}</strong>
                <span class="mx-2 text-slate-600">·</span>
                <span class="task-text" style="color: var(--text-muted); font-size: 0.9rem;">${item.focus}</span>
            </div>
        </div>`;
    }).join('');
}

function toggleSurvivalTask(uid, rowEl, idx, type) {
    // Locking guard
    const item = type === 'night' ? eveningFocus[idx] : morningReview[idx];
    if (item && isDateLocked(item.date)) {
        const info = getCountdownText(item.date);
        showToast(info, 'locked');
        return;
    }

    const isCurrentlyChecked = PlannerStorage.get(uid) === 'true';
    const newChecked = !isCurrentlyChecked;
    
    PlannerStorage.set(uid, newChecked);
    rowEl.classList.toggle('completed', newChecked);
    if (newChecked) showToast("Protocol objective achieved!", 'success');
    updateAllProgress(); // Trigger global progress update
}



// End of App.js logic

// ── Final Premium Polish: Console Signature ──
function initConsoleSignature() {
    const style1 = 'background: #060d1f; color: #6366f1; font-size: 14px; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px; border: 1px solid #6366f1;';
    const style2 = 'background: #6366f1; color: #fff; font-size: 14px; font-weight: bold; padding: 4px 8px; border-radius: 0 4px 4px 0; border: 1px solid #6366f1;';
    console.log('%c BCS PLANNER %c AUTHENTICATED: PRAMESH BHURTEL ', style1, style2);
    console.log('%c[SYSTEM] Initializing strategic study environment...', 'color: #10b981; font-family: monospace;');
}

// Swipe navigation removed per user request (sensitivity issues)

// ── Keyboard Shortcuts ──
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger if user is typing in an input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        // Number keys 1-5 for sections
        const key = parseInt(e.key);
        if (key >= 1 && key <= 5) {
            nav(SECTIONS[key - 1]);
        }

        // Help modal trigger
        if (e.key === '?') {
            showToast("Shortcuts: 1-5 to navigate sections, Ctrl+E export.", "info");
        }

        // Export data
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            if (typeof exportData === 'function') exportData();
        }
    });
}

// Global Cloud Update Listener
PlannerStorage.addListener(() => {
    // Re-render everything that might have changed
    renderGreetingAndBrief();
    renderExamSchedule();
    renderNightlyFocus();
    renderMorningReview();
    if (typeof updateAllProgress === 'function') updateAllProgress();
});

