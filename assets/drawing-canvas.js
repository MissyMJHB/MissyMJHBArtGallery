// drawing-canvas.js: Permanent color drawing with pen/marker/crayon and color picker
window.addEventListener('DOMContentLoaded', function () {
  // Only run on blank-canvas.html (white drawing page)
  if (!document.body.classList.contains('blank-bg')) return;

  // Use the existing canvas in the HTML
  let canvas = document.getElementById('draw-canvas');
  function resizeCanvas() {
    // Set canvas size to match its CSS size
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== Math.round(rect.width) || canvas.height !== Math.round(rect.height)) {
      canvas.width = Math.round(rect.width);
      canvas.height = Math.round(rect.height);
    }
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Use the existing color picker and tool select from the HTML
  let colorInput = document.getElementById('color-picker');
  let toolSelect = document.getElementById('tool-select');

  // Drawing logic
  let ctx = canvas.getContext('2d');
  let drawing = false;
  let lastX = 0, lastY = 0;
  let tool = toolSelect ? toolSelect.value : 'pen';
  let color = colorInput ? colorInput.value : '#000000';

  if (colorInput) {
    colorInput.addEventListener('input', e => {
      color = e.target.value;
    });
  }
  if (toolSelect) {
    toolSelect.addEventListener('change', e => {
      tool = e.target.value;
    });
  }

  function getLineWidth() {
    if (tool === 'pen') return 2;
    if (tool === 'marker') return 16;
    if (tool === 'crayon') return 10;
    return 2;
  }
  function getAlpha() {
    if (tool === 'pen') return 1.0;
    if (tool === 'marker') return 0.3;
    if (tool === 'crayon') return 0.7;
    return 1.0;
  }
  function getCrayonPattern() {
    // Simple crayon effect: use a rough lineDash
    ctx.setLineDash([2, 6]);
  }
  function clearPattern() {
    ctx.setLineDash([]);
  }

  canvas.addEventListener('mousedown', e => {
    // Block drawing if starting on sidebar (x < 180)
    if (e.offsetX < 180) {
      drawing = false;
      return;
    }
    drawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
  });
  canvas.addEventListener('mousemove', e => {
    if (!drawing) return;
    // Block drawing if moving into sidebar
    if (e.offsetX < 180) {
      drawing = false;
      return;
    }
    ctx.save();
    ctx.globalAlpha = getAlpha();
    ctx.strokeStyle = color;
    ctx.lineWidth = getLineWidth();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (tool === 'crayon') getCrayonPattern();
    else clearPattern();
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.restore();
    lastX = e.offsetX;
    lastY = e.offsetY;
  });
  canvas.addEventListener('mouseup', () => { drawing = false; });
  canvas.addEventListener('mouseleave', () => { drawing = false; });

  // Touch support
  canvas.addEventListener('touchstart', e => {
    if (e.touches.length > 0) {
      let rect = canvas.getBoundingClientRect();
      let x = e.touches[0].clientX - rect.left;
      if (x < 180) {
        drawing = false;
        return;
      }
      drawing = true;
      lastX = x;
      lastY = e.touches[0].clientY - rect.top;
    }
  });
  canvas.addEventListener('touchmove', e => {
    if (!drawing || e.touches.length === 0) return;
    let rect = canvas.getBoundingClientRect();
    let x = e.touches[0].clientX - rect.left;
    let y = e.touches[0].clientY - rect.top;
    if (x < 180) {
      drawing = false;
      return;
    }
    ctx.save();
    ctx.globalAlpha = getAlpha();
    ctx.strokeStyle = color;
    ctx.lineWidth = getLineWidth();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (tool === 'crayon') getCrayonPattern();
    else clearPattern();
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();
    lastX = x;
    lastY = y;
    e.preventDefault();
  }, {passive: false});
  canvas.addEventListener('touchend', () => { drawing = false; });
  canvas.addEventListener('touchcancel', () => { drawing = false; });
});
