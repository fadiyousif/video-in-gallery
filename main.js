(function () {
  const openBtn = document.querySelector('.video-circle');
  const dialog = document.getElementById('videoDialog');
  const video = document.getElementById('modalVideo');

  function openModal() {
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    video.play().catch(() => {}); // user click should allow autoplay
  }

  function closeModal() {
    try { video.pause(); } catch (_) {}
    video.currentTime = 0;
    if (dialog.open) dialog.close(); else dialog.removeAttribute('open');
    openBtn.focus();
  }

  // Open
  openBtn.addEventListener('click', openModal);

  // Close on ESC
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeModal();
  });

  // Close on click outside video
  dialog.addEventListener('click', (e) => {
    const rect = video.getBoundingClientRect();
    const inside =
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!inside) closeModal();
  });
})();
