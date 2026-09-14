// Timeline com 14 versões + busca
function filterDevlog(query) {
  query = (query || '').toLowerCase().trim();
  var items = document.querySelectorAll('#devlogTimeline .timeline-item');
  items.forEach(function(item) {
    var text = (item.textContent || '').toLowerCase();
    var version = (item.getAttribute('data-version') || '').toLowerCase();
    if (!query || text.includes(query) || version.includes(query)) {
      item.style.display = '';
    } else { item.style.display = 'none'; }
  });
}