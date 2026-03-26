// Gallery.js 1442:0324
// Dynamically load gallery images from the 'gallery' folder
// and handle grayscale-to-color, popup modal, and back-to-top button

// About Me modal logic (available globally)
window.openAboutMe = function() {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImg');
  // Remove image and insert custom About Me overlay
  modalImg.style.display = 'none';
  let aboutOverlay = document.getElementById('aboutMeOverlay');
  if (!aboutOverlay) {
    aboutOverlay = document.createElement('div');
    aboutOverlay.id = 'aboutMeOverlay';
    aboutOverlay.innerHTML = `
      <div class="aboutme-bg-blur"></div>
      <div class="aboutme-content">
        <img src="aboutme/Aboutme500.jpg" class="aboutme-main-img" alt="About Missy" />
        <div class="aboutme-main-text">
          <h2>About Missy</h2>
          <p>Missy is a Daughter, a Mother, and a Child of God. Missy loves her family and animals. She also loves to meet new people and make new friends. Even her business is focused on people, giving her the opportunity to meet new people. She has made a difference in many lives.</p>
          <blockquote>"I love God, friends, family & animals. I love to paint & write poetry. I especially love to be free."</blockquote>
        </div>
      </div>
      <button id="aboutMeCloseBtn" class="aboutme-close-btn">&times;</button>
    `;
    modal.appendChild(aboutOverlay);
  }
  aboutOverlay.style.display = 'flex';
  modal.style.display = 'flex';
  // Close logic
  document.getElementById('aboutMeCloseBtn').onclick = function() {
    aboutOverlay.style.display = 'none';
    modal.style.display = 'none';
    modalImg.style.display = '';
  };
  modal.onclick = function(e) {
    if (e.target === modal) {
      aboutOverlay.style.display = 'none';
      modal.style.display = 'none';
      modalImg.style.display = '';
    }
  };
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
        img.loading = 'lazy';
        img.decoding = 'async';
        img.className = 'gallery-thumb';
        img.alt = `Artwork ${imgIndex}`;
        img.sizes = '(max-width:900px) 90vw, 180px';
        img.srcset = imgPath + ' 800w';
        // assign handlers before setting src to avoid missing load events when cached
        img.onload = function () {
          try{
            if (!document.querySelector(`[src="${imgPath}"]`)) {
              if (isVisited(imgPath)) {
                img.classList.add('visited');
              }
              galleryGrid.appendChild(img);
              console.debug('Gallery: loaded', imgPath);
            }
          }catch(e){ console.warn('gallery img onload handler error', e); }
        };
        img.onerror = function (e) { console.debug('Gallery: failed to load', imgPath, e); };
        img.addEventListener('click', function () {
          openModal(imgPath, img);
        });
        img.src = imgPath;
      }
      imgIndex++;
      setTimeout(tryLoadNext, 30);
    }
    tryLoadNext();

    // If no images are found after a short load period, show a helpful placeholder message
    setTimeout(function(){
      try{
        if(galleryGrid && galleryGrid.children.length === 0){
          const p = document.createElement('p');
          p.textContent = 'No gallery images were found. Place images in /Gallery named Gallery1.jpg or Gallery1.png, Gallery2.jpg/png, etc.';
          p.style.color = '#444'; p.style.padding = '2rem'; p.style.textAlign = 'center'; p.style.fontSize = '1.05rem';
          galleryGrid.appendChild(p);
        }
      }catch(e){}
    }, 1500);
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
