// ============================================================
// APP.JS — Orchestration, routing, starfield, footer quotes
// ============================================================

// ── Initialise on load ──
window.addEventListener('load', () => {
    initStarfield();
    renderSubjects();
    renderTimetable();
    renderExamSchedule();
    renderNightlyFocus();
    renderMorningReview();
    renderGreetingAndBrief();
    initCountdown();
    setupFAB();
    nav('overview');              // Default section

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .catch(err => console.log('SW registration failed:', err));
    }

    // Initialize New Premium Features
    initConsoleSignature();
    initSwipeNavigation();
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

    el.innerHTML = examSchedule.map(exam => {
        const isPast  = exam.target.getTime() < now;
        const isNext  = !nextFound && !isPast;
        if (isNext) nextFound = true;

        return `
        <div class="schedule-item ${isNext ? 'next-exam' : ''} ${isPast ? 'opacity-40' : ''}">
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
    let todayData = timetableData.find(d => new Date(d.date).toDateString() === todayStr);
    const nextExam = examSchedule.find(e => e.target.getTime() > now.getTime());
    
    let briefContent = '';
    
    if (todayData) {
        const total = todayData.sessions.length;
        let comp = 0;
        const dIdx = timetableData.indexOf(todayData);
        todayData.sessions.forEach((_, sIdx) => {
            if (localStorage.getItem(`check-${dIdx}-${sIdx}`) === 'true') comp++;
        });
        
        const pct = total > 0 ? Math.round((comp / total) * 100) : 0;
        const guidance = pct === 100 ? "Level Complete. Time to recover." : (pct > 50 ? "Final stretch. Stay sharp." : "High energy block required now.");
        const streak = calculateStreak();
        const randomTip = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

        const isExamDay = nextExam && now.toDateString() === nextExam.target.toDateString();
        
        briefContent = `
            <div class="mt-4 p-4 border" style="border-radius: 0.75rem; border-color: rgba(99,102,241,0.2); background: rgba(99,102,241,0.05);">
                <div class="flex justify-between items-center mb-3">
                    <span class="font-bold text-sm tracking-wide">TODAY'S INTEL: <span style="color:var(--accent-indigo)">${todayData.day}</span></span>
                    <div class="flex items-center gap-3">
                        ${streak > 0 ? `<span class="pill pill-amber" title="Operational Streak">🔥 ${streak} DAY STREAK</span>` : ''}
                        <span class="pill pill-indigo">${pct}% DONE</span>
                    </div>
                </div>
                
                <p class="text-sm text-slate-400 mb-3">
                    You have <strong class="text-white">${total - comp} sessions</strong> remaining. 
                    Main Focus: <strong class="text-white">${todayData.sessions[0]?.sub || 'Review'}</strong>. 
                </p>

                <div class="p-3 bg-white/5 rounded-lg mb-4 border-l-2 border-indigo-500/30">
                    <p class="text-[10px] uppercase tracking-widest text-indigo-400 mb-1 font-bold">Tactical Tip</p>
                    <p class="text-xs text-slate-300 italic">${randomTip}</p>
                </div>
                
                <button class="brief-action-btn" style="width: 100%; justify-content: center;" onclick="nav('${isExamDay ? 'survival' : 'timetable'}'); ${isExamDay ? '' : `setTimeout(() => document.getElementById('anchor-day-${dIdx}')?.scrollIntoView({behavior:'smooth'}), 100)`}">
                    ${isExamDay ? 'View Exam Routine' : "Jump to Today's Tasks"}
                </button>
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
    
    // Check backwards from today
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dStr = d.toDateString();
        const dIdx = timetableData.findIndex(day => new Date(day.date).toDateString() === dStr);
        
        if (dIdx !== -1) {
            let dayDone = false;
            // A day counts if at least one session is checked
            timetableData[dIdx].sessions.forEach((_, sIdx) => {
                if (localStorage.getItem(`check-${dIdx}-${sIdx}`) === 'true') dayDone = true;
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
        const isChecked = localStorage.getItem(uid) === 'true';
        const isLocked = isDateLocked(item.date);
        
        return `
        <div class="task-row ${isChecked ? 'completed' : ''} ${isLocked ? 'day-locked' : ''}" id="row-${uid}" onclick="toggleSurvivalTask('${uid}', this, ${idx}, 'night')" style="border-radius: 0; border-bottom: 1px solid var(--glass-border); position: relative;">
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
        const isChecked = localStorage.getItem(uid) === 'true';
        const isLocked = isDateLocked(item.date);
        
        return `
        <div class="task-row ${isChecked ? 'completed' : ''} ${isLocked ? 'day-locked' : ''}" id="row-${uid}" onclick="toggleSurvivalTask('${uid}', this, ${idx}, 'morn')" style="border-radius: 0; border-bottom: 1px solid var(--glass-border); position: relative;">
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

    const isCurrentlyChecked = localStorage.getItem(uid) === 'true';
    const newChecked = !isCurrentlyChecked;
    
    localStorage.setItem(uid, newChecked);
    rowEl.classList.toggle('completed', newChecked);
    if (newChecked) showToast("Protocol objective achieved!", 'success');
    updateAllProgress(); // Trigger global progress update
}



// ── Animated star-field canvas ──
function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let stars  = [];
    let W, H;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function createStars(n) {
        stars = Array.from({ length: n }, () => ({
            x:  Math.random() * W,
            y:  Math.random() * H,
            r:  Math.random() * 1.3 + 0.2,
            a:  Math.random(),
            da: (Math.random() - 0.5) * 0.005,
            vx: (Math.random() - 0.5) * 0.04,
            vy: (Math.random() - 0.5) * 0.04,
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        stars.forEach(s => {
            s.a  += s.da;
            if (s.a < 0 || s.a > 1) s.da *= -1;
            s.x  = (s.x + s.vx + W) % W;
            s.y  = (s.y + s.vy + H) % H;

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(148,163,184,${s.a * 0.7})`;
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }

    resize();
    createStars(200);
    draw();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resize();
            createStars(200);
        }, 200); // Throttled to 200ms
    });
}

// ── Final Premium Polish: Console Signature ──
function initConsoleSignature() {
    const style1 = 'background: #060d1f; color: #6366f1; font-size: 14px; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px; border: 1px solid #6366f1;';
    const style2 = 'background: #6366f1; color: #fff; font-size: 14px; font-weight: bold; padding: 4px 8px; border-radius: 0 4px 4px 0; border: 1px solid #6366f1;';
    console.log('%c BCS PLANNER %c AUTHENTICATED: PRAMESH BHURTEL ', style1, style2);
    console.log('%c[SYSTEM] Initializing strategic study environment...', 'color: #10b981; font-family: monospace;');
}

// ── Final Premium Polish: Swipe Navigation ──
function initSwipeNavigation() {
    const main = document.querySelector('main');
    if (!main) return;

    let touchStartX = 0;
    let touchStartY = 0;
    const sections = ['overview', 'targets', 'timetable', 'survival'];

    main.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    main.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Threshold of 100px for intentional swipe, and ensure it's mostly horizontal
        if (Math.abs(deltaX) > 100 && Math.abs(deltaX) > Math.abs(deltaY)) {
            const activeSec = document.querySelector('.view-section.active');
            if (!activeSec) return;

            const currentIndex = sections.indexOf(activeSec.id);
            if (currentIndex === -1) return;

            if (deltaX < 0) {
                // Swipe Left -> Next Section
                if (currentIndex < sections.length - 1) {
                    nav(sections[currentIndex + 1]);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } else {
                // Swipe Right -> Previous Section
                if (currentIndex > 0) {
                    nav(sections[currentIndex - 1]);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        }
    }, { passive: true });
}

