// ----- PhotoSwipe: non-ESM init -----
document.addEventListener('DOMContentLoaded', function () {
  if (typeof PhotoSwipeLightbox === 'undefined' || typeof PhotoSwipe === 'undefined') {
    console.error('PhotoSwipe UMD scripts not found. Check your script includes.');
    return;
  }

  const gallerySelector = '#my-gallery';
  const lightbox = new PhotoSwipeLightbox({
    gallery: gallerySelector,
    children: 'a',
    pswpModule: PhotoSwipe,
    wheelToZoom: true,
    bgOpacity: 0.9,
    loop: true,
    showHideAnimationType: 'zoom',
    zoom: true,
    preloadFirstSlide: true
  });

  // Optional caption in PhotoSwipe
  lightbox.on('uiRegister', function () {
    lightbox.pswp.ui.registerElement({
      name: 'caption',
      order: 9,
      isButton: false,
      appendTo: 'root',
      onInit: function (el, pswp) {
        el.className = 'pswp__custom-caption';
        pswp.on('change', function () {
          const curr = pswp.currSlide && pswp.currSlide.data && pswp.currSlide.data.element;
          const imgAlt = curr && curr.querySelector('img') ? curr.querySelector('img').alt : '';
          const dataCap = curr ? curr.getAttribute('data-caption') : '';
          el.textContent = dataCap || imgAlt || '';
        });
      }
    });
  });

  // Auto-play/pause when we inject a video slide
  lightbox.on('contentAppend', ({ content }) => {
    const v = content?.element?.querySelector?.('video');
    if (v) v.play().catch(() => {});   // user just clicked; should be allowed
  });
  lightbox.on('contentRemove', ({ content }) => {
    const v = content?.element?.querySelector?.('video');
    if (v) v.pause();
  });
  lightbox.on('close', () => {
    document.querySelectorAll('.pswp__video-container video').forEach(v => { v.pause(); });
  });

  lightbox.init();

  // Defensive: stop default <a> navigation in case PS init is delayed
  const galleryEl = document.querySelector(gallerySelector);
  if (galleryEl) {
    galleryEl.addEventListener('click', function (e) {
      const a = e.target.closest('a');
      if (!a) return;
      if (galleryEl.contains(a)) e.preventDefault();
    });
  }

  // ----- First image: open a VIDEO SLIDE inside PhotoSwipe -----
  const firstDot = document.querySelector(`${gallerySelector} .video-dot`);
  if (firstDot) {
    const defaultVideo = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

    firstDot.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const parentA = firstDot.closest('a');
      const videoSrc = (parentA && parentA.getAttribute('data-video')) || defaultVideo;
      const isWebm = /\.webm(\?|$)/i.test(videoSrc);

      // Build one-off HTML slide that contains a video element
      const html = `
        <div class="pswp__video-container">
          <video controls playsinline autoplay>
            <source src="${videoSrc}" type="${isWebm ? 'video/webm' : 'video/mp4'}" />
          </video>
        </div>
      `;

      // Open PhotoSwipe at slide 0 with our HTML slide; animate from click point
      const point = { x: e.clientX, y: e.clientY };
      lightbox.loadAndOpen(0, [{ html }], point);
    });

    // Keep the tiny preview video in the circle looping
    const tinyVid = firstDot.querySelector('.video-dot__vid');
    if (tinyVid) {
      tinyVid.addEventListener('canplay', () => { tinyVid.play().catch(() => {}); }, { once: true });
    }
  }
});
