// home-anim.js: Color wave reveal for home page using a moving linear-gradient mask
window.addEventListener('DOMContentLoaded', function () {
  // Only run on home page
  if (!document.body.classList.contains('home-bg')) return;
  // Remove any existing color wave bar (SVG mask)
  var oldBar = document.querySelector('.color-wave-bar');
  if (oldBar) oldBar.remove();

  // Add a .color-reveal overlay if not present
  var reveal = document.querySelector('.color-reveal');
  if (!reveal) {
    reveal = document.createElement('div');
    reveal.className = 'color-reveal';
    document.body.appendChild(reveal);
  }
  // Set up the color-reveal overlay for home-bg.jpg
  reveal.style.position = 'fixed';
  reveal.style.top = '0';
  reveal.style.left = '0';
  reveal.style.width = '100vw';
  reveal.style.height = '100vh';
  reveal.style.background = "url('assets/home-bg.jpg') center center/cover no-repeat";
  reveal.style.zIndex = '1';
  reveal.style.pointerEvents = 'none';

  // Animate the color wave using a linear-gradient mask
  var waveWidth = 180; // px
  var duration = 2000; // ms
  var interval = 4000; // ms between waves

  function animateWave() {
    var start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var pos = progress * window.innerWidth;
      var left = Math.max(0, pos - waveWidth / 2);
      var right = Math.min(window.innerWidth, pos + waveWidth / 2);
      var percentLeft = (left / window.innerWidth) * 100;
      var percentRight = (right / window.innerWidth) * 100;
      var mask = `linear-gradient(90deg, transparent 0%, transparent ${percentLeft}%, black ${percentLeft}%, black ${percentRight}%, transparent ${percentRight}%, transparent 100%)`;
      reveal.style.webkitMaskImage = mask;
      reveal.style.maskImage = mask;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Reset to fully masked after wave
        reveal.style.webkitMaskImage = 'linear-gradient(90deg, transparent 0%, transparent 100%)';
        reveal.style.maskImage = 'linear-gradient(90deg, transparent 0%, transparent 100%)';
      }
    }
    requestAnimationFrame(step);
  }
  setInterval(animateWave, interval);
  animateWave();
});
