const searchState = {
  index: [],
  loaded: false,
};

function formatSnippet(text, limit = 120) {
  return text.length > limit ? text.slice(0, limit).trim() + '...' : text.trim();
}

function renderSearchResults(container, results, query) {
  if (!container) {
    return;
  }

  if (!query) {
    container.innerHTML = '';
    return;
  }

  if (!results.length) {
    container.innerHTML = `<p class="search-empty">No files found for “${query}”.</p>`;
    return;
  }

  container.innerHTML = results.slice(0, 8).map(item => `
    <div class="search-card">
      <a href="${item.url}">
        <strong>${item.title}</strong>
        <p>${formatSnippet(item.summary || item.body)}</p>
      </a>
    </div>
  `).join('');
}

function searchArchive(query) {
  if (!searchState.loaded) {
    return [];
  }

  const term = query.toLowerCase();
  return searchState.index.filter(item => {
    return item.title.toLowerCase().includes(term)
      || item.summary.toLowerCase().includes(term)
      || item.body.toLowerCase().includes(term);
  });
}

function executeSearchForInput(input) {
  const query = input.value.trim();
  const resultsId = input.dataset.results;
  const container = document.getElementById(resultsId);
  const results = query ? searchArchive(query) : [];
  renderSearchResults(container, results, query);
}

function loadSearchIndex() {
  const path = window.SEARCH_INDEX_URL || 'index.json';
  fetch(path)
    .then(response => response.json())
    .then(data => {
      searchState.index = Array.isArray(data.index) ? data.index : [];
      searchState.loaded = true;
      document.querySelectorAll('.live-search-input').forEach(input => {
        executeSearchForInput(input);
      });
    })
    .catch(() => {
      document.querySelectorAll('.search-results').forEach(container => {
        container.innerHTML = '<p class="search-empty">Search index unavailable. Build the site to enable search.</p>';
      });
    });
}

window.addEventListener('DOMContentLoaded', () => {
  loadSearchIndex();

  document.querySelectorAll('.live-search-input').forEach(input => {
    input.addEventListener('input', () => executeSearchForInput(input));
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
      }
    });
  });
});
