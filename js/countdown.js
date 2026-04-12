// ============================================================
// COUNTDOWN.JS — Exam countdown timer
// FIX: Uses new Date(year, month-1, day, ...) — no string parsing
// ============================================================

let _countdownTimer = null;
let _lastSeconds = -1;

function initCountdown() {
    updateCountdown();
    _countdownTimer = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const el = document.getElementById('countdown');
    if (!el) return;

    // Find the NEXT upcoming exam
    const now = Date.now();
    const eSchedule = window.examSchedule || [];
    const nextExam = eSchedule.find(e => e.target.getTime() > now);

    if (!nextExam) {
        el.innerHTML = `<span class="text-2xl font-mono">EXAMS COMPLETE — GO CELEBRATE!</span>`;
        clearInterval(_countdownTimer);
        return;
    }

    const distance = nextExam.target.getTime() - now;
    const days    = Math.floor(distance / 86400000);
    const hours   = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000)  / 60000);
    const seconds = Math.floor((distance % 60000)    / 1000);

    const isUrgent = days < 1;
    const digitClass = isUrgent ? 'countdown-urgent' : 'countdown-normal';

    const fmt = (n, unit) => {
        const val = n.toString().padStart(2, '0');
        // Animate only when seconds change (to avoid constant re-render)
        const needsAnim = (unit === 's' && seconds !== _lastSeconds);
        return `<span class="countdown-unit-box">
                    <span class="countdown-digit ${needsAnim ? 'animate-pop' : ''} ${digitClass}">${val}</span>
                    <span class="countdown-unit-label">${unit}</span>
                </span>`;
    };

    _lastSeconds = seconds;

    el.innerHTML = `
        <div class="countdown-wrapper">
            ${fmt(days, 'd')}
            <span class="countdown-colon">:</span>
            ${fmt(hours, 'h')}
            <span class="countdown-colon">:</span>
            ${fmt(minutes, 'm')}
            <span class="countdown-colon">:</span>
            ${fmt(seconds, 's')}
        </div>`;

    // Update the "next exam" label below timer
    const labelEl = document.getElementById('countdown-label');
    if (labelEl) {
        labelEl.textContent = `Next: ${nextExam.subject} — ${nextExam.date}`;
    }
}
