// Entry point for the homepage
// Fetches and displays trending movies and TV shows

import { renderHeader } from "./header.js";
import { getTrending, getImageUrl } from "./ExternalServices.mjs";
import { renderListWithTemplate } from "./utils.mjs";

// Render the header and footer on the homepage
renderHeader();

// Template function that generates HTML for a single movie/show card
function movieCardTemplate(movie) {
  const title = movie.title || movie.name;
  const type = movie.media_type || "movie";
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

// Fetches trending movies and TV shows and renders them on the homepage
async function init() {
  document.title = "Trending — CineFind";

  const moviesGrid = document.getElementById("movies-grid");
  const showsGrid = document.getElementById("shows-grid");

  // Show loading state while data is being fetched
  moviesGrid.innerHTML = `<p class="loading">Loading...</p>`;
  showsGrid.innerHTML = `<p class="loading">Loading...</p>`;

  try {
    // Fetch both trending movies and TV shows in parallel
    const [movies, shows] = await Promise.all([
      getTrending("movie"),
      getTrending("tv"),
    ]);

    renderListWithTemplate(movieCardTemplate, moviesGrid, movies);
    renderListWithTemplate(movieCardTemplate, showsGrid, shows);
  } catch {
    moviesGrid.innerHTML = `<p class="loading">Failed to load movies.</p>`;
    showsGrid.innerHTML = `<p class="loading">Failed to load shows.</p>`;
  }
}

init();