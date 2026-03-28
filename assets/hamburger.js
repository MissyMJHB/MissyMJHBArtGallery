// Hamburger menu toggle for mobile nav
function toggleHamburgerMenu() {
  const nav = document.querySelector('.side-links');
  nav.classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.getElementById('hamburger-menu-btn');
  if (hamburger) {
    hamburger.addEventListener('click', toggleHamburgerMenu);
  }
});
