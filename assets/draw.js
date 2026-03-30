document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');

    // Toolbar elements
    const toolbar = document.getElementById('draw-toolbar');
    const toolbarHandle = document.getElementById('toolbar-handle');
    const brushTypeSelect = document.getElementById('brush-type');
    const colorPicker = document.getElementById('color-picker');
    const brushSizeSlider = document.getElementById('brush-size');
    const coloringPageSelect = document.getElementById('coloring-page-select');
    const clearBtn = document.getElementById('action-clear');
    const saveBtn = document.getElementById('action-save');
    const undoBtn = document.getElementById('action-undo');

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let undoStack = [];
    const MAX_UNDO = 20;

    // --- Canvas Setup & Persistence ---
    function resizeCanvas() {
        if (canvas.width === 0 || canvas.height === 0) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            return;
        }

        // 1. Capture current content
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0);

        // 2. Resize the main canvas
        const oldWidth = canvas.width;
        const oldHeight = canvas.height;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // 3. Draw back with scaling to maintain relative position
        ctx.drawImage(tempCanvas, 0, 0, oldWidth, oldHeight, 0, 0, canvas.width, canvas.height);
        
        // Re-apply background
        const currentBg = canvas.style.backgroundImage;
        if (currentBg && currentBg !== 'none') {
            // CSS handles this automatically
        }
    }

    window.addEventListener('resize', resizeCanvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // --- Toolbar Interaction ---
    toolbarHandle.addEventListener('click', () => toolbar.classList.toggle('open'));

    // --- Drawing Logic ---
    function getBrushSettings() {
        const type = brushTypeSelect.value;
        const size = parseInt(brushSizeSlider.value);
        const color = colorPicker.value;
        
        let settings = {
            lineWidth: size,
            strokeStyle: color,
            globalAlpha: 1.0,
            lineCap: 'round',
            lineJoin: 'round',
            shadowBlur: 0,
            shadowColor: 'transparent',
            globalCompositeOperation: 'source-over',
            lineDash: []
        };

        if (type === 'pen') {
            settings.lineWidth = Math.max(1, size / 5);
        } else if (type === 'marker') {
            settings.globalAlpha = 0.4;
            settings.lineWidth = size;
        } else if (type === 'crayon') {
            settings.globalAlpha = 0.8;
            settings.shadowBlur = size / 4;
            settings.shadowColor = color;
            settings.lineDash = [2, 4];
        } else if (type === 'airbrush') {
            settings.globalAlpha = 0.1;
            settings.shadowBlur = size;
            settings.shadowColor = color;
            settings.lineWidth = size / 2;
        } else if (type === 'neon') {
            settings.shadowBlur = size;
            settings.shadowColor = color;
            settings.lineWidth = size / 3;
            settings.strokeStyle = '#fff'; // Bright core
        } else if (type === 'erase') {
            settings.globalCompositeOperation = 'destination-out';
            settings.lineWidth = size * 2;
        }

        return settings;
    }

    function startDrawing(e) {
        if (toolbar.contains(e.target)) return;
        isDrawing = true;
        [lastX, lastY] = getCoordinates(e);
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const [x, y] = getCoordinates(e);
        const settings = getBrushSettings();

        ctx.save();
        Object.assign(ctx, settings);
        if (settings.lineDash.length) ctx.setLineDash(settings.lineDash);
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.restore();

        [lastX, lastY] = [x, y];
    }

    function stopDrawing() {
        if (isDrawing) {
            saveToUndoStack();
        }
        isDrawing = false;
        ctx.beginPath(); // Reset path
    }

    function saveToUndoStack() {
        if (undoStack.length >= MAX_UNDO) {
            undoStack.shift(); // Remove oldest
        }
        undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }

    function undo() {
        if (undoStack.length > 0) {
            undoStack.pop(); // Remove current state
            if (undoStack.length > 0) {
                ctx.putImageData(undoStack[undoStack.length - 1], 0, 0);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }

    function getCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        if (e.touches && e.touches.length) {
            return [e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top];
        }
        return [e.clientX - rect.left, e.clientY - rect.top];
    }

    // --- Event Listeners ---
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDrawing);
    
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    // --- Actions ---
    clearBtn.addEventListener('click', () => {
        if (confirm('Clear everything and start over?')) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.backgroundImage = 'none';
            coloringPageSelect.value = '';
        }
    });

    saveBtn.addEventListener('click', () => {
        const container = document.getElementById('draw-container');
        html2canvas(container).then(outputCanvas => {
            const link = document.createElement('a');
            link.download = 'missy-art.png';
            link.href = outputCanvas.toDataURL('image/png');
            link.click();
        });
    });

    undoBtn.addEventListener('click', undo);

    // --- Coloring Pages ---
    coloringPageSelect.addEventListener('change', () => {
        const url = coloringPageSelect.value;
        if (url) {
            canvas.style.backgroundImage = `url("${url}")`;
            canvas.style.backgroundSize = 'contain';
            canvas.style.backgroundPosition = 'center';
            canvas.style.backgroundRepeat = 'no-repeat';
        } else {
            canvas.style.backgroundImage = 'none';
        }
    });
});
