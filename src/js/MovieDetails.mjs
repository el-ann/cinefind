// Handles the detail page for a single movie or TV show
// Fetches full details, renders cast, embeds trailer, and manages watchlist toggle

import { renderHeader } from "./header.js";
import { getDetails, getTrailerKey, getImageUrl, getYouTubeTrailer } from "./ExternalServices.mjs";
import { getParam, getLocalStorage, setLocalStorage } from "./utils.mjs";

renderHeader();

// Reads the current watchlist from localStorage
function getWatchlist() {
    return getLocalStorage("watchlist");
}

// Saves the updated watchlist to localStorage
function saveWatchlist(watchlist) {
    setLocalStorage("watchlist", watchlist);
}

// Checks if a movie/show is already in the watchlist by ID
function isInWatchlist(id) {
    return getWatchlist().some((item) => item.id === id);
}

// Adds or removes an item from the watchlist
function toggleWatchlist(movie) {
    let watchlist = getWatchlist();
    if (isInWatchlist(movie.id)) {
        watchlist = watchlist.filter((item) => item.id !== movie.id);
    } else {
        watchlist.push(movie);
    }
    saveWatchlist(watchlist);
}

// Updates the watchlist button text and style based on current state
function updateWatchlistButton(btn, id) {
    if (isInWatchlist(id)) {
        btn.textContent = "✓ In Watchlist";
        btn.classList.add("btn-outline");
    } else {
        btn.textContent = "+ Add to Watchlist";
        btn.classList.remove("btn-outline");
    }
}

// Main function — fetches and renders the full detail view
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

        // Extract all needed fields with fallbacks
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

        // Only show first 6 cast members
        const cast = item.credits?.cast?.slice(0, 6) || [];

        document.title = `${title} — CineFind`;

        // Object to store in watchlist
        const watchlistItem = {
            id: item.id,
            title,
            poster_path: item.poster_path,
            vote_average: item.vote_average,
            release_date: releaseDate,
            media_type: type,
        };

        // Render the full detail page HTML
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

        // Set up watchlist button
        const btn = document.getElementById("watchlist-btn");
        updateWatchlistButton(btn, item.id);
        btn.addEventListener("click", () => {
            toggleWatchlist(watchlistItem);
            updateWatchlistButton(btn, item.id);
        });

        // Try TMDB trailer first, fall back to YouTube Data API
        const cacheKey = `trailer_${type}_${id}`;
        let trailerKey = localStorage.getItem(cacheKey);

        if (!trailerKey) {
            trailerKey = await getTrailerKey(id, type);
            if (!trailerKey) {
                // Fallback: search YouTube Data API for official trailer
                trailerKey = await getYouTubeTrailer(title);
            }
            if (trailerKey) localStorage.setItem(cacheKey, trailerKey);
        }

        // Render trailer embed or hide section if no trailer found
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