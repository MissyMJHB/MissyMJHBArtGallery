// Track page visits and unlock color mode
function markPageVisited(page) {
    localStorage.setItem('visited_' + page, '1');
}

function allPagesVisited() {
    return (
        localStorage.getItem('visited_home') === '1' &&
        localStorage.getItem('visited_gallery') === '1' &&
        localStorage.getItem('visited_about') === '1'
    );
}

function unlockColorMode() {
    localStorage.setItem('missyFullColor', '1');
    localStorage.setItem('siteFullColor', '1');
}

// Mark this page as visited and unlock color if all visited
document.addEventListener('DOMContentLoaded', function () {
    // Detect which page
    const path = window.location.pathname.toLowerCase();
    if (path.endsWith('index.html') || path.endsWith('/')) markPageVisited('home');
    if (path.endsWith('gallery.html')) markPageVisited('gallery');
    if (path.includes('aboutme')) markPageVisited('about');

    // On HOME, if all pages visited and not yet unlocked, unlock color
    if ((path.endsWith('index.html') || path.endsWith('/')) && allPagesVisited() && localStorage.getItem('siteFullColor') !== '1') {
        unlockColorMode();
        // Optionally, show a fun animation or message here
    }
});
// home-anim.js Gallery.js 1442:0324
// Animates the Missy Art Gallery title letters with color flashes

document.addEventListener('DOMContentLoaded', function () {
    // If skipColorWave is set, immediately show full color and skip animation
    if (localStorage.getItem('skipColorWave') === '1') {
        const colorReveal = document.querySelector('.color-reveal');
        if (colorReveal) {
            colorReveal.style.webkitMaskImage = 'none';
            colorReveal.style.maskImage = 'none';
        }
        localStorage.removeItem('skipColorWave');
        // Don't run color wave at all
        return;
    }
    function animateText(elementId, colors) {
        const el = document.getElementById(elementId);
        if (!el) return;
        const text = el.textContent;
        el.innerHTML = '';
        for (let i = 0; i < text.length; i++) {
            const span = document.createElement('span');
            span.textContent = text[i];
            span.style.transition = 'color 0.3s';
            span.style.color = '#111';
            el.appendChild(span);
        }
        const spans = el.querySelectorAll('span');
        let idx = 0;
        setInterval(() => {
            // Animate 1-2 letters at a time, flash in color
            let n = Math.random() < 0.5 ? 1 : 2;
            for (let j = 0; j < n; j++) {
                let pos = (idx + j) % spans.length;
                spans[pos].style.color = colors[(idx + j) % colors.length];
                setTimeout(() => {
                    spans[pos].style.color = '#111';
                }, 300);
            }
            idx = (idx + 1) % spans.length;
        }, 350);
    }
    const colors = ['#e6007a', '#00e6e6', '#ffb300', '#7c3aed', '#ff4ecd'];
    animateText('animatedTitle', colors);
    animateText('animatedSubtitle', colors);

    // Color wave animation for background
    const colorReveal = document.querySelector('.color-reveal');
    if (colorReveal) {
        let waveWidth = 180; // px
        let duration = 2000; // ms

        function animateWave() {
            let start = null;
            function step(timestamp) {
                if (!start) start = timestamp;
                const progress = Math.min((timestamp - start) / duration, 1);
                const pos = progress * window.innerWidth;
                // Animate a moving mask gradient
                const left = Math.max(0, pos - waveWidth / 2);
                const right = Math.min(window.innerWidth, pos + waveWidth / 2);
                const percentLeft = (left / window.innerWidth) * 100;
                const percentRight = (right / window.innerWidth) * 100;
                const mask = `linear-gradient(90deg, transparent 0%, transparent ${percentLeft}%, black ${percentLeft}%, black ${percentRight}%, transparent ${percentRight}%, transparent 100%)`;
                colorReveal.style.webkitMaskImage = mask;
                colorReveal.style.maskImage = mask;
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    // Reset to fully masked after wave
                    colorReveal.style.webkitMaskImage = 'linear-gradient(90deg, transparent 0%, transparent 100%)';
                    colorReveal.style.maskImage = 'linear-gradient(90deg, transparent 0%, transparent 100%)';
                }
            }
            requestAnimationFrame(step);
        }
        setInterval(animateWave, 4000);
        animateWave();
    }
});