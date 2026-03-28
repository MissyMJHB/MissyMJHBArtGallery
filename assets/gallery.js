// Missy Art Gallery - Gallery Page Script
// Loads images and captions in batches of 10, with a Load More button and grayscale/visited logic



const IMAGES_PER_BATCH = 8;
let currentIndex = 1;
let maxImages = 75; // Set this to the highest gallery number

const galleryGrid = document.getElementById('gallery-grid');
const loadMoreBtn = document.getElementById('loadMoreBtn');

function getVisitedImages() {
  try {
    return JSON.parse(localStorage.getItem('visitedImages') || '[]');
  } catch {
    return [];
  }
}

function setVisitedImages(arr) {
  localStorage.setItem('visitedImages', JSON.stringify(arr));
}

function markVisited(imgNum) {
  const visited = getVisitedImages();
  if (!visited.includes(imgNum)) {
    visited.push(imgNum);
    setVisitedImages(visited);
  }
}

function isVisited(imgNum) {
  return getVisitedImages().includes(imgNum);
}

function createGalleryItem(imgNum) {
  const item = document.createElement('div');
  item.className = 'gallery-item';

  const img = document.createElement('img');
  img.className = 'gallery-thumb' + (isVisited(imgNum) ? ' visited' : '');
  img.src = `gallery/gallery${imgNum}.jpg`;
  img.alt = `Artwork ${imgNum}`;
  img.loading = 'lazy';
  img.addEventListener('click', () => {
    markVisited(imgNum);
    img.classList.add('visited');
    // Optionally: open modal here
  });

  const caption = document.createElement('div');
  caption.className = 'caption';
  fetch(`gallery/captions/gallery${imgNum}.txt`)
    .then(r => r.ok ? r.text() : '')
    .then(text => { caption.textContent = text || `Artwork #${imgNum}`; })
    .catch(() => { caption.textContent = `Artwork #${imgNum}`; });

  item.appendChild(img);
  item.appendChild(caption);
  return item;
}

function loadImages() {
  let loaded = 0;
  for (let i = currentIndex; i < currentIndex + IMAGES_PER_BATCH && i <= maxImages; i++) {
    const imgPath = `gallery/gallery${i}.jpg`;
    fetch(imgPath, { method: 'HEAD' })
      .then(r => {
        if (r.ok) {
          galleryGrid.appendChild(createGalleryItem(i));
          loaded++;
        }
      });
  }
  currentIndex += IMAGES_PER_BATCH;
  // For testing: always show the button
  // if (currentIndex > maxImages) {
  //   loadMoreBtn.style.display = 'none';
  // }
}


if (galleryGrid && loadMoreBtn) {
  loadImages();
  loadMoreBtn.addEventListener('click', loadImages);
}
