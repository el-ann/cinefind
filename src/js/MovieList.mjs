import { renderHeader } from "./header.js";
import { getGenres, getByGenre, getTrending, getImageUrl } from "./ExternalServices.mjs";
import { renderListWithTemplate, getParam } from "./utils.mjs";

renderHeader();

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

async function renderGenreButtons(type, activeGenreId) {
    const container = document.getElementById("genre-filters");
    if (!container) return;

    const genres = await getGenres(type);

    container.innerHTML = `
    <button class="genre-btn ${!activeGenreId ? "active" : ""}" data-id="">All</button>
    ${genres.map((g) => `
      <button class="genre-btn ${activeGenreId == g.id ? "active" : ""}" data-id="${g.id}">${g.name}</button>
    `).join("")}
  `;

    container.querySelectorAll(".genre-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const genreId = btn.dataset.id;
            const url = new URL(window.location);
            if (genreId) {
                url.searchParams.set("genre", genreId);
                url.searchParams.set("name", btn.textContent);
            } else {
                url.searchParams.delete("genre");
                url.searchParams.delete("name");
            }
            window.location = url;
        });
    });
}

async function init() {
    const type = getParam("type") || "movie";
    const genreId = getParam("genre");
    const genreName = getParam("name");
    const grid = document.getElementById("movies-grid");

    document.title = genreName
        ? `${genreName} — CineFind`
        : type === "tv"
            ? "TV Shows — CineFind"
            : "Movies — CineFind";

    const title = document.getElementById("page-title");
    if (title) {
        title.textContent = genreName || (type === "tv" ? "TV Shows" : "Movies");
    }

    grid.innerHTML = `<p class="loading">Loading...</p>`;

    await renderGenreButtons(type, genreId);

    try {
        const items = genreId
            ? await getByGenre(genreId, type)
            : await getTrending(type);

        renderListWithTemplate(movieCardTemplate, grid, items);
    } catch (error) {
        grid.innerHTML = `<p class="loading">Failed to load content.</p>`;
    }
}

init();