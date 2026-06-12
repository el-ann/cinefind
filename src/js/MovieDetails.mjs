import { renderHeader } from "./header.js";
import { getDetails, getTrailerKey, getImageUrl } from "./ExternalServices.mjs";
import { getParam, getLocalStorage, setLocalStorage } from "./utils.mjs";

renderHeader();

function getWatchlist() {
    return getLocalStorage("watchlist");
}

function saveWatchlist(watchlist) {
    setLocalStorage("watchlist", watchlist);
}

function isInWatchlist(id) {
    return getWatchlist().some((item) => item.id === id);
}

function toggleWatchlist(movie) {
    let watchlist = getWatchlist();
    if (isInWatchlist(movie.id)) {
        watchlist = watchlist.filter((item) => item.id !== movie.id);
    } else {
        watchlist.push(movie);
    }
    saveWatchlist(watchlist);
}

function updateWatchlistButton(btn, id) {
    if (isInWatchlist(id)) {
        btn.textContent = "✓ In Watchlist";
        btn.classList.add("btn-outline");
    } else {
        btn.textContent = "+ Add to Watchlist";
        btn.classList.remove("btn-outline");
    }
}

async function renderDetails() {
    const id = getParam("id");
    const type = getParam("type") || "movie";
    const container = document.getElementById("detail-container");

    if (!id) {
        container.innerHTML = `<p class="empty-message">No movie or show selected.</p>`;
        return;
    }

    container.innerHTML = `<p class="loading">Loading...</p>`;

    try {
        const item = await getDetails(id, type);

        const title = item.title || item.name;
        const poster = getImageUrl(item.poster_path);
        const backdrop = item.backdrop_path
            ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
            : null;
        const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
        const releaseDate = item.release_date || item.first_air_date || "Unknown";
        const runtime = item.runtime
            ? `${item.runtime} min`
            : item.episode_run_time?.[0]
                ? `${item.episode_run_time[0]} min/ep`
                : "";
        const genres = item.genres || [];
        const cast = item.credits?.cast?.slice(0, 6) || [];

        document.title = `${title} — CineFind`;

        const watchlistItem = {
            id: item.id,
            title,
            poster_path: item.poster_path,
            vote_average: item.vote_average,
            release_date: releaseDate,
            media_type: type,
        };

        container.innerHTML = `
      ${backdrop ? `<div class="detail-backdrop" style="background-image: url('${backdrop}')"></div>` : ""}
      <div class="detail-container">
        <div class="detail-hero">
          <div class="detail-poster">
            <img src="${poster}" alt="${title}" />
          </div>
          <div class="detail-info">
            <h1>${title}</h1>
            <div class="detail-meta">
              <span>📅 ${releaseDate}</span>
              ${runtime ? `<span>⏱ ${runtime}</span>` : ""}
              <span>⭐ ${rating}</span>
            </div>
            <div class="detail-genres">
              ${genres.map((g) => `<span class="genre-tag">${g.name}</span>`).join("")}
            </div>
            <p class="detail-overview">${item.overview || "No description available."}</p>
            <button class="btn" id="watchlist-btn">+ Add to Watchlist</button>
          </div>
        </div>

        ${cast.length > 0 ? `
        <div class="cast-section">
          <h2>Cast</h2>
          <div class="cast-grid">
            ${cast.map((member) => `
              <div class="cast-card">
                <img src="${getImageUrl(member.profile_path)}" alt="${member.name}" />
                <p class="cast-name">${member.name}</p>
                <p class="cast-character">${member.character}</p>
              </div>
            `).join("")}
          </div>
        </div>` : ""}

        <div class="trailer-section" id="trailer-section">
          <h2>Trailer</h2>
          <p class="loading">Loading trailer...</p>
        </div>
      </div>
    `;

        // Watchlist button
        const btn = document.getElementById("watchlist-btn");
        updateWatchlistButton(btn, item.id);
        btn.addEventListener("click", () => {
            toggleWatchlist(watchlistItem);
            updateWatchlistButton(btn, item.id);
        });

        // Load trailer
        const cacheKey = `trailer_${type}_${id}`;
        let trailerKey = localStorage.getItem(cacheKey);

        if (!trailerKey) {
            trailerKey = await getTrailerKey(id, type);
            if (trailerKey) localStorage.setItem(cacheKey, trailerKey);
        }

        const trailerSection = document.getElementById("trailer-section");
        if (trailerKey) {
            trailerSection.innerHTML = `
        <h2>Trailer</h2>
        <div class="trailer-wrapper">
          <iframe
            src="https://www.youtube.com/embed/${trailerKey}"
            title="${title} Trailer"
            allowfullscreen
          ></iframe>
        </div>
      `;
        } else {
            trailerSection.innerHTML = "";
        }

    } catch (error) {
        container.innerHTML = `<p class="empty-message">Failed to load details. Please try again.</p>`;
    }
}

renderDetails();