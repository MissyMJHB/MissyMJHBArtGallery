// core.js - Shared unlock, progress dots, and navigation helpers
(function(){
  const VISITED_KEYS = {
    about: 'visited_about',
    gallery: 'visited_gallery',
    contact: 'visited_contact'
  };

  // Utility to safely set localStorage
  function setVisited(key){ try { localStorage.setItem(key,'1'); } catch(e){} }
  function isVisited(key){ try { return localStorage.getItem(key) === '1'; } catch(e){ return false; } }

  // Create or update progress dots next to title
  function ensureProgressDots(){
    const title = document.getElementById('animatedTitle');
    if(!title) return;
    let container = document.getElementById('progressDots');
    if(!container){
      container = document.createElement('div');
      container.id = 'progressDots';
      container.className = 'progress-dots';
      title.insertAdjacentElement('afterend', container);
    }
    // build dots for about, contact, gallery (match order to words if you like)
    const order = ['about','contact','gallery'];
    container.innerHTML = '';
    order.forEach(k => {
      const d = document.createElement('span');
      d.className = 'dot' + (isVisited(VISITED_KEYS[k]) ? ' on' : '');
      d.dataset.target = k;
      container.appendChild(d);
    });
  }

  // Rainbow animation for title spans (id: wordMissy, wordArt, wordGallery)
  const rainbowIntervals = {};
  function applyRainbowIfVisited(id, visited){
    const el = document.getElementById(id);
    if(!el) return;
    if(visited){
      if(rainbowIntervals[id]) return; // already running
      const colors = ['#e6007a', '#00e6e6', '#ffb300', '#7c3aed', '#ff4ecd', '#00c853', '#ff1744'];
      let idx = 0;
      rainbowIntervals[id] = setInterval(()=>{
        el.style.color = colors[idx % colors.length];
        el.style.textShadow = `0 0 8px ${colors[idx % colors.length]}55`;
        idx++;
      }, 180);
    } else {
      if(rainbowIntervals[id]){ clearInterval(rainbowIntervals[id]); delete rainbowIntervals[id]; }
      el.style.color = '';
      el.style.textShadow = '';
    }
  }

  function updateTitleAnimations(){
    applyRainbowIfVisited('wordMissy', isVisited(VISITED_KEYS.about));
    applyRainbowIfVisited('wordArt', isVisited(VISITED_KEYS.contact));
    applyRainbowIfVisited('wordGallery', isVisited(VISITED_KEYS.gallery));
  }

  function updateUnlockState(){
    const ok = isVisited(VISITED_KEYS.about) && isVisited(VISITED_KEYS.contact) && isVisited(VISITED_KEYS.gallery);
    if(ok){ document.body.classList.add('fullcolor'); document.body.classList.remove('grayscale'); }
    else { document.body.classList.add('grayscale'); document.body.classList.remove('fullcolor'); }
    ensureProgressDots();
    updateTitleAnimations();
  }

  // Attach nav click handlers to mark visited when user clicks
  function attachNavHandlers(){
    const about = document.getElementById('aboutLink');
    const gallery = document.getElementById('galleryLink');
    const contact = document.getElementById('contactLink');
    if(about){ about.addEventListener('click', ()=> setVisited(VISITED_KEYS.about)); }
    if(gallery){ gallery.addEventListener('click', ()=> setVisited(VISITED_KEYS.gallery)); }
    if(contact){ contact.addEventListener('click', ()=> setVisited(VISITED_KEYS.contact)); }
  }

  // Also mark visited based on current page pathname (in case user landed directly)
  function markPageVisited(){
    const p = window.location.pathname.toLowerCase();
    if(p.endsWith('gallery.html')) setVisited(VISITED_KEYS.gallery);
    if(p.endsWith('aboutme.html') || p.includes('/aboutme/')) setVisited(VISITED_KEYS.about);
    // Home does not count toward unlock; contact is set when modal opened or contact link clicked
  }

  // Listen for storage events (other tabs) to sync UI
  window.addEventListener('storage', updateUnlockState);

  document.addEventListener('DOMContentLoaded', function(){
    markPageVisited();
    attachNavHandlers();

    // If contact modal opens via click dynamic handlers sometimes not set; try to observe clicks on body for contactLink
    document.body.addEventListener('click', function(e){
      const el = e.target.closest && e.target.closest('#contactLink');
      if(el){ setVisited(VISITED_KEYS.contact); updateUnlockState(); }
    });

    // Small delay to allow any per-page scripts to run before updating
    setTimeout(updateUnlockState, 120);

    // Make progress dots interactive: clicking a dot scrolls to corresponding section if present
    document.addEventListener('click', function(e){
      const dot = e.target.closest && e.target.closest('#progressDots .dot');
      if(dot){ const t = dot.dataset.target; if(t === 'gallery'){ const el = document.getElementById('gallery-grid'); if(el) el.scrollIntoView({behavior:'smooth'}); } }
    });

    // Ensure Missy widget stays visible at the bottom of the viewport (not hidden off-screen)
    function ensureMissyInView(){
      const ids = ['missyCornerWidget','missyArea','missyCornerWidget','missyWidget','missy-corner-widget'];
      let widget = null;
      for(const id of ids){ widget = document.getElementById(id); if(widget) break; }
      if(!widget) {
        // try selecting by class
        widget = document.querySelector('.missy-corner-widget') || document.querySelector('.missy-area');
      }
      if(!widget) return;
      // Force fixed positioning relative to viewport
      widget.style.position = 'fixed';
      widget.style.right = widget.style.right || (Math.max(12, Math.round(window.innerWidth * 0.03)) + 'px');
      // Keep it anchored to visible bottom: choose 2vh or 12px whichever larger
      const bottomPx = Math.max(12, Math.round(window.innerHeight * 0.02));
      widget.style.bottom = bottomPx + 'px';
      widget.style.zIndex = '1000000';
      widget.style.willChange = 'transform';
      widget.style.transform = widget.style.transform || 'translateZ(0)';
      // If widget is inside a container with overflow hidden, re-append to body to avoid clipping
      if(widget.parentElement && widget.parentElement !== document.body){
        try { document.body.appendChild(widget); } catch(e) {}
      }
    }

    // Run on load and on viewport changes
    ensureMissyInView();
    window.addEventListener('resize', ensureMissyInView);
    window.addEventListener('orientationchange', ensureMissyInView);
    document.addEventListener('visibilitychange', ensureMissyInView);
  });

  // Show a fullscreen Oops overlay and coordinate Missy + bubble above it, then redirect
  function showOopsOverlay(opts){
    opts = opts || {};
    const src = opts.src || 'Book/OopsImage.png';
    const showDuration = typeof opts.showDuration === 'number' ? opts.showDuration : 6000; // total time before redirect
    const revealMissyAfter = typeof opts.revealMissyAfter === 'number' ? opts.revealMissyAfter : 700; // ms
    const fadeOutBefore = typeof opts.fadeOutBefore === 'number' ? opts.fadeOutBefore : 1200; // ms before redirect to start fade
    const redirectPages = opts.redirectPages || ['index.html','gallery.html','aboutme/AboutMe.html'];

    // Create overlay container
    let overlay = document.createElement('div');
    overlay.className = 'oops-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'flex-start'; // lock image to top center
    overlay.style.paddingTop = '2vh';
    overlay.style.background = 'rgba(0,0,0,0.0)';
    overlay.style.zIndex = 99990; // keep below Missy (core.ensureMissyInView pushes Missy very high)
    overlay.style.pointerEvents = 'none';
    overlay.style.transition = 'opacity 0.5s ease';

    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Oops!';
    img.style.maxWidth = '96vw';
    img.style.maxHeight = '96vh';
    img.style.borderRadius = '1rem';
    img.style.boxShadow = '0 8px 48px rgba(0,0,0,0.8)';
    img.style.objectFit = 'contain';
    img.style.objectPosition = 'top center';
    img.style.display = 'block';
    img.style.opacity = '1';
    img.style.transition = 'opacity 0.45s ease';

    overlay.appendChild(img);
    document.body.appendChild(overlay);

    // Find Missy and bubble elements (multi-selector for pages)
    const missy = document.querySelector('.missy-corner-img, #missyImg, .missy-img');
    const bubble = document.querySelector('.missy-bubble, .missy-corner-bubble, #missyCornerBubble, #missyBubble');

    // Show Missy color and bubble after a short delay
    const revealTimer = setTimeout(()=>{
      if(missy){ missy.classList.add('color'); missy.style.zIndex = 1000001; }
      if(bubble){
        // set bubble to Oops png if available
        try{ if(bubble.tagName === 'IMG') bubble.src = (opts.bubbleSrc || (src.replace(/OopsImage/i,'BubbleOops').replace('Book/','Book/'))); }
        catch(e){}
        bubble.classList.add('show');
        bubble.style.zIndex = 1000002;
      }
    }, revealMissyAfter);

    // After (showDuration - fadeOutBefore) start fading out overlay image
    const fadeTimer = setTimeout(()=>{
      img.style.opacity = '0';
    }, Math.max(200, showDuration - fadeOutBefore));

    // After showDuration, remove overlay, reset Missy and bubble, then redirect
    const endTimer = setTimeout(()=>{
      try{ if(overlay && overlay.parentElement) overlay.parentElement.removeChild(overlay); }catch(e){}
      if(missy){ missy.classList.remove('color'); }
      if(bubble){ bubble.classList.remove('show'); }

      // pick random redirect not equal current
      const current = window.location.pathname.split('/').pop().toLowerCase();
      const options = redirectPages.filter(p=> !current.includes(p.toLowerCase()));
      const pick = options.length ? options[Math.floor(Math.random()*options.length)] : redirectPages[0];
      window.location.href = pick;
    }, showDuration);

    // Return an object to allow cancellation if desired
    return {
      cancel: function(){ clearTimeout(revealTimer); clearTimeout(fadeTimer); clearTimeout(endTimer); try{ if(overlay.parentElement) overlay.parentElement.removeChild(overlay);}catch(e){} }
    };
  }

  // Expose globally
  window.showOopsOverlay = showOopsOverlay;

})();
