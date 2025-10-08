(function () {
  const openBtn = document.querySelector('.video-circle');
  const dialog = document.getElementById('videoDialog');
  const video = document.getElementById('modalVideo');
  const closeBtn = dialog.querySelector('.close-btn');

  function openModal() {
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      // Basic fallback if <dialog> unsupported
      dialog.setAttribute('open', '');
    }
    // Try to play (user gesture = click on circle)
    video.play().catch(() => { /* ignore autoplay blocks */ });
  }

  function closeModal() {
    try { video.pause(); } catch (_) {}
    video.currentTime = 0;
    if (dialog.open) dialog.close(); else dialog.removeAttribute('open');
    openBtn.focus(); // return focus
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  dialog.addEventListener('cancel', (e) => { e.preventDefault(); closeModal(); }); // ESC
  dialog.addEventListener('click', (e) => {
    // click outside video closes dialog
    const rect = video.getBoundingClientRect();
    const inVideo =
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!inVideo) closeModal();
  });
})();
