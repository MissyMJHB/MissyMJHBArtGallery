			let top = imgRect.top + Math.round(imgRect.height * 0.3) - bubbleH/2;
			// Clamp to viewport
			left = Math.max(8, left);
			top = Math.max(8, Math.min(top, window.innerHeight - bubbleH - 8));
			bubble.style.position = 'fixed';
			bubble.style.left = left + 'px';
			bubble.style.top = top + 'px';
			bubble.style.right = 'auto';
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
