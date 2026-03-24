// Gallery.js 1442:0324
// Dynamically load gallery images from the 'gallery' folder
// and handle grayscale-to-color, popup modal, and back-to-top button

// About Me modal logic (available globally)
window.openAboutMe = function() {
  // Try both .jpg and .png, prefer .png if it exists
  const aboutmeJpg = 'aboutme/Aboutme500.jpg';
  const aboutmePng = 'aboutme/Aboutme500.png';
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImg');
  function showAboutMe(src) {
    modal.style.display = 'flex';
    modalImg.src = src;
    modalImg.style.height = '90vh';
    modalImg.style.width = 'auto';
    modalImg.style.maxHeight = '90vh';
    modalImg.style.maxWidth = 'unset';
    modalImg.style.objectFit = 'contain';
    modalImg.style.borderRadius = '1.2rem';
    modalImg.style.background = '#fff';
    modalImg.style.display = 'block';
    modalImg.style.margin = '0 auto';
    modalImg.style.boxShadow = '0 2px 16px #0002';
    modalImg.style.position = 'relative';
    modalImg.style.top = '0';
    modalImg.style.left = '0';
    modalImg.style.right = '0';
    modalImg.style.bottom = '0';
    modalImg.style.padding = '0';
    modalImg.style.overflow = 'auto';
    modalImg.parentElement.style.alignItems = 'center';
    modalImg.parentElement.style.justifyContent = 'center';
    modalImg.parentElement.style.overflowY = 'auto';
    modalImg.parentElement.style.overflowX = 'auto';

    // Add floating close button at bottom right if not present
    let floatingClose = document.getElementById('floatingCloseBtn');
    if (!floatingClose) {
      floatingClose = document.createElement('button');
      floatingClose.id = 'floatingCloseBtn';
      floatingClose.innerHTML = '&times;';
      floatingClose.style.position = 'fixed';
      floatingClose.style.bottom = '32px';
      floatingClose.style.right = '32px';
      floatingClose.style.zIndex = '9999';
      floatingClose.style.background = '#fff';
      floatingClose.style.color = '#111';
      floatingClose.style.fontSize = '2.2rem';
      floatingClose.style.border = '2px solid #00e6e6';
      floatingClose.style.borderRadius = '50%';
      floatingClose.style.width = '48px';
      floatingClose.style.height = '48px';
      floatingClose.style.boxShadow = '0 2px 12px #0004';
      floatingClose.style.cursor = 'pointer';
      floatingClose.style.display = 'none';
      document.body.appendChild(floatingClose);
    }
    function closeModal() {
      modal.style.display = 'none';
      modalImg.src = '';
      // Reset styles
      modalImg.removeAttribute('style');
      modalImg.parentElement.style.alignItems = '';
      modalImg.parentElement.style.justifyContent = '';
      modalImg.parentElement.style.overflowY = '';
      floatingClose.style.display = 'none';
      let scrollInd = document.getElementById('scrollIndicator');
      if (scrollInd) scrollInd.remove();
    }
    // Attach close handler to all .close buttons in the modal
    document.querySelectorAll('.close').forEach(btn => {
      btn.onclick = closeModal;
    });
    floatingClose.onclick = closeModal;
    modal.onclick = function (e) {
      if (e.target === modal) closeModal();
    };
    // Show floating close button when modal is open
    floatingClose.style.display = 'block';

    // Add scroll indicator if image is tall
    setTimeout(() => {
      let scrollInd = document.getElementById('scrollIndicator');
      if (modalImg.scrollHeight > window.innerHeight + 40) {
        if (!scrollInd) {
          scrollInd = document.createElement('div');
          scrollInd.id = 'scrollIndicator';
          scrollInd.innerHTML = '&#8595; Scroll Down';
          scrollInd.style.position = 'fixed';
          scrollInd.style.left = '50%';
          scrollInd.style.top = 'calc(100vh - 80px)';
          scrollInd.style.transform = 'translateX(-50%)';
          scrollInd.style.background = 'rgba(255,255,255,0.9)';
          scrollInd.style.color = '#00e6e6';
          scrollInd.style.fontSize = '1.3rem';
          scrollInd.style.padding = '0.5rem 1.2rem';
          scrollInd.style.borderRadius = '1.2rem';
          scrollInd.style.boxShadow = '0 2px 8px #0002';
          scrollInd.style.zIndex = '9998';
          document.body.appendChild(scrollInd);
        } else {
          scrollInd.style.display = 'block';
        }
      } else if (scrollInd) {
        scrollInd.style.display = 'none';
      }
    }, 300);
  }
  // Try to load .png first, fallback to .jpg
  const testImg = new window.Image();
  testImg.onload = function() { showAboutMe(aboutmePng); };
  testImg.onerror = function() { showAboutMe(aboutmeJpg); };
  testImg.src = aboutmePng;
};

document.addEventListener('DOMContentLoaded', function () {

  // --- Gallery Image Loader ---
  const galleryGrid = document.getElementById('gallery-grid');
  if (galleryGrid) {
    const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    let imgIndex = 1;
    // Track visited images in localStorage
    let visited = JSON.parse(localStorage.getItem('visitedGalleryImgs') || '{}');
    function markVisited(imgPath) {
      visited[imgPath] = true;
      localStorage.setItem('visitedGalleryImgs', JSON.stringify(visited));
    }
    function isVisited(imgPath) {
      return visited[imgPath];
    }
    function tryLoadNext() {
      if (imgIndex > 100) return;
      for (let ext of extensions) {
        const imgPath = `Gallery/Gallery${imgIndex}.${ext}`;
        const img = new window.Image();
        img.src = imgPath;
        img.className = 'gallery-thumb';
        img.alt = `Artwork ${imgIndex}`;
        img.onload = function () {
          if (!document.querySelector(`[src='${imgPath}']`)) {
            if (isVisited(imgPath)) {
              img.classList.add('visited');
            }
            galleryGrid.appendChild(img);
          }
        };
        img.onerror = function () {};
        img.addEventListener('click', function () {
          openModal(imgPath, img);
        });
      }
      imgIndex++;
      setTimeout(tryLoadNext, 30);
    }
    tryLoadNext();
  }

  // --- Modal Popup ---
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImg');
  window.openModal = function openModal(src, thumbImg) {
    const closeBtn = document.querySelector('.close');
    if (!modal || !modalImg || !closeBtn) return;
    modal.style.display = 'flex';
    modalImg.src = src;
    // When closed, mark as visited
    function closeModal() {
      modal.style.display = 'none';
      modalImg.src = '';
      markVisited(src);
      // Update all thumbs with this src
      document.querySelectorAll(`img[src='${src}']`).forEach(img => img.classList.add('visited'));
    }
    closeBtn.onclick = closeModal;
    modal.onclick = function (e) {
      if (e.target === modal) closeModal();
    };
  }

  // --- Back to Top Button ---
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 200) {
        backToTop.style.display = 'block';
      } else {
        backToTop.style.display = 'none';
      }
    });
    backToTop.onclick = function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    backToTop.style.display = 'none';
  } else {
    console.warn("Element with ID 'backToTop' not found. Back to Top button functionality will not be initialized.");
  }

  // --- About Panels Scroll Snap & Color ---
  // (No changes needed for About Me image display)
});
