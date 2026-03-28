// Missy Widget: persistent bottom-right mascot with interactive bubble
(function(){
	// --- CONFIG ---
	const missyImgSrc = 'assets/MissyCutOut.png';
	const bubbleChoices = [
		{src: 'assets/BubbleHi.png', alt: 'Hi!'},
		{src: 'assets/BubbleClick.png', alt: 'Click me!'},
		{src: 'assets/BubblePretty.png', alt: 'Pretty, isn\'t it?'},
		{src: 'assets/BubbleShowAround.png', alt: 'Let me show you around!'},
		{src: 'assets/BubblePeaceful.png', alt: "It's so peaceful here."},
		{src: 'assets/BubbleFeelFree.png', alt: 'Feel free to explore!'},
		{src: 'assets/BubbleOops.png', alt: 'Oops! Try again!'},
		{src: 'assets/BubbleAuthor.png', alt: 'Author loved my painting'},
		{src: 'assets/BubbleLike.png', alt: 'Do you like this?'}
	];
	const redirectPages = [
		'index.html',
		'gallery.html',
		'about.html',
		'contact.html'
	];
	const DOUBLE_CLICK_WINDOW = 1500; // ms
	// --- STYLES ---
	function injectMissyStyles(){
		if(document.getElementById('missy-widget-css')) return;
		var l = document.createElement('link');
		l.rel = 'stylesheet';
		l.id = 'missy-widget-css';
		l.href = 'assets/missy-widget.css';
		document.head.appendChild(l);
	}
	// --- WIDGET CREATION ---
	function ensureMissyWidget(){
		if(document.getElementById('missyCornerWidget')) return;
		// Remove any legacy widgets
		var old = document.querySelectorAll('.missy-corner-widget, #missyCornerWidget, .missy-img, #missyImg');
		old.forEach(n=>n.parentNode && n.parentNode.removeChild(n));
		// Create widget
		var widget = document.createElement('div');
		widget.id = 'missyCornerWidget';
		widget.className = 'missy-corner-widget';
		// Missy image
		var img = document.createElement('img');
		img.id = 'missyCornerImg';
		img.className = 'missy-corner-img';
		img.src = missyImgSrc;
		img.alt = 'Missy';
		img.tabIndex = 0;
		// Bubble
		var bubble = document.createElement('img');
		bubble.id = 'missyCornerBubble';
		bubble.className = 'missy-corner-bubble bubble-hidden';
		bubble.src = bubbleChoices[0].src;
		bubble.alt = bubbleChoices[0].alt;
		// Add to widget
		widget.appendChild(img);
		widget.appendChild(bubble);
		document.body.appendChild(widget);
		// --- INTERACTION LOGIC ---
		let lastClick = 0;
		let bubbleTimer = null;
		function showRandomBubble(){
			const pick = bubbleChoices[Math.floor(Math.random()*bubbleChoices.length)];
			bubble.src = pick.src;
			bubble.alt = pick.alt;
			bubble.classList.remove('bubble-hidden');
			bubble.classList.add('show');
			// Position bubble to Missy's left, at head level
			positionBubble();
			// Hide after 4s
			if(bubbleTimer) clearTimeout(bubbleTimer);
			bubbleTimer = setTimeout(()=>{ bubble.classList.add('bubble-hidden'); bubble.classList.remove('show'); }, 4000);
		}
		function positionBubble(){
			// Place bubble to Missy's left, vertically at 30% from top of Missy
			const imgRect = img.getBoundingClientRect();
			const bubbleW = bubble.offsetWidth || 140;
			const bubbleH = bubble.offsetHeight || 80;
			const margin = 12;
			let left = imgRect.left - bubbleW - margin;
			let top = imgRect.top + Math.round(imgRect.height * 0.3) - bubbleH/2;
			// Clamp to viewport
			left = Math.max(8, left);
			top = Math.max(8, Math.min(top, window.innerHeight - bubbleH - 8));
			bubble.style.position = 'fixed';
			bubble.style.left = left + 'px';
			bubble.style.top = top + 'px';
			bubble.style.right = 'auto';
			bubble.style.zIndex = '10000';
		}
		// Hover: colorize
		img.addEventListener('mouseenter', ()=>{
			img.classList.add('color');
			img.style.filter = 'none';
			showRandomBubble();
		});
		img.addEventListener('mouseleave', ()=>{
			img.classList.remove('color');
			img.style.filter = '';
			bubble.classList.add('bubble-hidden');
			bubble.classList.remove('show');
		});
		// Click: show bubble, double-click: redirect
		img.addEventListener('click', ()=>{
			const now = Date.now();
			if(now - lastClick < DOUBLE_CLICK_WINDOW){
				// Double click: redirect
				let here = window.location.pathname.split('/').pop().toLowerCase();
				let options = redirectPages.filter(p=>!here.includes(p));
				let pick = options.length ? options[Math.floor(Math.random()*options.length)] : redirectPages[0];
				window.location.href = pick;
				return;
			}
			lastClick = now;
			showRandomBubble();
		});
		// Keyboard accessibility: Enter triggers click
		img.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ img.click(); }});
		// Bubble also appears randomly every 8-14s
		function randomBubbleLoop(){
			showRandomBubble();
			setTimeout(randomBubbleLoop, 8000 + Math.random()*6000);
		}
		setTimeout(randomBubbleLoop, 5000 + Math.random()*3000);
		// Reposition bubble on resize/scroll
		window.addEventListener('resize', positionBubble);
		window.addEventListener('scroll', positionBubble);
	}
	// --- INIT ---
	document.addEventListener('DOMContentLoaded', function(){
		injectMissyStyles();
		ensureMissyWidget();
	});
})();

