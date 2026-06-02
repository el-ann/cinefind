import { renderHeader } from "./header.js";
import { getTrending, getImageUrl } from "./ExternalServices.mjs";
import { renderListWithTemplate } from "./utils.mjs";

renderHeader();

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

async function init() {
  document.title = "Trending — CineFind";

  const moviesGrid = document.getElementById("movies-grid");
  const showsGrid = document.getElementById("shows-grid");

  moviesGrid.innerHTML = `<p class="loading">Loading...</p>`;
  showsGrid.innerHTML = `<p class="loading">Loading...</p>`;

  try {
    const [movies, shows] = await Promise.all([
      getTrending("movie"),
      getTrending("tv"),
    ]);

    renderListWithTemplate(movieCardTemplate, moviesGrid, movies);
    renderListWithTemplate(movieCardTemplate, showsGrid, shows);
  } catch (error) {
    moviesGrid.innerHTML = `<p class="loading">Failed to load movies.</p>`;
    showsGrid.innerHTML = `<p class="loading">Failed to load shows.</p>`;
  }
}

init();