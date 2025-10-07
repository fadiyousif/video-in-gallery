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

  // Custom caption in PhotoSwipe
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

  lightbox.init();

  // Defensive: stop default <a> navigation for gallery items in case PS init is delayed
  const galleryEl = document.querySelector(gallerySelector);
  if (galleryEl) {
    galleryEl.addEventListener('click', function (e) {
      const a = e.target.closest('a');
      if (!a) return;
      if (galleryEl.contains(a)) e.preventDefault();
    });
  }

  // ----- Video Dot: modal player -----
  // One modal for all items
  const modal = document.getElementById('video-modal');
  const modalVideo = document.getElementById('video-modal-player');
  const closeEls = modal.querySelectorAll('[data-close-modal]');
  const defaultVideo = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

  function openVideo(src, titleText) {
    // reset & set source
    modalVideo.pause();
    modalVideo.innerHTML = ''; // clear previous sources
    const source = document.createElement('source');
    source.src = src || defaultVideo;
    source.type = src && src.endsWith('.webm') ? 'video/webm' : 'video/mp4';
    modalVideo.appendChild(source);

    // set title
    const titleEl = document.getElementById('video-modal-title');
    titleEl.textContent = titleText || 'Video';

    modal.hidden = false;
    // small async to allow layout before play
    setTimeout(() => {
      modalVideo.load();
      modalVideo.play().catch(() => {/* autoplay might be blocked until user interaction; controls are visible */});
    }, 20);

    // prevent background scroll
    document.documentElement.style.overflow = 'hidden';
  }

  function closeVideo() {
    modalVideo.pause();
    modal.hidden = true;
    document.documentElement.removeAttribute('style');
    // return focus to last trigger if available
    if (closeVideo.lastTrigger && closeVideo.lastTrigger.focus) {
      closeVideo.lastTrigger.focus();
    }
  }

  closeEls.forEach(btn => btn.addEventListener('click', closeVideo));
  modal.addEventListener('click', function (e) {
    if (e.target && e.target.hasAttribute('data-close-modal')) closeVideo();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeVideo();
  });

  // Wire every .video-dot inside gallery
  if (galleryEl) {
    galleryEl.querySelectorAll('.video-dot').forEach(dot => {
      // Prevent PhotoSwipe from opening when clicking the dot
      dot.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const parentA = dot.closest('a');
        const videoSrc = (parentA && parentA.getAttribute('data-video')) || defaultVideo;
        const title = (parentA && parentA.getAttribute('data-caption')) ||
                      (parentA && parentA.querySelector('img')?.alt) || 'Video';

        closeVideo.lastTrigger = dot; // for focus restore
        openVideo(videoSrc, title);
      });

      // Start the tiny preview video when visible
      const tinyVid = dot.querySelector('.video-dot__vid');
      if (tinyVid) {
        tinyVid.addEventListener('canplay', () => {
          // try to play silently (should be allowed because muted + user gesture soon)
          tinyVid.play().catch(() => {});
        }, { once: true });
      }
    });
  }
});
