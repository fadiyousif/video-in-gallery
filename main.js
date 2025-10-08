(function () {
  const openBtn = document.querySelector('.video-circle');

  // Your video sources/poster
  const VIDEO_SOURCES = [
    { src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', type: 'video/mp4' },
    { src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm', type: 'video/webm' }
  ];
  const POSTER = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop';

  // Build the HTML string for the lightbox content
  const sourcesHTML = VIDEO_SOURCES
    .map(({ src, type }) => `<source src="${src}" type="${type}">`)
    .join('');
  const contentHTML = `
    <div class="blb-dialog" role="dialog" aria-modal="true" aria-label="Video player">
      <header class="blb-header">
        <h2 class="blb-title">Video</h2>
        <button class="blb-close" aria-label="Close video">×</button>
      </header>
      <main class="blb-content">
        <video id="blbVideo" class="modal-video" controls playsinline preload="metadata" poster="${POSTER}">
          ${sourcesHTML}
          Sorry, your browser doesn’t support embedded videos.
        </video>
      </main>
    </div>
  `;

  function openLightbox() {
    const instance = basicLightbox.create(contentHTML, {
      onShow: (inst) => {
        const root = inst.element();
        const closeBtn = root.querySelector('.blb-close');
        const video = root.querySelector('#blbVideo');

        // Close button
        closeBtn.addEventListener('click', () => inst.close());

        // Start playback (user gesture = circle click)
        video.play().catch(() => { /* ignore autoplay blocks */ });

        // Pause/reset if closed via Esc/backdrop/close button
        root.addEventListener('basiclightbox:close', () => {
          try { video.pause(); } catch (_) {}
          video.currentTime = 0;
          openBtn.focus();
        });
      },
      onClose: () => {
        // Fallback cleanup if closed without the event listener above firing
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

  openBtn.addEventListener('click', openLightbox);
  openBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox();
    }
  });
})();
