// Handles the search page — reads query from URL, fetches results, and renders them
// Also supports live search with debounce to limit API calls

import { renderHeader } from "./header.js";
import { searchMedia, getImageUrl } from "./ExternalServices.mjs";
import { renderListWithTemplate, getParam } from "./utils.mjs";

renderHeader();

// Template function for rendering a search result card
function movieCardTemplate(movie) {
    const title = movie.title || movie.name;
    const type = movie.media_type || (movie.first_air_date ? "tv" : "movie");
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
    const poster = getImageUrl(movie.poster_path);

    return `
    <a class="movie-card" href="/detail.html?id=${movie.id}&type=${type}">
      <img src="${poster}" alt="${title}" loading="lazy" />
      <div class="card-info">
        <p class="card-title">${title}</p>
        <p class="card-rating">⭐ ${rating}</p>
      </div>
    </a>
  `;
}

// Delays a function call until the user stops typing
function debounce(fn, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

// Fetches and renders search results for a given query
// Searches both movies and TV shows and combines results by popularity
async function performSearch(query) {
    const resultsGrid = document.getElementById("results-grid");
    const searchTitle = document.getElementById("search-title");

    if (!query) return;

    document.title = `"${query}" — CineFind`;
    searchTitle.textContent = `Results for "${query}"`;
    resultsGrid.innerHTML = `<p class="loading">Searching...</p>`;

    try {
        // Search movies and TV shows simultaneously
        const [movies, shows] = await Promise.all([
            searchMedia(query, "movie"),
            searchMedia(query, "tv"),
        ]);

        // Combine and sort by popularity
        const combined = [...movies, ...shows].sort(
            (a, b) => b.popularity - a.popularity
        );

        if (combined.length === 0) {
            resultsGrid.innerHTML = `<p class="empty-message">No results found for "${query}".</p>`;
            return;
        }

        renderListWithTemplate(movieCardTemplate, resultsGrid, combined);
    } catch (error) {
        resultsGrid.innerHTML = `<p class="loading">Search failed. Please try again.</p>`;
    }
}

// On page load, run search if query exists in URL
const query = getParam("q");
if (query) {
    const searchInput = document.getElementById("search-input");
    if (searchInput) searchInput.value = query;
    performSearch(query);
}

// Live search as user types — debounced to 400ms
const debouncedSearch = debounce((q) => performSearch(q), 400);

document.addEventListener("input", (e) => {
    if (e.target.id === "search-input") {
        debouncedSearch(e.target.value.trim());
    }
});