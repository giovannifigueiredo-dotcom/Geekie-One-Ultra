// Lazy load do iframe do Geekie
(function loadGeekieIframe() {
  const iframe = document.getElementById('geekieIframe');
  const loading = document.getElementById('iframeLoading');
  if (!iframe || iframe.src) return;
  iframe.src = iframe.dataset.src;
  iframe.style.display = 'block';
  iframe.onload = () => { if (loading) loading.style.display = 'none'; };
  setTimeout(() => { if (loading) loading.style.display = 'none'; }, 8000);
})();