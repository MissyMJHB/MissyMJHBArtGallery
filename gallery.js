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

function initGallery() {
  console.debug('gallery.js: initGallery fired');
  const galleryGrid = document.getElementById('gallery-grid');
  
  if (galleryGrid) {
    const maxImages = 100; // Upper limit, but we will stop early if a file is missing
    let visited = JSON.parse(localStorage.getItem('visitedGalleryImgs') || '{}');

    function isVisited(path) { return visited[path]; }
    function markVisited(imgPath) {
      visited[imgPath] = true;
      localStorage.setItem('visitedGalleryImgs', JSON.stringify(visited));
    }


    // Logic to load images one by one until we hit a missing file (e.g. Gallery76.jpg)
    for (let i = 1; i <= maxImages; i++) {
      const imgPath = `Gallery/Gallery${i}.jpg`;
      const img = new Image();
      img.src = imgPath;
      img.className = 'gallery-thumb';
      img.loading = 'lazy';

      img.onload = function() {
        // Only add if not already in the grid (prevents double-triggers)
        if (!document.querySelector(`img[src="${imgPath}"]`)) {
          const item = document.createElement('figure');
          item.className = 'gallery-item';
          
          if (isVisited(imgPath)) {
            img.classList.add('visited');
          }

          item.appendChild(img);
          galleryGrid.appendChild(item);

          // Handle Captions
          (async function(nLocal, container){
            try {
              const capPath = `Gallery/captions/Gallery${nLocal}.txt`;
              const resp = await fetch(capPath);
              if(resp && resp.ok){
                const txt = (await resp.text()).trim();
                if(txt){
                  const figcap = document.createElement('figcaption');
                  figcap.className = 'gallery-caption';
                  figcap.textContent = txt;
                  container.appendChild(figcap);
                }
              }
            } catch(e) { console.debug('Caption fetch error', e); }
          })(i, item);

          // Modal Listener
          img.addEventListener('click', () => {
             if (typeof openModal === 'function') openModal(imgPath, img);
          });
          
          console.debug('Gallery: appended', imgPath);
        }
      };

      img.onerror = function() {
        // If Gallery76.jpg fails, we stop the debug logs here
        console.debug('Gallery: reached end of folder at index', i);
      };
    }
  }
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
  /*
  // --- Back to Top Button ---
  const backToTop = document.getElementById('backToTop');
  if (backToTop) 
    {
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
    */

  // --- About Panels Scroll Snap & Color ---
  // (No changes needed for About Me image display)

// Run gallery init on DOMContentLoaded or immediately if already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGallery);
} else {
  initGallery();
}
