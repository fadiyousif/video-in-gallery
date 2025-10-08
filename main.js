(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    if (!window.PhotoSwipe || !window.PhotoSwipeLightbox) {
      console.error('PhotoSwipe UMD scripts not available.');
      return;
    }

    // ---- Lightbox for images (cards 2 & 3) ----
    const imageLightbox = new window.PhotoSwipeLightbox({
      gallery: '.gallery',
      children: 'figure:not(.card--with-video) a',
      pswpModule: window.PhotoSwipe,
      wheelToZoom: false
    });
    imageLightbox.init();

    // ---- Video slide (provide actual HTML, not an empty placeholder) ----
    const videoHTML = `
      <div>
        <video class="pswp__custom-video" controls playsinline autoplay muted poster="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop">
          <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
          <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm" type="video/webm">
          Sorry, your browser doesn’t support embedded videos.
        </video>
      </div>
    `;

    const videoLightbox = new window.PhotoSwipeLightbox({
      dataSource: [
        { type: 'html', html: videoHTML, width: 960, height: 540 }
      ],
      pswpModule: window.PhotoSwipe,
      wheelToZoom: false,
      showHideAnimationType: 'fade'
    });

    // Start playback once the content is appended to the DOM
    videoLightbox.on('contentAppend', ({ content }) => {
      const video = content.element && content.element.querySelector('video');
      if (video) {
        // Attempt to play (autoplay aided by the user's click that opened PSWP)
        video.play().catch(() => {/* ignore */});
      }
    });

    // Clean up on slide removal/close
    videoLightbox.on('contentRemove', ({ content }) => {
      const video = content.element && content.element.querySelector('video');
      if (video) {
        try { video.pause(); video.currentTime = 0; } catch (_) {}
      }
    });

    videoLightbox.init();

    // ---- Trigger circle opens video lightbox ----
    const circleBtn = document.querySelector('.video-circle');
    if (circleBtn) {
      const openVideo = () => videoLightbox.loadAndOpen(0);
      circleBtn.addEventListener('click', openVideo);
      circleBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openVideo();
        }
      });
    }
  });
})();
