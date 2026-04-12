// TIMETABLE.JS — Daily checklist + progress tracking
// FIX: Rendered once (idempotent), state stored in PlannerStorage
// ============================================================

let _timetableRendered = false;

function renderTimetable() {
    if (_timetableRendered) return;   // Never re-render the DOM — avoids state wipe
    _timetableRendered = true;

    const container = document.getElementById('timetable-container');
    if (!container) return;

    let html = '';
    timetableData.forEach((dayObj, dIdx) => {
        const isToday  = new Date().toDateString() === new Date(dayObj.date).toDateString();
        const isLocked = isDateLocked(dayObj.date);

        html += `
        <div class="glass-card overflow-hidden flex flex-col h-full ${isToday ? 'today-card' : ''} ${isLocked ? 'day-locked' : ''}" id="day-card-${dIdx}" style="position:relative">
            <span id="anchor-day-${dIdx}" style="position:absolute; top:-120px"></span>
            ${isToday ? '<div class="today-badge">TODAY</div>' : ''}
            ${isLocked ? `<div class="locked-badge">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7z"/></svg> 
                LOCKED
            </div>` : ''}

            <!-- Day header -->
            <div class="flex justify-between items-center px-4 py-3" style="background:rgba(255,255,255,0.04); border-bottom:1px solid rgba(255,255,255,0.07)">
                <div>
                    <div class="text-sm font-bold text-white">${dayObj.day}</div>
                    <div class="text-xs" style="color:#4b6080">${dayObj.date}</div>
                </div>
                ${dayObj.subtitle ? `<span class="pill pill-indigo">${dayObj.subtitle}</span>` : ''}
            </div>

            <!-- Sessions -->
            <div class="flex-1 p-3 space-y-2">`;

        dayObj.sessions.forEach((sess, sIdx) => {
            const uid       = `check-${dIdx}-${sIdx}`;
            const isChecked = PlannerStorage.get(uid) === 'true';
            html += `
                <div class="task-row ${isChecked ? 'completed' : ''}" id="row-${uid}" onclick="toggleTask('${uid}', this, ${dIdx})">
                    <input type="checkbox" id="${uid}" ${isChecked ? 'checked' : ''} class="task-check" aria-label="${sess.sub}: ${sess.task}">
                    <div class="custom-check">
                        <svg class="check-svg" viewBox="0 0 12 10">
                            <polyline points="1,5 4.5,9 11,1"/>
                        </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex flex-wrap gap-1-5 mb-1">
                            <span class="pill pill-indigo">${sess.s}</span>
                            <span class="pill pill-violet">${sess.sub}</span>
                        </div>
                        <p class="task-text text-xs leading-relaxed text-slate-400">${sess.task}</p>
                    </div>
                </div>`;
        });

        html += `
            </div>

            <!-- Day progress bar -->
            <div class="px-4 pb-4 pt-2" style="border-top:1px solid rgba(255,255,255,0.05)">
                <div class="flex justify-between text-xs mb-1" style="color:#4b6080">
                    <span>Progress</span>
                    <span id="progress-text-${dIdx}">0%</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" id="progress-bar-${dIdx}" style="width:0%"></div>
                </div>
            </div>
        </div>`;
    });

    container.innerHTML = html;
    
    // Trigger progress update in next animation frame to allow CSS transitions
    setTimeout(() => {
        updateAllProgress();
    }, 50);
}

function toggleTask(uid, rowEl, dIdx) {
    const checkbox = document.getElementById(uid);
    if (!checkbox) return;

    // Strict Future-Lock validation fallback
    const splits = uid.split('-'); // check-dIdx-sIdx
    if (splits.length === 3) {
        const targetDay = timetableData[parseInt(splits[1])];
        if (targetDay && isDateLocked(targetDay.date)) {
            const info = getCountdownText(targetDay.date);
            showToast(info, 'locked');
            return; // End execution immediately 
        }
    }

    // Toggle state
    const newChecked = !checkbox.checked;
    checkbox.checked = newChecked;
    PlannerStorage.set(uid, newChecked);

    // Toggle CSS class for visual strike-through + check icon
    rowEl.classList.toggle('completed', newChecked);

    // Check if the entire day is completed
    if (newChecked && dIdx !== undefined) {
        const dayObj = timetableData[dIdx];
        let allCompleted = true;
        for (let sIdx = 0; sIdx < dayObj.sessions.length; sIdx++) {
            if (PlannerStorage.get(`check-${dIdx}-${sIdx}`) !== 'true') {
                allCompleted = false;
                break;
            }
        }
        if (allCompleted) {
            showToast("Day Complete! Excellent work.", 'success');
            if (typeof triggerConfetti === 'function') triggerConfetti();
        } else {
            showToast("Task marked as complete!", 'success');
        }
    }

    updateAllProgress();
}

function updateAllProgress() {
    let totalTasks     = 0;
    let completedTasks = 0;

    const tData = window.timetableData || [];
    const sData = window.subjectsData || {};

    tData.forEach((dayObj, dIdx) => {
        let   dayComplete = 0;

        dayObj.sessions.forEach((_, sIdx) => {
            totalTasks++;
            if (PlannerStorage.get(`check-${dIdx}-${sIdx}`) === 'true') {
                completedTasks++;
                dayComplete++;
            }
        });
        
        // Update dashboard bubble (mobile/desktop counters if they exist)
        const dot = document.getElementById(`dot-${dIdx}`);
        if (dot) {
            dot.classList.toggle('dot-completed', dayComplete === dayObj.sessions.length);
        }
    });

    // Add Mastery Targets to Overall Count
    Object.keys(sData).forEach(key => {
        const sub = sData[key];
        totalTasks += (sub.targets || []).length;
        (sub.targets || []).forEach(target => {
            if (PlannerStorage.get(`mastery_${target.id}`) === 'true') completedTasks++;
        });
    });

    // Also count Morning/Night review tasks
    (window.eveningFocus || []).forEach((_, idx) => {
        totalTasks++;
        if (PlannerStorage.get(`night-${idx}`) === 'true') completedTasks++;
    });
    (window.morningReview || []).forEach((_, idx) => {
        totalTasks++;
        if (PlannerStorage.get(`morn-${idx}`) === 'true') completedTasks++;
    });

    const pct = totalTasks > 0 ? Math.round((completedTasks/totalTasks)*100) : 0;
    
    // Update Overview Cards
    const barEl  = document.getElementById('overall-progress-bar');
    const textEl = document.getElementById('overall-progress-text');
    
    if (barEl)  barEl.style.width = `${pct}%`;
    if (textEl) textEl.textContent = `${completedTasks} of ${totalTasks} tasks complete`;
}

// Subscribe to storage updates for multi-device sync
PlannerStorage.addListener(() => {
    // If we're on the timetable section, we need to refresh the checked states
    // but without wiping the whole DOM if possible. 
    // For now, re-render is safest if idempotent.
    if (document.getElementById('timetable') && document.getElementById('timetable').classList.contains('active')) {
        _timetableRendered = false; // Reset render guard
        renderTimetable();
    } else {
        updateAllProgress();
    }
});

