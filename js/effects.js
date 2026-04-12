// ============================================================
// EFFECTS.JS — Premium Visual Polish
// Confetti Canvas & Ambient Pulse
// ============================================================

const confettiColors = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#ffffff'];

function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    
    // Only run if not already running
    if (window.confettiActive) return;
    window.confettiActive = true;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height + 10,
            r: Math.random() * 6 + 2,
            dx: Math.random() * 20 - 10,
            dy: Math.random() * -15 - 10,
            color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngleInc: (Math.random() * 0.07) + 0.05,
            tiltAngle: 0
        });
    }

    let angle = 0;
    function renderConfetti() {
        if (!window.confettiActive) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        angle += 0.01;
        
        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            
            p.tiltAngle += p.tiltAngleInc;
            p.y += (Math.cos(angle + p.dx) + 1 + p.r / 2) / 2;
            p.x += Math.sin(angle);
            p.dy += 0.05; // gravity
            p.x += p.dx;
            p.y += p.dy;
            p.tilt = (Math.sin(p.tiltAngle) * 15);

            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
            ctx.stroke();
        }
        
        requestAnimationFrame(renderConfetti);
    }

    renderConfetti();

    // Stop after 3 seconds
    setTimeout(() => {
        window.confettiActive = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 4500);
}

// Trigger urgency ambient glow
function checkUrgency() {
    const now = Date.now();
    const nextExam = examSchedule.find(e => e.target.getTime() > now);
    
    if (nextExam) {
        const hoursLeft = (nextExam.target.getTime() - now) / 3600000;
        if (hoursLeft < 24) {
            document.body.classList.add('urgent-mode');
        } else {
            document.body.classList.remove('urgent-mode');
        }
    }
}

