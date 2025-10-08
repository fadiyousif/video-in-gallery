(function () {
  const openBtn = document.querySelector('.video-circle');

  // Shared media config
  const VIDEO_SOURCES = [
    { src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', type: 'video/mp4' },
    { src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm', type: 'video/webm' }
  ];
  const POSTER = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop';

  // Simple mobile detector: touch-first or narrow viewport
  const isMobile = () =>
    window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(max-width: 900px)').matches;

  function buildVideoEl(className) {
    const v = document.createElement('video');
    v.className = className || '';
    v.controls = true;
    v.playsInline = true; // allow inline on iOS; we’ll request fullscreen programmatically
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

  /* ------------------------ MOBILE: no lightbox ------------------------ */
  function openMobileFullscreen() {
    // Build overlay wrapper (will go fullscreen)
    const overlay = document.createElement('div');
    overlay.className = 'fs-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Video player');

    const header = document.createElement('div');
    header.className = 'fs-header';

    // Optional manual fullscreen button (shown if auto-FS fails)
    const fsBtn = document.createElement('button');
    fsBtn.className = 'fs-fs';
    fsBtn.type = 'button';
    fsBtn.setAttribute('aria-label', 'Enter fullscreen');
    fsBtn.textContent = '⤢';
    fsBtn.style.display = 'none';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'fs-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close video');
    closeBtn.textContent = '×';

    header.append(fsBtn, closeBtn);

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
        if (el.webkitRequestFullscreen) { el.webkitRequestFullscreen(); return true; }     // old Safari
        return false;
      } catch (_) { return false; }
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

    // Wire close
    closeBtn.addEventListener('click', cleanup);

    // If user taps outside (header area), we still keep video; closing is via ×
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cleanup();
      }
    });

    // Try autoplay + fullscreen
    video.play().catch(() => { /* ignore autoplay errors; controls are visible */ });

    // Prefer making the OVERLAY fullscreen so the close button stays visible
    let wentFS = tryEnterFullscreen(overlay);

    // iOS legacy fallback: if element fullscreen fails, try native video fullscreen
    if (!wentFS && typeof video.webkitEnterFullscreen === 'function') {
      try {
        video.webkitEnterFullscreen();
        wentFS = true;
        // When iOS native fullscreen ends, remove overlay
        video.addEventListener('webkitendfullscreen', cleanup, { once: true });
      } catch (_) { /* ignored */ }
    }

    // If FS was blocked, reveal manual fullscreen button
    if (!wentFS) {
      fsBtn.style.display = 'inline-flex';
      fsBtn.addEventListener('click', () => {
        if (tryEnterFullscreen(overlay)) fsBtn.style.display = 'none';
      });
    }

    // If user exits fullscreen via system UI, keep overlay visible (non-FS),
    // but you can auto-close instead by calling cleanup() here.
    const onFSChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        // still keep overlay; do nothing
      }
    };
    document.addEventListener('fullscreenchange', onFSChange, { once: true });
    document.addEventListener('webkitfullscreenchange', onFSChange, { once: true });
  }

  /* ------------------------ DESKTOP: basicLightbox --------------------- */
  function openDesktopLightbox() {
    // Ensure basicLightbox is available (loaded via your HTML)
    if (typeof window.basicLightbox === 'undefined') {
      console.error('basicLightbox not found. Include its script on desktop.');
      return;
    }

    // Build content string (header outside the video)
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

  /* ------------------------ Entry point ------------------------------- */
  const open = (e) => {
    // Ensure this runs in direct click/keypress (user gesture)
    if (isMobile()) openMobileFullscreen();
    else openDesktopLightbox();
  };

  openBtn.addEventListener('click', open);
  openBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open(e);
    }
  });
})();
