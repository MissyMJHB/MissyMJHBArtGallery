document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid = document.getElementById('gallery-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const lightbox = document.getElementById('lightbox-overlay');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeButton = document.getElementById('close-lightbox');

    if (!galleryGrid) return;

    // --- State Management ---
    let imagesLoaded = 0;
    const IMAGES_PER_PAGE = 12;
    let viewedImages = new Set(JSON.parse(localStorage.getItem('viewedImages')) || []);

    // --- Main Function to Display Images ---
    function fetchAndDisplayImages() {
        loadMoreBtn.textContent = 'Loading...';
        loadMoreBtn.disabled = true;

        const startIndex = imagesLoaded;
        const endIndex = startIndex + IMAGES_PER_PAGE;
        const imagesToLoad = galleryData.slice(startIndex, endIndex);

        imagesToLoad.forEach((item, index) => {
            const url = `artgallery/${item.filename}`;
            createGalleryItem(url, item.filename, item.caption);
        });

        imagesLoaded += imagesToLoad.length;

        // Update UI
        if (imagesLoaded >= galleryData.length) {
            loadMoreBtn.classList.add('hidden');
        } else {
            loadMoreBtn.textContent = 'Load More';
            loadMoreBtn.disabled = false;
        }
    }

    // --- Helper Functions ---
    function createGalleryItem(url, filename, caption) {
        const item = document.createElement('div');
        item.className = 'gallery-item';

        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Artwork from the gallery';
        img.loading = 'lazy';

        item.appendChild(img);
        galleryGrid.appendChild(item);

        if (viewedImages.has(filename)) {
            item.classList.add('viewed');
        }

        item.addEventListener('click', () => openLightbox(url, filename, caption, item));
    }

    function openLightbox(url, filename, caption, galleryItem) {
        lightboxImage.src = url;
        lightboxCaption.textContent = caption || "";
        lightbox.style.display = 'flex';

        // Mark as viewed
        if (!viewedImages.has(filename)) {
            viewedImages.add(filename);
            galleryItem.classList.add('viewed');
            localStorage.setItem('viewedImages', JSON.stringify([...viewedImages]));
        }
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
    }

    // --- INITIALIZATION ---
    fetchAndDisplayImages();

    loadMoreBtn.addEventListener('click', fetchAndDisplayImages);
    closeButton.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeLightbox();
    });
});
