(function () {
  const openBtn = document.querySelector('.video-circle');

  // Shared media config
  const VIDEO_SOURCES = [
    { src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', type: 'video/mp4' },
    { src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm', type: 'video/webm' }
  ];
  const POSTER = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop';

  // Touch-first OR narrow viewport counts as mobile here
  const isMobile = () =>
    window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(max-width: 900px)').matches;

  function buildVideoEl(className) {
    const v = document.createElement('video');
    v.className = className || '';
    v.controls = true;
    v.playsInline = true; // iOS inline; we'll request fullscreen programmatically
    v.preload = 'metadata';
    v.poster = POSTER;
    VIDEO_SOURCES.forEach(({ src, type }) => {
      const s = document.createElement('source');
      s.src = src;
      s.type = type;
      v.appendChild(s);
    });
    return v;
  }

  /* ======================== MOBILE: no lightbox ======================== */
  function openMobileFullscreen() {
    // Build overlay wrapper
    const overlay = document.createElement('div');
    overlay.className = 'fs-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Video player');

    const header = document.createElement('div');
    header.className = 'fs-header';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'fs-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close video');
    closeBtn.textContent = '×';

    header.append(closeBtn);

    const body = document.createElement('div');
    body.className = 'fs-body';

    const video = buildVideoEl('fs-video');
    body.appendChild(video);
    overlay.append(header, body);
    document.body.appendChild(overlay);

    // Helpers
    const tryEnterFullscreen = (el) => {
      try {
        if (el.requestFullscreen) { el.requestFullscreen(); return true; }
        if (el.webkitRequestFullscreen) { el.webkitRequestFullscreen(); return true; } // old Safari
      } catch (_) {}
      return false;
    };
    const tryExitFullscreen = () => {
      try {
        if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
        if (document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen();
      } catch (_) {}
    };
    const cleanup = () => {
      try { video.pause(); } catch (_) {}
      video.currentTime = 0;
      tryExitFullscreen();
      overlay.remove();
      openBtn.focus();
    };

    // Close actions
    closeBtn.addEventListener('click', cleanup);
    overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); cleanup(); } });

    // Autoplay attempt
    video.play().catch(() => {});

    // Prefer fullscreening the OVERLAY so the close stays visible
    let wentFS = tryEnterFullscreen(overlay);

    // iOS legacy fallback: video-only native fullscreen
    if (!wentFS && typeof video.webkitEnterFullscreen === 'function') {
      try {
        video.webkitEnterFullscreen();
        wentFS = true;
        video.addEventListener('webkitendfullscreen', cleanup, { once: true });
      } catch (_) {}
    }

    // No extra UI: support double-tap to enter fullscreen if auto-FS was blocked
    if (!wentFS) {
      let lastTap = 0;
      const threshold = 300; // ms
      video.addEventListener('pointerup', (e) => {
        if (e.pointerType !== 'touch') return;
        const now = Date.now();
        if (now - lastTap < threshold) {
          // double-tap
          if (!tryEnterFullscreen(overlay) && typeof video.webkitEnterFullscreen === 'function') {
            try { video.webkitEnterFullscreen(); } catch (_) {}
          }
        }
        lastTap = now;
      });

      // Also support dblclick (just in case)
      video.addEventListener('dblclick', () => {
        if (!tryEnterFullscreen(overlay) && typeof video.webkitEnterFullscreen === 'function') {
          try { video.webkitEnterFullscreen(); } catch (_) {}
        }
      });
    }

    // If user exits system fullscreen, keep overlay (non-FS) until they tap ×
    const onFSChange = () => {
      // no-op; remove this listener if you want different behavior
      document.removeEventListener('fullscreenchange', onFSChange);
      document.removeEventListener('webkitfullscreenchange', onFSChange);
    };
    document.addEventListener('fullscreenchange', onFSChange);
    document.addEventListener('webkitfullscreenchange', onFSChange);
  }

  /* ======================== DESKTOP: basicLightbox ===================== */
  function openDesktopLightbox() {
    if (typeof window.basicLightbox === 'undefined') {
      console.error('basicLightbox not found. Include its script on desktop.');
      return;
    }

    const sources = VIDEO_SOURCES.map(s => `<source src="${s.src}" type="${s.type}">`).join('');
    const html = `
      <div class="blb-dialog" role="dialog" aria-modal="true" aria-label="Video player">
        <header class="blb-header">
          <h2 class="blb-title">Video</h2>
          <button class="blb-close" aria-label="Close video">×</button>
        </header>
        <main class="blb-content">
          <video id="blbVideo" class="modal-video" controls playsinline preload="metadata" poster="${POSTER}">
            ${sources}
            Sorry, your browser doesn’t support embedded videos.
          </video>
        </main>
      </div>
    `;

    const instance = basicLightbox.create(html, {
      onShow: (inst) => {
        const root = inst.element();
        const video = root.querySelector('#blbVideo');
        const closeBtn = root.querySelector('.blb-close');

        closeBtn.addEventListener('click', () => inst.close());
        video.play().catch(() => {});

        root.addEventListener('basiclightbox:close', () => {
          try { video.pause(); } catch (_) {}
          video.currentTime = 0;
          openBtn.focus();
        });
      },
      onClose: () => {
        const video = document.getElementById('blbVideo');
        if (video) {
          try { video.pause(); } catch (_) {}
          video.currentTime = 0;
          openBtn.focus();
        }
      }
    });

    instance.show();
  }

  /* ======================== Entry point ================================ */
  const open = () => {
    if (isMobile()) openMobileFullscreen();
    else openDesktopLightbox();
  };

  openBtn.addEventListener('click', open);
  openBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });
})();
