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
    if(ok){ document.body.classList.add('fullcolor'); document.body.classList.remove('site-grayscale'); }
    else { document.body.classList.add('site-grayscale'); document.body.classList.remove('fullcolor'); }
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

    // Remove duplicate Missy widgets created by per-page scripts; keep first canonical widget
    function dedupeMissyWidgets(){
      try{
        const selectors = ['#missyCornerWidget','#missyArea','.missy-corner-widget','.missy-area','#missyWidget','.missy-widget','#missyImg','.missy-img','#missyCornerImg'];
        const found = [];
        selectors.forEach(sel=>{ Array.from(document.querySelectorAll(sel)).forEach(n=>{ if(n && !found.includes(n)) found.push(n); }); });
        if(found.length>1){
          // keep the first visible one (prefer ones appended to body or fixed-root)
          let keeper = found.find(n=>n.closest && n.closest('#missy-fixed-root')) || found[0];
          // remove others
          for(const n of found){ if(n !== keeper){ try{ n.parentNode && n.parentNode.removeChild(n); }catch(e){} } }
        }
        // ensure keeper container has pointerEvents enabled and a reasonable stacking context
        const keeper = document.querySelector('#missyCornerWidget') || document.querySelector('.missy-corner-widget') || document.querySelector('#missyArea') || document.querySelector('.missy-area');
        if(keeper){ try{ keeper.style.pointerEvents='auto'; keeper.style.zIndex='10000'; keeper.style.position='fixed'; keeper.style.right='12px'; keeper.style.bottom='12px'; }catch(e){} }

        // Consolidate and dedupe bubble elements: keep one canonical bubble and move it to fixed-root
        try{
          const bubbleEls = Array.from(document.querySelectorAll('.missy-bubble, .missy-corner-bubble, #missyCornerBubble, #missyBubble'));
          if(bubbleEls.length){
            // prefer bubble already inside missy-fixed-root or keeper
            let canonical = bubbleEls.find(b=> b.closest && b.closest('#missy-fixed-root')) || bubbleEls.find(b=> b.closest && b.closest('#missyCornerWidget')) || bubbleEls[0];
            // remove duplicates
            bubbleEls.forEach(b=>{ if(b !== canonical){ try{ b.parentNode && b.parentNode.removeChild(b); }catch(e){} } });
            // ensure canonical bubble is a direct child of keeper (or missy-fixed-root)
            if(canonical && keeper && canonical.parentNode !== keeper){ try{ keeper.appendChild(canonical); }catch(e){} }
            if(canonical){ try{ canonical.style.position = 'fixed'; canonical.style.pointerEvents = 'none'; canonical.style.zIndex = '10000'; canonical.style.right = canonical.style.right || '110%'; canonical.id = canonical.id || 'missyCornerBubble'; }catch(e){} }
          }
          // ensure Missy image sits above bubble (same stacking context)
          const img = keeper && (keeper.querySelector('.missy-corner-img, #missyImg, .missy-img, #missyCornerImg')) || document.querySelector('#missyImg, .missy-corner-img, .missy-img, #missyCornerImg');
          if(img){ try{ img.style.zIndex = '10005'; img.style.position = img.style.position || 'relative'; img.style.pointerEvents = 'auto'; }catch(e){} }
          // Normalize keeper stacking
          if(keeper){ try{ keeper.style.zIndex = '10000'; }catch(e){} }
        }catch(e){ }
      }catch(e){ console.warn('dedupeMissyWidgets failed', e); }
    }
    dedupeMissyWidgets();

    // Remove duplicate page-specific containers that cause extreme scrolls (e.g., about image container)
    function dedupeGeneric(){
      try{
        const selectors = ['.aboutme-img-container', '.home-bg', '.home-overlay-top', '#gallery-grid'];
        selectors.forEach(sel=>{
          const nodes = Array.from(document.querySelectorAll(sel));
          if(nodes.length>1){
            for(let i=1;i<nodes.length;i++){ try{ nodes[i].parentNode && nodes[i].parentNode.removeChild(nodes[i]); }catch(e){} }
          }
        });
      }catch(e){console.warn('dedupeGeneric failed', e);}    }
    dedupeGeneric();

    // Ensure a canonical Missy widget exists on pages that don't include one
    function ensureCanonicalMissy(){
      try{
        if(document.querySelector('#missyImg, .missy-corner-img, .missy-img, #missyCornerImg')) return; // page already has Missy
        let missyRoot = document.getElementById('missy-fixed-root');
        if(!missyRoot){ missyRoot = document.createElement('div'); missyRoot.id = 'missy-fixed-root'; document.body.appendChild(missyRoot); }
        missyRoot.style.position = 'fixed'; missyRoot.style.right = '12px'; missyRoot.style.bottom = '12px'; missyRoot.style.zIndex = '10000'; missyRoot.style.pointerEvents = 'auto'; missyRoot.style.overflow = 'visible';
        // keeper
        const keeper = document.createElement('div'); keeper.id = 'missyCornerWidget'; keeper.className = 'missy-corner-widget'; keeper.style.position = 'relative'; keeper.style.pointerEvents = 'auto'; keeper.style.display = 'flex'; keeper.style.flexDirection = 'column'; keeper.style.alignItems = 'flex-end';
        // image
        const img = document.createElement('img'); img.id = 'missyCornerImg'; img.className = 'missy-corner-img'; img.src = '/Book/MissyCutOut.png'; img.alt = 'Missy'; img.style.width = '120px'; img.style.pointerEvents = 'auto'; img.tabIndex = 0;
        // bubble
        const bubble = document.createElement('img'); bubble.id = 'missyCornerBubble'; bubble.className = 'missy-corner-bubble missy-bubble bubble-hidden'; bubble.src = '/Book/BubbleHi.png'; bubble.style.position = 'absolute'; bubble.style.right = '110%'; bubble.style.top = '-55px'; bubble.style.pointerEvents = 'none';
        keeper.appendChild(img); keeper.appendChild(bubble); missyRoot.appendChild(keeper);
        // attach simple interactions (hover, leave, click)
        img.addEventListener('mouseenter', function(){ try{ img.classList.add('color'); img.style.filter='none'; if(window.showMissyBubble) window.showMissyBubble(img,bubble,{margin:8}); else if(window.positionMissyBubble) window.positionMissyBubble(img,bubble); }catch(e){} });
        img.addEventListener('mouseleave', function(){ try{ img.classList.remove('color'); img.style.filter='grayscale(1) brightness(0.98)'; }catch(e){} try{ if(bubble._missyHideTimer){ clearTimeout(bubble._missyHideTimer); bubble._missyHideTimer = null; } }catch(e){} bubble.classList.remove('show'); bubble.classList.add('bubble-hidden'); });
        img.addEventListener('click', function(e){ try{ e.preventDefault(); if(window.positionMissyBubble) window.positionMissyBubble(img,bubble); }catch(e){} setTimeout(function(){ try{ const pages = ['/index.html','/gallery.html','/aboutme/AboutMe.html']; const current = window.location.pathname.split('/').pop().toLowerCase(); const filtered = pages.filter(p=> !current.includes(p.toLowerCase())); window.location.href = filtered.length ? filtered[Math.floor(Math.random()*filtered.length)] : pages[0]; }catch(e){} }, 350); });
      }catch(e){ console.warn('ensureCanonicalMissy failed', e); }
    }
    ensureCanonicalMissy();

    // Central helper to show Missy bubble with random content and safe hide timing
    window.showMissyBubble = function(targetEl, bubbleEl, opts){
      try{
        opts = opts || {};
        const choices = [
          {src: '/Book/BubbleHi.png', alt: 'Hi!'},
          {src: '/Book/BubbleClick.png', alt: 'Click me!'},
          {src: '/Book/BubblePretty.png', alt: 'Pretty, isn\'t it?'},
          {src: '/Book/BubbleShowAround.png', alt: 'Let me show you around!'},
          {src: '/Book/BubblePeaceful.png', alt: "It's so peaceful here."},
          {src: '/Book/BubbleFeelFree.png', alt: 'Feel free to explore!'},
          {src: '/Book/BubbleOops.png', alt: 'Oops! Try again!'},
          {src: '/Book/BubbleAuthor.png', alt: 'Author loved my painting'},
          {src: '/Book/BubbleLike.png', alt: 'Do you like this?'}
        ];
        // pick random
        const pick = choices[Math.floor(Math.random() * choices.length)];
        if(bubbleEl && bubbleEl.tagName === 'IMG'){
          bubbleEl.src = pick.src;
          bubbleEl.alt = pick.alt;
        } else if(bubbleEl){
          // try background fallback
          try{ bubbleEl.style.backgroundImage = 'url(' + pick.src + ')'; }catch(e){}
        }
        // position first so it appears in right place
        try{ if(window.positionMissyBubble) window.positionMissyBubble(targetEl, bubbleEl, opts); }catch(e){}
        // show
        try{ console.debug('showMissyBubble: showing bubble', bubbleEl); bubbleEl.classList.remove('bubble-hidden'); bubbleEl.classList.add('show'); }catch(e){}
        // clear existing hide timer
        try{ if(bubbleEl._missyHideTimer){ clearTimeout(bubbleEl._missyHideTimer); bubbleEl._missyHideTimer = null; } }catch(e){}
        // auto-hide after duration
        try{
          console.debug('showMissyBubble: scheduling hide timer (duration=' + (opts.duration||8000) + ') for', bubbleEl);
          if(bubbleEl._missyHideTimer){ clearTimeout(bubbleEl._missyHideTimer); bubbleEl._missyHideTimer = null; }
          bubbleEl._missyHideTimer = setTimeout(function(){ try{ console.debug('showMissyBubble: hide timer firing for', bubbleEl); try{ if(bubbleEl._missyReassertTimer){ clearInterval(bubbleEl._missyReassertTimer); bubbleEl._missyReassertTimer = null; } }catch(e){} bubbleEl.classList.remove('show'); bubbleEl.classList.add('bubble-hidden'); }catch(e){} bubbleEl._missyHideTimer = null; }, opts.duration || 8000);
          // Re-assert inline styles briefly to prevent other scripts from overriding positioning immediately after showing
          try{
            if(bubbleEl._missyReassertTimer){ try{ clearInterval(bubbleEl._missyReassertTimer); }catch(e){} bubbleEl._missyReassertTimer = null; }
            function _reassert(){
              try{
                if(!bubbleEl || !bubbleEl.style) return;
                // Re-apply the computed left/top if present, else leave as-is
                var left = bubbleEl.style.left || window.getComputedStyle(bubbleEl).left || '';
                var top = bubbleEl.style.top || window.getComputedStyle(bubbleEl).top || '';
                try{ bubbleEl.style.setProperty('position','fixed','important'); }catch(e){}
                try{ if(left) bubbleEl.style.setProperty('left', left, 'important'); }catch(e){}
                try{ if(top) bubbleEl.style.setProperty('top', top, 'important'); }catch(e){}
                try{ bubbleEl.style.setProperty('display','block','important'); }catch(e){}
                try{ bubbleEl.style.setProperty('visibility','visible','important'); }catch(e){}
                try{ bubbleEl.style.setProperty('opacity','1','important'); }catch(e){}
                try{ bubbleEl.style.setProperty('pointer-events','none','important'); }catch(e){}
                try{ bubbleEl.style.setProperty('z-index','10000','important'); }catch(e){}
              }catch(e){}
            }
            // run immediate and then a short interval to beat out other scripts
            try{ _reassert(); }catch(e){}
            try{ bubbleEl._missyReassertTimer = setInterval(_reassert, 150); }catch(e){}
            try{ setTimeout(function(){ try{ if(bubbleEl && bubbleEl._missyReassertTimer){ clearInterval(bubbleEl._missyReassertTimer); bubbleEl._missyReassertTimer = null; } }catch(e){} }, 1200); }catch(e){}
          }catch(e){}
          // Watchdog: ensure bubble actually hides — if it remains visible after duration+500ms, force-hide (handles cases where another script replaced/cleared timer)
          try{
            if(window._missyWatchdogTimer) { clearTimeout(window._missyWatchdogTimer); window._missyWatchdogTimer = null; }
            window._missyWatchdogTimer = setTimeout(function(){
              try{
                var sel = '.missy-bubble, .missy-corner-bubble, #missyCornerBubble, #missyBubble';
                document.querySelectorAll(sel).forEach(function(b){
                  try{
                    if(b.classList && b.classList.contains && b.classList.contains('show')){
                      console.debug('missy watchdog: forcing hide of stuck bubble', b);
                      try{ if(b._missyHideTimer){ clearTimeout(b._missyHideTimer); b._missyHideTimer = null; } }catch(e){}
                      try{ b.classList.remove('show'); b.classList.add('bubble-hidden'); }catch(e){}
                    }
                  }catch(e){}
                });
              }catch(e){}
              try{ window._missyWatchdogTimer = null; }catch(e){}
            }, (opts.duration || 8000) + 500);
          }catch(e){}
        }catch(e){}
      }catch(e){ console.debug('showMissyBubble error', e); }
    };

    // Apply grayscale site-wide by default unless unlock key present
    try{
      if(!localStorage.getItem('fullcolor')){
        document.body.classList.add('site-grayscale');
      } else {
        document.body.classList.remove('site-grayscale');
      }
    }catch(e){ }

    // Ensure bubble and Missy image share the same parent and stacking order so bubble never covers Missy
    function enforceMissyStacking(){
      try{
        const img = document.querySelector('#missyImg, .missy-corner-img, .missy-img, #missyCornerImg');
        const bubble = document.querySelector('.missy-bubble, .missy-corner-bubble, #missyCornerBubble, #missyBubble');
        if(!img || !bubble) return;
        const parent = img.parentElement || document.getElementById('missy-fixed-root') || document.body;
        if(bubble.parentElement !== parent){ try{ parent.appendChild(bubble); }catch(e){} }
        // enforce stacking: Missy above bubble
        try{ img.style.zIndex = '11000'; }catch(e){}
        try{ bubble.style.zIndex = '10000'; }catch(e){}
        // ensure sensible positioning
        try{ const bPos = getComputedStyle(bubble).position; if(!/fixed|absolute/.test(bPos)){ bubble.style.position = 'absolute'; } }catch(e){}
        try{ const iPos = getComputedStyle(img).position; if(!/fixed|absolute/.test(iPos)){ img.style.position = 'relative'; } }catch(e){}
      }catch(e){ console.warn('enforceMissyStacking failed', e); }
    }
    setTimeout(enforceMissyStacking, 50);
    setTimeout(enforceMissyStacking, 350);
    window.addEventListener('resize', enforceMissyStacking);

    // Render a consistent site header (title + nav) on every page if not present.
    // Links omit the current page and Gallery page will not include a self-link.
    function renderSiteHeader(){
      try{
        // ensure body has page-bg so background is applied
        if(!document.body.classList.contains('page-bg')) document.body.classList.add('page-bg');

        const current = window.location.pathname.split('/').pop().toLowerCase();

        // If the page already contains a site title element, normalize any existing nav and skip injecting a header
        try{
          const existingTitle = document.querySelector('.site-title, #animatedTitle');
          if(existingTitle){
            const navEl = document.querySelector('.main-nav, .gallery-nav-clean, nav');
            if(navEl){
              const anchors = Array.from(navEl.querySelectorAll('a'));
              anchors.forEach(a=>{
                try{
                  const href = (a.getAttribute('href')||'').split('/').pop().toLowerCase();
                  if(!href) return;
                  if(current === '' && href === 'index.html'){
                    a.parentNode && a.parentNode.removeChild(a);
                  } else if(href === current){
                    a.parentNode && a.parentNode.removeChild(a);
                  }
                }catch(e){}
              });
            }
            // Also remove duplicate titles/navs if present (keep first)
            try{
              const titles = Array.from(document.querySelectorAll('.site-title, #animatedTitle'));
              if(titles.length>1){ for(let i=1;i<titles.length;i++){ try{ titles[i].parentNode && titles[i].parentNode.removeChild(titles[i]); }catch(e){} } }
              const navs = Array.from(document.querySelectorAll('.main-nav, .gallery-nav-clean, nav'));
              if(navs.length>1){ const keeperNav = navs.find(n=>n.classList && n.classList.contains('main-nav')) || navs[0]; for(const n of navs){ if(n !== keeperNav){ try{ n.parentNode && n.parentNode.removeChild(n); }catch(e){} } } }
            }catch(e){}
            return;
          }
        }catch(e){ console.warn('existingTitle check failed', e); }

        // Deduplicate existing title/nav elements: keep the first occurrence and remove extras
        try{
          const titles = Array.from(document.querySelectorAll('.site-title, #animatedTitle'));
          if(titles.length > 1){
            for(let i=1;i<titles.length;i++){ try{ titles[i].parentNode && titles[i].parentNode.removeChild(titles[i]); }catch(e){} }
          }
          const navs = Array.from(document.querySelectorAll('.main-nav, .gallery-nav-clean, nav'));
          if(navs.length > 1){
            // keep the first nav that contains a site-title or is .main-nav; otherwise keep first
            let keeper = navs.find(n=>n.classList && n.classList.contains('main-nav')) || navs[0];
            for(const n of navs){ if(n !== keeper){ try{ n.parentNode && n.parentNode.removeChild(n); }catch(e){} } }
          }
        }catch(e){ console.warn('dedupe header/nav failed', e); }

        // If the page already includes a proper header element, normalize its nav and skip injecting a header to avoid duplication
        const existingHeaderEl = document.querySelector('header, .gallery-header-clean, .site-header, .home-overlay-top, .home-bg');
        if(existingHeaderEl){
          try{
            const navEl = existingHeaderEl.querySelector('.main-nav, .gallery-nav-clean, nav');
            if(navEl){
              // remove link to current page (by matching filename)
              const anchors = Array.from(navEl.querySelectorAll('a'));
              anchors.forEach(a=>{
                try{
                  const href = (a.getAttribute('href')||'').split('/').pop().toLowerCase();
                  if(!href) return;
                  if(current === '' && href === 'index.html'){
                    a.parentNode && a.parentNode.removeChild(a);
                  } else if(href === current){
                    a.parentNode && a.parentNode.removeChild(a);
                  }
                }catch(e){}
              });
            }
          }catch(e){ console.warn('normalize existing header failed', e); }
          return;
        }
        // prefer existing header/container ids
        // Prefer any existing header-like elements; dedupe multiples by keeping the first
        let header = null;
        const candidates = Array.from(document.querySelectorAll('#siteHeader, header, .site-header, .gallery-header-clean, .site-title'));
        if(candidates.length){
          // choose closest header container if a title element was matched
          header = candidates[0].closest('header') || candidates[0];
          // remove any additional candidate headers to avoid duplication
          for(let i=1;i<candidates.length;i++){
            try{ const node = candidates[i].closest('header') || candidates[i]; if(node && node !== header) node.parentNode && node.parentNode.removeChild(node); }catch(e){}
          }
        }
        if(header && header.id !== 'siteHeader'){
          // normalize existing header
          header.id = header.id || 'siteHeader';
        }
        if(!header){
          header = document.createElement('header');
          header.className = 'site-header gallery-header-clean';
          header.id = 'siteHeader';
          // insert at top of body
          document.body.insertAdjacentElement('afterbegin', header);
        }
        // Build title element
        let title = header.querySelector('.site-title');
        if(!title){
          title = document.createElement('h1');
          title.className = 'site-title';
          title.id = 'animatedTitle';
          title.innerHTML = '<span id="wordMissy">Missy</span> <span id="wordArt">Art</span> <span id="wordGallery">Gallery</span>';
          header.appendChild(title);
        }
        // Build nav
        let nav = header.querySelector('.main-nav');
        if(!nav){ nav = document.createElement('nav'); nav.className = 'main-nav'; header.appendChild(nav); }
        // Links data
        const pages = [ {url: '/index.html', label: 'Home'}, {url: '/gallery.html', label: 'Gallery'}, {url: '/aboutme/AboutMe.html', label: 'About'}, {url: '/contact.html', label: 'Contact'} ];
        // Clear existing
        nav.innerHTML = '';
        pages.forEach(p => {
          const url = p.url;
          const label = p.label;
          // compute normalized target name
          const pageName = url.split('/').pop().toLowerCase();
          // omit link to current page
          if(current === pageName || (current === '' && pageName === 'index.html')) return;
          // create link
          const a = document.createElement('a');
          a.href = url;
          a.className = 'nav-link';
          a.textContent = label;
          // if contact link, give id for core handlers
          if(label.toLowerCase() === 'contact') a.id = 'contactLink';
          nav.appendChild(a);
        });

        // ensure progress dots live under title (core.ensureProgressDots will recreate as needed)
        ensureProgressDots();
        // Ensure Missy bubble doesn't overlap Missy image: give Missy image higher z-index
        try{
          const missyImg = document.querySelector('.missy-img') || document.getElementById('missyImage');
          const missyBubble = document.getElementById('missyBubble') || document.querySelector('.missy-bubble');
          if(missyImg) missyImg.style.zIndex = '10005';
          if(missyBubble) missyBubble.style.zIndex = '10000';
        }catch(e){}
      }catch(e){ console.warn('renderSiteHeader failed', e); }
    }
    renderSiteHeader();

    // Enforce Missy image z-index higher than bubbles so Missy is never visually covered by her bubble
    try{
      const imgs = document.querySelectorAll('.missy-corner-img, #missyImg, .missy-img, #missyCornerImg');
      imgs.forEach(i => { try{ if(i && i.style) i.style.zIndex = '10005'; }catch(e){} });
      const bubbles = document.querySelectorAll('.missy-bubble, .missy-corner-bubble, #missyCornerBubble, #missyBubble');
      bubbles.forEach(b => { try{ if(b && b.style) b.style.zIndex = '10000'; }catch(e){} });
    }catch(e){}

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
      widget.style.right = '12px';
      // Keep it anchored to visible bottom: choose 2vh or 12px whichever larger
      const bottomPx = Math.max(12, Math.round(window.innerHeight * 0.02));
      widget.style.bottom = bottomPx + 'px';
      widget.style.zIndex = '10000';
      widget.style.willChange = 'transform';
      widget.style.transform = widget.style.transform || 'translateZ(0)';
      // If widget is inside a container with overflow hidden, re-append to body to avoid clipping
      if(widget.parentElement && widget.parentElement !== document.body){
        try { document.body.appendChild(widget); } catch(e) {}
      }
    }

    // Ensure only one Missy widget exists (remove duplicates from per-page markup)
    function ensureSingleMissy(){
      const selectors = ['#missyCornerWidget','#missyArea','.missy-corner-widget','.missy-area','#missyWidget','.missy-widget','#missyImg','.missy-img'];
      const candidates = [];
      selectors.forEach(s => { document.querySelectorAll(s).forEach(n=> candidates.push(n)); });
      // dedupe
      const unique = Array.from(new Set(candidates));
      if(unique.length <= 1) return;
      // pick keeper (prefer missyCornerWidget, then missyArea, then first)
      let keeper = document.getElementById('missyCornerWidget') || document.getElementById('missyArea') || document.querySelector('.missy-corner-widget') || document.querySelector('.missy-area') || unique[0];
      // create or reuse a fixed root container that is a direct child of body
      let missyRoot = document.getElementById('missy-fixed-root');
      if(!missyRoot){
        missyRoot = document.createElement('div');
        missyRoot.id = 'missy-fixed-root';
        document.body.appendChild(missyRoot);
      }
      // ensure root is fixed to viewport and visible above everything
      missyRoot.style.position = 'fixed';
      missyRoot.style.right = '12px';
      missyRoot.style.bottom = '12px';
      // use reasonable z-index so Missy is above content but below full-screen overlays
      missyRoot.style.zIndex = '10000';
      // allow interactions to reach Missy (keeper will manage pointer-events if necessary)
      missyRoot.style.pointerEvents = 'auto';
      missyRoot.style.overflow = 'visible';
      missyRoot.style.maxWidth = '100%';

      if(keeper && keeper.parentElement !== missyRoot){ try { missyRoot.appendChild(keeper); } catch(e){} }
      // Reset positioning to avoid leftover inline styles that move Missy off-screen
      keeper.style.position = 'relative';
      keeper.style.left = '';
      keeper.style.right = '';
      keeper.style.top = '';
      keeper.style.bottom = '';
      keeper.style.transform = '';
      keeper.style.zIndex = '10000';
      keeper.style.pointerEvents = 'auto';
      keeper.style.overflow = 'visible';
      keeper.style.display = keeper.style.display || 'flex';
      keeper.style.flexDirection = keeper.style.flexDirection || 'column';
      keeper.style.alignItems = keeper.style.alignItems || 'flex-end';

      // remove/hide other duplicates
      unique.forEach(el => { if(el !== keeper){ try{ el.parentElement && el.parentElement.removeChild(el);}catch(e){} } });
      // Also dedupe any extra bubble nodes that might have been added by per-page scripts (keep the first)
      try{
        const bubbleSel = '.missy-bubble, .missy-corner-bubble, #missyCornerBubble, #missyBubble';
        const bubbles = Array.from(document.querySelectorAll(bubbleSel));
        if(bubbles.length > 1){
          const keeperBubble = bubbles[0];
          bubbles.slice(1).forEach(function(b){ try{ b.parentElement && b.parentElement.removeChild(b); }catch(e){} });
          // Ensure keeperBubble is appended to keeper
          try{ if(keeperBubble.parentElement !== keeper) keeper.appendChild(keeperBubble); }catch(e){}
        }
      }catch(e){}

      // Ensure the Missy image is visible and above page content
      const imgSelectors = ['#missyImg','.missy-corner-img','.missy-img','#missyCornerImg'];
      imgSelectors.forEach(s => {
        const mi = keeper.querySelector(s) || document.querySelector(s);
        if(mi){
          mi.style.display = 'block';
          mi.style.visibility = 'visible';
          mi.style.zIndex = '10005';
          mi.style.pointerEvents = 'auto';
          // Replace the image node to remove any per-page event listeners, then attach controlled hover handlers
          try{
            const clean = mi.cloneNode(true);
            mi.parentNode.replaceChild(clean, mi);
            // Attach hover handlers that use the central positionMissyBubble
            clean.addEventListener('mouseenter', function(){
              try{
                clean.classList.add('color');
                clean.style.filter = 'none';
                const bubbleEl = keeper.querySelector('.missy-bubble, .missy-corner-bubble, #missyCornerBubble, #missyBubble') || document.querySelector('.missy-bubble, #missyBubble');
                if(bubbleEl){
                  try{ if(window.showMissyBubble) window.showMissyBubble(clean, bubbleEl, {margin:8}); else if(window.positionMissyBubble) window.positionMissyBubble(clean, bubbleEl, {margin:8}); }catch(e){}
                }
              }catch(e){}
            });
            clean.addEventListener('mouseleave', function(){
              try{
                clean.classList.remove('color');
                clean.style.filter = 'grayscale(1) brightness(0.98)';
                const bubbleEl = keeper.querySelector('.missy-bubble, .missy-corner-bubble, #missyCornerBubble, #missyBubble') || document.querySelector('.missy-bubble, #missyBubble');
                if(bubbleEl){ try{ if(bubbleEl._missyHideTimer){ clearTimeout(bubbleEl._missyHideTimer); bubbleEl._missyHideTimer = null; } }catch(e){} try{ bubbleEl.classList.remove('show'); bubbleEl.classList.add('bubble-hidden'); }catch(e){} }
              }catch(e){}
            });
            // Prevent per-page click handlers by intercepting clicks at the image and delegating to central handlers
            clean.addEventListener('click', function(ev){ try{ ev.preventDefault(); ev.stopImmediatePropagation && ev.stopImmediatePropagation(); }catch(e){} /* delegated handler will run via body capture */ }, true);
          }catch(e){}
        }
      });

      // Ensure bubble is appended to keeper and positioned relative to keeper (absolute) and above Missy
      let bubble = document.querySelector('.missy-bubble, .missy-corner-bubble, #missyCornerBubble, #missyBubble');
      if(bubble && bubble.parentElement !== keeper){
        try{ keeper.appendChild(bubble); } catch(e){}
      }
      if(bubble){
        bubble.style.position = 'absolute';
        bubble.style.right = '110%';
        bubble.style.zIndex = '10000';
        bubble.style.pointerEvents = 'none';
        // ensure keeper overflow visible so bubble isn't clipped
        try{ keeper.style.overflow = 'visible'; }catch(e){}
      }

      // Function to fine-position the bubble near Missy's head using fixed viewport coordinates
      // Accepts optional imgEl, bubbleEl and opts to support different callers
      window.positionMissyBubble = function(imgEl, bubbleEl, opts){
        try{
          const keeper = document.getElementById('missyCornerWidget') || document.querySelector('.missy-corner-widget') || document.getElementById('missy-fixed-root') || document.body;
          const img = imgEl || keeper.querySelector('#missyImg, .missy-corner-img, .missy-img, #missyCornerImg') || document.querySelector('#missyImg, .missy-corner-img, .missy-img, #missyCornerImg');
          const bubbleElLocal = bubbleEl || keeper.querySelector('.missy-bubble, .missy-corner-bubble, #missyCornerBubble, #missyBubble') || document.querySelector('.missy-bubble, #missyBubble, .missy-corner-bubble, #missyCornerBubble');
          if(!img || !bubbleElLocal) return;

          // ensure we can measure without flicker
          const prevTransition = bubbleElLocal.style.transition;
          bubbleElLocal.style.transition = 'none';

          // make sure it's renderable for measurements
          bubbleElLocal.style.display = bubbleElLocal.style.display || 'block';

          const imgRect = img.getBoundingClientRect();
          const bubbleW = bubbleElLocal.offsetWidth || 140;
          const bubbleH = bubbleElLocal.offsetHeight || 80;

          // compute target: prefer placing bubble to the LEFT of Missy near her head
          const margin = (opts && opts.margin) || 8;
          let targetLeft = Math.round(imgRect.left - bubbleW - margin);
          // vertically center on Missy's head area
          let targetTop = Math.round(imgRect.top + (imgRect.height - bubbleH) / 2);

          // if left placement would go offscreen, try above; then try right
          if(targetLeft < 8){
            // try above centered
            targetLeft = Math.max(8, Math.round(imgRect.left + (imgRect.width - bubbleW) / 2));
            targetTop = Math.round(imgRect.top - bubbleH - margin);
            // if above also offscreen at top, try right side
            if(targetTop < 8){
              targetLeft = Math.round(imgRect.right + margin);
              targetTop = Math.round(imgRect.top + (imgRect.height - bubbleH) / 2);
              if(targetLeft + bubbleW > window.innerWidth - 8){
                // fallback to clamping inside viewport
                targetLeft = Math.max(8, Math.round((window.innerWidth - bubbleW) / 2));
              }
            }
          }

          // apply as fixed viewport coords to guarantee no overlap/clipping
          try{ bubbleElLocal.style.position = 'fixed'; }catch(e){}
          try{ bubbleElLocal.style.right = 'auto'; }catch(e){}
          bubbleElLocal.style.left = targetLeft + 'px';
          bubbleElLocal.style.top = targetTop + 'px';
          try{ bubbleElLocal.style.zIndex = '10000'; }catch(e){}
          bubbleElLocal.style.pointerEvents = 'auto';

          // ensure bubble is in a top-level root (avoid clipping by ancestors)
          try{
            const missyRoot = document.getElementById('missy-fixed-root');
            if(missyRoot && bubbleElLocal.parentElement !== missyRoot){ missyRoot.appendChild(bubbleElLocal); }
            else if(!bubbleElLocal.parentElement || bubbleElLocal.parentElement !== document.body){ try{ document.body.appendChild(bubbleElLocal);}catch(e){} }
          }catch(e){}

          // debug
          try{ console.debug('positionMissyBubble', {targetLeft, targetTop, imgRect, bubbleW, bubbleH}); if(window.Logger) window.Logger.log('positionMissyBubble fixed: '+ JSON.stringify({targetLeft,targetTop,bubbleW,bubbleH})); }catch(e){}

          // restore transition
          bubbleElLocal.style.transition = prevTransition;
        }catch(e){ /* ignore measurement errors */ }
      };

    }

    // Run on load and on viewport changes
    ensureSingleMissy();
    ensureMissyInView();
    window.addEventListener('resize', function(){ ensureSingleMissy(); ensureMissyInView(); });
    window.addEventListener('orientationchange', function(){ ensureSingleMissy(); ensureMissyInView(); });
    document.addEventListener('visibilitychange', ensureMissyInView);
    // Re-check when DOM mutates (some pages insert Missy later)
    try{
      const mo = new MutationObserver(()=>{ ensureSingleMissy(); ensureMissyInView(); });
      mo.observe(document.body, { childList: true, subtree: true });
    }catch(e){}

    // Hide bubble when page becomes hidden or unloads to avoid a stuck visible bubble across navigation
    try{
      function hideMissyBubbleNow(){
        try{
          const b = document.querySelector('.missy-bubble, .missy-corner-bubble, #missyCornerBubble, #missyBubble');
          if(b){ try{ if(b._missyHideTimer){ clearTimeout(b._missyHideTimer); b._missyHideTimer = null; } }catch(e){}
            try{ b.classList.remove('show'); b.classList.add('bubble-hidden'); }catch(e){}
          }
        }catch(e){}
      }
      document.addEventListener('visibilitychange', function(){ if(document.hidden) hideMissyBubbleNow(); });
      window.addEventListener('beforeunload', hideMissyBubbleNow);
    }catch(e){}

    // Delegated handlers: ensure clicks/touches on Missy always show a bubble and log events.
    // This covers cases where per-page scripts didn't attach events or elements were reparented.
    try{
      function handleMissyActivation(targetEl){
        try{
          const nowEvent = Date.now();
          // Debounce duplicate events from the same physical tap (touchstart -> click) so they don't count as a second tap
          if(window._missyLastEventTime && (nowEvent - window._missyLastEventTime) < 400){
            window._missyLastEventTime = nowEvent;
            return; // ignore duplicate firing
          }
          window._missyLastEventTime = nowEvent;
          console.debug('Missy activation on', targetEl);
          if(window.Logger) window.Logger.log('Missy activation: '+ (targetEl.id || targetEl.className || targetEl.tagName));
          // find bubble
          const bubble = document.querySelector('.missy-bubble, .missy-corner-bubble, #missyCornerBubble, #missyBubble');
          if(bubble){
            // pick hi bubble if empty
            try{ if(bubble.tagName === 'IMG' && (!bubble.src || bubble.src.indexOf('data:')===0)) bubble.src = '/Book/BubbleHi.png'; }catch(e){}
            try{
              if(window.showMissyBubble){
                // preferred: central helper that positions and shows with safe hide timing
                window.showMissyBubble(targetEl, bubble, {margin:8});
              } else if(window.positionMissyBubble){
                // legacy fallback: position then show/hide manually
                window.positionMissyBubble(targetEl, bubble, {margin:8});
                try{ console.debug('delegated handler: showing bubble', bubble); bubble.classList.remove('bubble-hidden'); bubble.classList.add('show'); }catch(e){}
                try{ if(bubble._missyHideTimer){ console.debug('delegated handler: clearing existing hide timer', bubble._missyHideTimer); clearTimeout(bubble._missyHideTimer); bubble._missyHideTimer = null; } }catch(e){}
                try{ console.debug('delegated handler: scheduling hide timer for', bubble); bubble._missyHideTimer = setTimeout(function(){ try{ console.debug('delegated handler hide timer firing for', bubble); bubble.classList.remove('show'); bubble.classList.add('bubble-hidden'); }catch(e){} bubble._missyHideTimer = null; }, 8000); }catch(e){}
              } else if(typeof window.positionMissyBubbleFallback === 'function'){
                window.positionMissyBubbleFallback(targetEl, bubble);
              } else {
                console.debug('No positionMissyBubble available');
              }
            }catch(e){ console.debug('positionMissyBubble error', e); }
          }
          // colorize image briefly
          try{ targetEl.classList.add('color'); targetEl.style.filter = 'none'; setTimeout(()=>{ targetEl.classList.remove('color'); try{ targetEl.style.filter='grayscale(1) brightness(0.98)'; }catch(e){} }, 1200); }catch(e){}

          // Two-tap redirect: first activation shows bubble; second activation within a short window redirects.
          try{
            window._missyLastActivation = window._missyLastActivation || 0;
            const now = Date.now();
            const DOUBLE_TAP_WINDOW = 1800; // ms
            if(now - window._missyLastActivation < DOUBLE_TAP_WINDOW){
              // second tap — perform redirect
              try{
                const current = window.location.pathname.split('/').pop().toLowerCase();
                const pages = ['/index.html','/gallery.html','/aboutme/AboutMe.html'];
                const filtered = pages.filter(p => !current.includes(p.toLowerCase()));
                const pick = filtered.length ? filtered[Math.floor(Math.random() * filtered.length)] : pages[0];
                console.debug('Missy: second tap — redirecting to', pick);
                if(window.Logger) window.Logger.log('missy:click');
                window.location.href = pick;
              }catch(e){ console.debug('Missy redirect failed', e); }
            } else {
              // first tap — mark time and wait for possible second tap
              window._missyLastActivation = now;
              console.debug('Missy: first tap — show bubble. Tap again to go to a random page.');
              if(window.Logger) window.Logger.log('missy:click');
            }
          }catch(e){ console.debug('handleMissyActivation error', e); }
        }catch(e){ console.debug('handleMissyActivation error', e); }
      }

      document.body.addEventListener('click', function(e){
        const m = e.target.closest && e.target.closest('#missyImg, #missyCornerImg, .missy-corner-img, .missy-img, #missyLink, .missy-link, .missy-corner-widget, .missy-area');
        if(m){ try{ e.preventDefault && e.preventDefault(); e.stopImmediatePropagation && e.stopImmediatePropagation(); e.stopPropagation && e.stopPropagation(); }catch(ex){} handleMissyActivation(m); }
      }, true);

      document.body.addEventListener('touchstart', function(e){
        const m = e.target.closest && e.target.closest('#missyImg, #missyCornerImg, .missy-corner-img, .missy-img, #missyLink, .missy-link, .missy-corner-widget, .missy-area');
        if(m){ try{ e.preventDefault && e.preventDefault(); e.stopImmediatePropagation && e.stopImmediatePropagation(); e.stopPropagation && e.stopPropagation(); }catch(ex){} handleMissyActivation(m); }
      }, {passive:false, capture:true});
    }catch(e){ console.warn('Missy delegated handlers failed', e); }

  });

  // Robust positionMissyBubble override
  // This will prefer placing the bubble to Missy's left (page center side),
  // fall back to the right, above, or below if space is limited, and clamp
  // the bubble vertically so it doesn't float off-screen.
  window.positionMissyBubble = function(imgEl, bubbleEl, opts){
    try{
      opts = opts || {};
      const margin = typeof opts.margin === 'number' ? opts.margin : 8;
      // Resolve elements (accept either an element or a rect-like object)
      let img = null;
      if(imgEl && typeof imgEl.getBoundingClientRect === 'function') img = imgEl;
      if(!img) img = document.querySelector('#missyImg, .missy-corner-img, .missy-img, #missyCornerImg');
      const bubble = bubbleEl || document.querySelector('.missy-bubble, .missy-corner-bubble, #missyCornerBubble, #missyBubble');
      if(!bubble) return;

      // Ensure bubble is in the top-level root so viewport coords are stable
      try{ if(bubble.parentElement !== document.body){ try{ document.body.appendChild(bubble); }catch(e){} } }catch(e){}
      // Force fixed positioning so measurements are viewport-relative and stable
      try{ bubble.style.position = 'fixed'; bubble.style.transform = 'none'; bubble.style.right = 'auto'; }catch(e){}

      // Measure bubble size robustly
      let bubbleW = bubble.offsetWidth || parseInt(window.getComputedStyle(bubble).width,10) || 120;
      let bubbleH = bubble.offsetHeight || parseInt(window.getComputedStyle(bubble).height,10) || 80;
      if(bubbleW === 0 || bubbleH === 0){
        const prevVis = bubble.style.visibility || '';
        const prevOp = bubble.style.opacity || '';
        bubble.style.visibility = 'hidden'; bubble.style.opacity = '0'; bubble.style.display = 'block';
        bubbleW = bubble.offsetWidth || bubbleW || 120;
        bubbleH = bubble.offsetHeight || bubbleH || 80;
        bubble.style.visibility = prevVis; bubble.style.opacity = prevOp;
      }

      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

      // Determine Missy bounding rect safely
      let imgRect = null;
      try{ if(img && typeof img.getBoundingClientRect === 'function'){ imgRect = img.getBoundingClientRect(); } }
      catch(e){ imgRect = null; }
      if(!imgRect || !isFinite(imgRect.left) || imgRect.width <= 0){
        // try querying canonical element
        const alt = document.querySelector('#missyCornerImg, #missyImg, .missy-corner-img, .missy-img');
        try{ if(alt && typeof alt.getBoundingClientRect === 'function') imgRect = alt.getBoundingClientRect(); }catch(e){ imgRect = null; }
      }

      // Fallback to a reasonable bottom-right default if we still can't measure
      if(!imgRect || !isFinite(imgRect.left) || imgRect.width <= 0){
        const defaultSize = 120;
        imgRect = { left: Math.max(8, vw - defaultSize - 12), top: Math.max(8, vh - defaultSize - 12), width: defaultSize, height: defaultSize, right: vw - 12, bottom: vh - 12 };
      }

      // compute target: prefer placing bubble to the LEFT of Missy near her head
      let left = Math.round(imgRect.left - bubbleW - margin);
      // vertically center on Missy's head area
      const headOffset = Math.round(imgRect.height * 0.15);
      let top = Math.round(imgRect.top + headOffset - Math.round(bubbleH/2));

      // if left placement would go offscreen, try above; then try right
      if(left < 8){
        // try above centered
        left = Math.max(8, Math.round(imgRect.left + (imgRect.width - bubbleW) / 2));
        top = Math.round(imgRect.top - bubbleH - margin);
        // if above also offscreen at top, try right side
        if(top < 8){
          left = Math.round(imgRect.right + margin);
          top = Math.round(imgRect.top + (imgRect.height - bubbleH) / 2);
          if(left + bubbleW > vw - 8){
            // fallback to center
            left = Math.max(8, Math.round((vw - bubbleW) / 2));
          }
        }
      }

      // clamp to viewport
      left = Math.max(8, Math.min(left, vw - bubbleW - 8));
      if(top < 8) top = Math.max(8, imgRect.top + Math.round((imgRect.height - bubbleH)/2));
      top = Math.max(8, Math.min(top, vh - bubbleH - 8));

      // Apply computed position with !important to override conflicting CSS and ensure fixed viewport placement
      try{
        bubble.style.setProperty('position','fixed','important');
        bubble.style.setProperty('left', left + 'px', 'important');
        bubble.style.setProperty('top', top + 'px', 'important');
        bubble.style.removeProperty('right');
        bubble.style.setProperty('transform', 'none', 'important');
        bubble.style.setProperty('z-index', bubble.style.zIndex || '10000', 'important');
        bubble.style.setProperty('pointer-events', 'none', 'important');
        bubble.style.display = bubble.style.display || 'block';
        bubble.style.visibility = bubble.style.visibility || 'visible';
        bubble.style.opacity = bubble.style.opacity || '1';
        // debug computed styles after applying
        try{
          const cs = window.getComputedStyle(bubble);
          console.debug('positionMissyBubble applied computed:', {position: cs.position, left: cs.left, top: cs.top, right: cs.right, transform: cs.transform, rect: bubble.getBoundingClientRect ? bubble.getBoundingClientRect() : null});
          if(window.Logger) window.Logger.log('positionMissyBubble applied computed: '+ JSON.stringify({position: cs.position, left: cs.left, top: cs.top, right: cs.right, transform: cs.transform, rect: bubble.getBoundingClientRect ? bubble.getBoundingClientRect() : null}));
        }catch(e){}
      }catch(e){}

      // Ensure Missy image sits above the bubble
      try{ const ms = (img && img instanceof Element) ? img : document.querySelector('#missyImg, .missy-corner-img, .missy-img, #missyCornerImg'); if(ms) ms.style.zIndex = ms.style.zIndex || '11000'; }catch(e){}

      try{ if(window.Logger) window.Logger.log('positionMissyBubble placed: '+JSON.stringify({left,top,bubbleW,bubbleH})); }catch(e){}
    }catch(e){ console.warn('positionMissyBubble override failed', e); }
  };

  // Show a fullscreen Oops overlay and coordinate Missy + bubble above it, then redirect
  function showOopsOverlay(opts){
    opts = opts || {};
    const src = opts.src || 'Book/OopsImage.png';
    const showDuration = typeof opts.showDuration === 'number' ? opts.showDuration : 6000; // total time before redirect
    const revealMissyAfter = typeof opts.revealMissyAfter === 'number' ? opts.revealMissyAfter : 700; // ms
    const fadeOutBefore = typeof opts.fadeOutBefore === 'number' ? opts.fadeOutBefore : 1200; // ms before redirect to start fade
    const redirectPages = opts.redirectPages || ['/index.html','/gallery.html','/aboutme/AboutMe.html'];

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
      if(missy){ missy.classList.add('color'); missy.style.zIndex = '10005'; try{ missy.style.filter = 'none'; }catch(e){} }
      if(bubble){
        // set bubble to Oops png if available
        try{ if(bubble.tagName === 'IMG') bubble.src = (opts.bubbleSrc || (src.replace(/OopsImage/i,'BubbleOops').replace('Book/','Book/'))); }
        catch(e){}
        bubble.classList.add('show');
        bubble.style.zIndex = '10000';
      }
    }, revealMissyAfter);

    // After (showDuration - fadeOutBefore) start fading out overlay image
    const fadeTimer = setTimeout(()=>{
      img.style.opacity = '0';
    }, Math.max(200, showDuration - fadeOutBefore));

    // After showDuration, remove overlay, reset Missy and bubble, then redirect
    const endTimer = setTimeout(()=>{
      try{ if(overlay && overlay.parentElement) overlay.parentElement.removeChild(overlay); }catch(e){}
      if(missy){ missy.classList.remove('color'); try{ missy.style.filter = 'grayscale(1) brightness(0.98)'; }catch(e){} }
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

  // Provide a safe fallback for positioning if the primary function isn't defined yet
  if (typeof window.positionMissyBubble !== 'function') {
    window.positionMissyBubble = function(imgEl, bubbleEl, opts){
      try{
        // Basic measurement fallback
        const img = imgEl && imgEl.getBoundingClientRect ? imgEl : document.querySelector('#missyImg, .missy-corner-img, .missy-img, #missyCornerImg');
        const r = img && img.getBoundingClientRect ? img.getBoundingClientRect() : { left: window.innerWidth - 140, top: window.innerHeight - 140, width: 120, height: 120 };
        if(bubbleEl){
          bubbleEl.style.position = 'fixed';
          bubbleEl.style.left = (Math.max(8, Math.round(r.left + (r.width - (bubbleEl.offsetWidth||110))/2))) + 'px';
          bubbleEl.style.top = (Math.max(8, Math.round(r.top - (bubbleEl.offsetHeight||80) - 8))) + 'px';
          bubbleEl.style.zIndex = '10000';
          bubbleEl.style.pointerEvents = 'auto';
          if(bubbleEl.parentElement !== document.body){ try{ document.body.appendChild(bubbleEl); }catch(e){} }
        }
      }catch(e){ console.warn('positionMissyBubble fallback error', e); }
    };
  }

  // helper for debugging and forcing Missy placement from console
  window.forceEnsureMissy = function(){ try{ ensureSingleMissy(); ensureMissyInView(); }catch(e){ console.error('forceEnsureMissy failed', e); } };


  // Permanent guard: ensure bubble-hidden keeps bubble invisible and show reasserts correct styles
  try{
    (function(){
      var sel = '.missy-bubble, .missy-corner-bubble, #missyCornerBubble, #missyBubble';
      function enforceHidden(el){ try{
        if(!el || !el.style) return;
        el.style.setProperty('display','none','important');
        el.style.setProperty('visibility','hidden','important');
        el.style.setProperty('opacity','0','important');
      }catch(e){}
      }
      function enforceShow(el){ try{
        if(!el || !el.style) return;
        el.style.setProperty('display','block','important');
        el.style.setProperty('visibility','visible','important');
        el.style.setProperty('opacity','1','important');
      }catch(e){}
      }
      try{
        var mo = new MutationObserver(function(muts){
          muts.forEach(function(m){
            try{
              if(m.type === 'attributes'){
                var t = m.target;
                if(!t || t.nodeType !==1) return;
                try{
                  if(t.matches && t.matches(sel)){
                    if(t.classList && t.classList.contains && t.classList.contains('bubble-hidden')){
                      enforceHidden(t);
                    } else if(t.classList && t.classList.contains && t.classList.contains('show')){
                      enforceShow(t);
                    }
                  }
                }catch(e){}
              } else if(m.type === 'childList'){
                Array.prototype.forEach.call(m.addedNodes, function(n){ try{ if(n.nodeType===1 && n.matches && n.matches(sel)){
                  if(n.classList && n.classList.contains && n.classList.contains('bubble-hidden')) enforceHidden(n);
                  else if(n.classList && n.classList.contains && n.classList.contains('show')) enforceShow(n);
                }}catch(e){} });
              }
            }catch(e){}
          });
        });
        mo.observe(document.documentElement || document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class','style'] });
        // initial sweep
        try{ document.querySelectorAll(sel).forEach(function(n){ try{ if(n.classList && n.classList.contains && n.classList.contains('bubble-hidden')) enforceHidden(n); }catch(e){} }); }catch(e){}
        // store reference so other code/tests can disconnect if needed
        window._missyGuardObserver = mo;
      }catch(e){ console.error('missyGuard setup failed', e); }
    })();
  }catch(e){}

})();
