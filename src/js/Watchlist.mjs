import { renderHeader } from "./header.js";
import { getLocalStorage, setLocalStorage, renderListWithTemplate } from "./utils.mjs";
import { getImageUrl } from "./ExternalServices.mjs";

renderHeader();

function getWatchlist() {
    return getLocalStorage("watchlist");
}

function saveWatchlist(watchlist) {
    setLocalStorage("watchlist", watchlist);
}

function watchlistCardTemplate(movie) {
    const title = movie.title || movie.name;
    const type = movie.media_type || "movie";
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
    const poster = getImageUrl(movie.poster_path);

    return `
    <div class="movie-card watchlist-card">
      <a href="/detail.html?id=${movie.id}&type=${type}">
        <img src="${poster}" alt="${title}" loading="lazy" />
        <div class="card-info">
          <p class="card-title">${title}</p>
          <p class="card-rating">⭐ ${rating}</p>
        </div>
      </a>
      <button class="btn btn-remove" data-id="${movie.id}">Remove</button>
    </div>
  `;
}

function renderWatchlist() {
    const grid = document.getElementById("watchlist-grid");
    const watchlist = getWatchlist();

    document.title = "My Watchlist — CineFind";

    if (watchlist.length === 0) {
        grid.innerHTML = `<p class="empty-message">Your watchlist is empty. Start adding movies and shows!</p>`;
        return;
    }

    renderListWithTemplate(watchlistCardTemplate, grid, watchlist);

    // Remove individual items
    grid.querySelectorAll(".btn-remove").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(e.target.dataset.id);
            const updated = getWatchlist().filter((item) => item.id !== id);
            saveWatchlist(updated);
            renderWatchlist();
        });
    });
}

// Clear all button
document.addEventListener("click", (e) => {
    if (e.target.id === "clear-watchlist") {
        saveWatchlist([]);
        renderWatchlist();
    }
});

renderWatchlist();