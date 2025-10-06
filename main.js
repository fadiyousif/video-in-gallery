// Non-ESM initialization using UMD globals
// Requires photoswipe.umd.min.js and photoswipe-lightbox.umd.min.js to be loaded first.

document.addEventListener('DOMContentLoaded', function () {
  if (typeof PhotoSwipeLightbox === 'undefined' || typeof PhotoSwipe === 'undefined') {
    console.error('PhotoSwipe UMD scripts not found. Check your script includes.');
    return;
  }

  const lightbox = new PhotoSwipeLightbox({
    gallery: '#my-gallery',
    children: 'a',
    pswpModule: PhotoSwipe,     // UMD: pass the global PhotoSwipe constructor
    wheelToZoom: true,
    bgOpacity: 0.85,
    paddingFn: function (vp) {
      return (vp.x < 700)
        ? { top: 8, bottom: 16, left: 8, right: 8 }
        : 16;
    }
  });

  // Custom caption using alt or data-caption
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
});
