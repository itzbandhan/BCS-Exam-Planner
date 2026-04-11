// ============================================================
// TARGETS.JS — Section C High-Yield Topic Mastery
// Interface for mapping syllabus targets to mastery state
// ============================================================

function renderSubjects() {
    const tabsEl    = document.getElementById('subject-tabs');
    const contentEl = document.getElementById('subject-content');
    if (!tabsEl || !contentEl) return;

    tabsEl.innerHTML = '';
    const keys = Object.keys(subjectsData);

    keys.forEach((key, i) => {
        const sub = subjectsData[key];
        const btn = document.createElement('button');
        btn.className   = 'subject-tab';
        btn.textContent = sub.shortTitle;
        btn.dataset.key = key;
        btn.onclick = () => selectSubject(key);
        tabsEl.appendChild(btn);
        if (i === 0) selectSubject(key);
    });
}

function selectSubject(key) {
    // Update tab active state
    document.querySelectorAll('.subject-tab').forEach(t => {
        t.classList.toggle('active-tab', t.dataset.key === key);
    });

    const sub     = subjectsData[key];
    const targetEl = document.getElementById('subject-content');
    if (!targetEl) return;

    // Build mastery progress
    const mastered = sub.targets.filter(t => localStorage.getItem(`mastery_${t.id}`) === 'true').length;
    const total    = sub.targets.length;
    const pct      = Math.round((mastered / total) * 100);

    let html = `
        <div class="tab-content-area animate-subject-in">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div class="flex-1">
                    <h2 class="text-xl font-bold" style="color:${sub.accentColor}">${sub.title}</h2>
                    <p class="text-sm text-slate-400 mt-1">Click a topic to toggle mastery — saved automatically</p>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-mono font-bold" style="color:${sub.accentColor}">${mastered}/${total}</div>
                    <div class="text-xs text-slate-500 uppercase tracking-wider">mastered</div>
                </div>
            </div>

            <!-- Mastery progress bar -->
            <div class="progress-track mb-6" style="background:rgba(255,255,255,0.04)">
                <div class="progress-fill" id="mastery-progress-bar" style="width:0%; background: linear-gradient(90deg, ${sub.accentColor}aa, ${sub.accentColor})"></div>
            </div>

            <!-- Target cards grid -->
            <div class="grid-responsive grid-md-2" style="gap: 1rem;">`;

    sub.targets.forEach(target => {
        const isMastered = localStorage.getItem(`mastery_${target.id}`) === 'true';
        html += `
            <div class="target-card ${isMastered ? 'mastered' : ''}" onclick="toggleMastery('${target.id}', this, '${key}')" data-target-id="${target.id}" style="border-color:${isMastered ? sub.accentColor + '55' : 'var(--glass-border)'}">
                <div class="flex items-start gap-3">
                    <div class="mastery-dot" style="background:${isMastered ? sub.accentColor : 'rgba(255,255,255,0.1)'}; ${isMastered ? `box-shadow: 0 0 10px ${sub.accentColor}66` : ''}; margin-top: 5px;"></div>
                    <div class="flex-1">
                        <h3 class="font-bold text-sm mb-1" style="color:${isMastered ? '#fff' : 'var(--text-primary)'}">${target.title}</h3>
                        <p class="text-slate-400 text-xs leading-relaxed">${target.desc}</p>
                    </div>
                </div>
            </div>`;
    });

    html += `</div></div>`;
    targetEl.innerHTML = html;

    // Trigger animation frame for progress bar to grow smoothly
    setTimeout(() => {
        const bar = document.getElementById('mastery-progress-bar');
        if (bar) bar.style.width = `${pct}%`;
    }, 50);
}

function toggleMastery(targetId, el, subjectKey) {
    const isMastered = el.classList.contains('mastered');
    const newState = !isMastered;
    localStorage.setItem(`mastery_${targetId}`, newState);

    // Regenerate subject view to refresh mastery count/progress
    selectSubject(subjectKey);
}
