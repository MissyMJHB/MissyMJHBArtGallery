// Trigger the color wave reveal on page load for all non-home pages
window.addEventListener('DOMContentLoaded', function() {
  var reveal = document.querySelector('.color-reveal');
  if (reveal) {
    setTimeout(function() {
      reveal.classList.add('active');
    }, 400); // slight delay for effect
  }
});
