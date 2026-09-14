// Sugestões de pesquisa rápida
function quickSearch(query) {
  var searchInput = document.querySelector('#tab-google input[type="text"]');
  if (searchInput) {
    searchInput.value = query;
    if (searchInput.form) searchInput.form.submit();
  }
}