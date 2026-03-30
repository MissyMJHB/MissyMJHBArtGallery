document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('reveal-canvas');
    const sparkleContainer = document.getElementById('sparkle-container');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const bwImage = new Image();
    bwImage.src = 'assets/home-bgbw.jpg';

    let revealRadius = 15;
    let mousePos = { x: -300, y: -300 };
    
    // We'll use an offscreen canvas to store revealed parts for perfect resize persistence
    const revealBuffer = document.createElement('canvas');
    const revealCtx = revealBuffer.getContext('2d');

    function resizeCanvas() {
        const oldWidth = canvas.width;
        const oldHeight = canvas.height;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        revealBuffer.width = canvas.width;
        revealBuffer.height = canvas.height;

        if (bwImage.complete) {
            drawCoverImage();
        }
    }

    function drawCoverImage() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // --- Calculate "Cover" coordinates to match background-size: cover ---
        const imgRatio = bwImage.width / bwImage.height;
        const canvasRatio = canvas.width / canvas.height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (imgRatio > canvasRatio) {
            // Image is wider than canvas
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgRatio;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        } else {
            // Image is taller than canvas
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgRatio;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        }

        // Draw the base B&W image
        ctx.drawImage(bwImage, offsetX, offsetY, drawWidth, drawHeight);
        
        // Apply existing reveals from the buffer
        ctx.globalCompositeOperation = 'destination-out';
        ctx.drawImage(revealBuffer, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
    }

    bwImage.onload = () => {
        resizeCanvas();
    };

    window.addEventListener('resize', resizeCanvas);

    function draw(x, y) {
        // Draw to the persistent buffer
        revealCtx.beginPath();
        revealCtx.arc(x, y, revealRadius, 0, Math.PI * 2, true);
        revealCtx.fill();

        // Draw to the visible canvas
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, revealRadius, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
    }

    function createSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;
        sparkleContainer.appendChild(sparkle);
        sparkle.addEventListener('animationend', () => sparkle.remove());
    }

    function handleMove(e) {
        let x, y;
        if (e.touches) {
            e.preventDefault();
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        } else {
            x = e.clientX;
            y = e.clientY;
        }
        
        window.requestAnimationFrame(() => {
            draw(x, y);
            for (let i = 0; i < 2; i++) {
                const angle = Math.random() * Math.PI * 2;
                const sparkleX = x + Math.cos(angle) * revealRadius * 0.8;
                const sparkleY = y + Math.sin(angle) * revealRadius * 0.8;
                createSparkle(sparkleX, sparkleY);
            }
        });
    }

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchmove', handleMove, { passive: false });

    // --- Visit Counter Logic ---
    function updateCounter() {
        const countSpan = document.getElementById('count');
        if (!countSpan) return;

        // Use a simple localStorage counter for now
        // This tracks the individual user's visits to keep it elegant and fast
        let visits = localStorage.getItem('visitCount') || 0;
        visits = parseInt(visits) + 1;
        localStorage.setItem('visitCount', visits);
        
        // Pad the number for that "elegant" look (e.g. 000042)
        countSpan.textContent = visits.toString().padStart(6, '0');
    }
    updateCounter();
});
