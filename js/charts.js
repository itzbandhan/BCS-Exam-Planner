// ============================================================
// CHARTS.JS — Chart.js visualisations
// FIX: Destroy guard + always dark theme
// ============================================================

let _marksChart = null;
let _timeChart  = null;

function initCharts() {
    const canvasMarks = document.getElementById('marksChart');
    const canvasTime  = document.getElementById('timeChart');
    if (!canvasMarks || !canvasTime) return;

    // Destroy stale instances before reinit
    if (_marksChart) { _marksChart.destroy(); _marksChart = null; }
    if (_timeChart)  { _timeChart.destroy();  _timeChart  = null; }

    const textColor   = '#94a3b8';
    const borderColor = 'rgba(6,13,31,0.8)';

    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: textColor, padding: 16, font: { family: 'Space Grotesk', size: 12, weight: '600' } }
            }
        },
        animation: { duration: 900, easing: 'easeOutQuart' }
    };

    // ── Marks Weightage (Doughnut) ──
    _marksChart = new Chart(canvasMarks.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Section A (10 × 2m = 20)', 'Section B (5 × 7m = 35)', 'Section C (3 × 15m = 45)'],
            datasets: [{
                data: [20, 35, 45],
                backgroundColor: ['rgba(100,116,139,0.5)', 'rgba(99,102,241,0.6)', 'rgba(16,185,129,0.8)'],
                borderColor: borderColor,
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            ...baseOptions,
            cutout: '65%',
            plugins: {
                ...baseOptions.plugins,
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.label}: ${ctx.raw} marks`
                    }
                }
            }
        }
    });

    // ── Time Allocation (Doughnut) ──
    _timeChart = new Chart(canvasTime.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Section C mastery (15m topics)', 'Sections A & B review'],
            datasets: [{
                data: [70, 30],
                backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(51,65,85,0.7)'],
                borderColor: borderColor,
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            ...baseOptions,
            cutout: '65%',
            plugins: {
                ...baseOptions.plugins,
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.label}: ${ctx.raw}% of study time`
                    }
                }
            }
        }
    });
}
