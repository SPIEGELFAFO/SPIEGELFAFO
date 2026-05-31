const searchState = {
  index: [],
  loaded: false,
};

function renderSearchResults(results, query) {
  const container = document.getElementById('search-results');
  if (!container) {
    return;
  }

  if (!query) {
    container.innerHTML = '<p class="search-empty">Type a name or word to search the archive.</p>';
    return;
  }

  if (!results.length) {
    container.innerHTML = `<p class="search-empty">No files found for “${query}”.</p>`;
    return;
  }

  container.innerHTML = results.map(item => `
    <div class="search-card">
      <a href="${item.url}">
        <strong>${item.title}</strong>
        <p>${item.summary || item.body.slice(0, 120) + '...'}</p>
      </a>
    </div>
  `).join('');
}

function executeSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  const query = input.value.trim();
  if (!searchState.loaded) {
    return;
  }

  const term = query.toLowerCase();
  const results = searchState.index.filter(item => {
    return item.title.toLowerCase().includes(term)
      || item.summary.toLowerCase().includes(term)
      || item.body.toLowerCase().includes(term);
  });

  renderSearchResults(results, query);
}

function loadSearchIndex() {
  fetch('/index.json')
    .then(response => response.json())
    .then(data => {
      searchState.index = Array.isArray(data.index) ? data.index : [];
      searchState.loaded = true;
      const input = document.getElementById('search-input');
      if (input && !input.value.trim()) {
        renderSearchResults([], '');
      }
    })
    .catch(() => {
      const container = document.getElementById('search-results');
      if (container) {
        container.innerHTML = '<p class="search-empty">Search index unavailable. Build the site to enable search.</p>';
      }
    });
}

window.addEventListener('DOMContentLoaded', () => {
  loadSearchIndex();

  const input = document.getElementById('search-input');
  if (input) {
    input.addEventListener('keyup', event => {
      if (event.key === 'Enter') {
        executeSearch();
      }
    });
  }
});
