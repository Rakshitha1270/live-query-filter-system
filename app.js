const searchInput = document.getElementById("search");
const suggestions = document.getElementById("suggestions");
const categoriesEl = document.getElementById("categories");
const resultsEl = document.getElementById("results");
const resultCount = document.getElementById("resultCount");
const loading = document.getElementById("loading");
const pageInfo = document.getElementById("pageInfo");
const prev = document.getElementById("prev");
const next = document.getElementById("next");

let selectedCategory = "";
let currentPage = 1;
let totalPages = 1;
let debounceTimer;

async function loadCategories() {
  const response = await fetch("/api/categories");
  const categories = await response.json();

  categoriesEl.innerHTML =
    '<button class="category active" data-category="">All</button>' +
    categories.map(c =>
      `<button class="category" data-category="${c}">${c}</button>`
    ).join("");

  document.querySelectorAll(".category").forEach(button => {
    button.addEventListener("click", () => {
      selectedCategory = button.dataset.category;
      currentPage = 1;

      document.querySelectorAll(".category")
        .forEach(b => b.classList.remove("active"));
      button.classList.add("active");

      loadResults();
    });
  });
}

async function loadSuggestions() {
  const q = searchInput.value.trim();
  const response = await fetch("/api/suggestions?q=" + encodeURIComponent(q));
  const list = await response.json();

  suggestions.innerHTML = list
    .map(name => `<option value="${name}"></option>`)
    .join("");
}

async function loadResults() {
  loading.textContent = "Loading...";

  const params = new URLSearchParams({
    search: searchInput.value.trim(),
    category: selectedCategory,
    page: currentPage,
    limit: 6
  });

  try {
    const response = await fetch("/api/search?" + params.toString());
    const result = await response.json();

    resultCount.textContent = `${result.total} result(s) found`;
    totalPages = result.totalPages;
    pageInfo.textContent = `Page ${result.page} of ${totalPages}`;

    prev.disabled = result.page <= 1;
    next.disabled = result.page >= totalPages;

    if (!result.data.length) {
      resultsEl.innerHTML =
        '<div class="empty">No matching results. Try another search.</div>';
      return;
    }

    resultsEl.innerHTML = result.data.map(item => `
      <article class="card">
        <span class="badge">${item.category}</span>
        <h3>${item.name}</h3>
        <p>${item.description}</p>
      </article>
    `).join("");
  } catch (error) {
    resultsEl.innerHTML =
      '<div class="empty">Backend not connected. Run npm install and npm start.</div>';
  } finally {
    loading.textContent = "";
  }
}

searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  loadSuggestions();

  debounceTimer = setTimeout(() => {
    currentPage = 1;
    loadResults();
  }, 400);
});

searchInput.addEventListener("change", () => {
  currentPage = 1;
  loadResults();
});

prev.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    loadResults();
  }
});

next.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    loadResults();
  }
});

loadCategories();
loadSuggestions();
loadResults();
