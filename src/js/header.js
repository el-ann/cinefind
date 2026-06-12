export function renderHeader() {
    const header = document.getElementById("header");
    const footer = document.getElementById("footer");

    header.innerHTML = `
    <nav>
      <a href="/index.html" class="nav-logo">🎬 CineFind</a>
      <ul class="nav-links">
        <li><a href="/index.html">Home</a></li>
        <li><a href="/browse.html?type=movie">Movies</a></li>
        <li><a href="/browse.html?type=tv">TV Shows</a></li>
        <li><a href="/watchlist.html">Watchlist</a></li>
      </ul>
      <div class="nav-search">
        <input type="text" id="search-input" placeholder="Search movies & shows..." />
        <button id="search-btn">Search</button>
      </div>
    </nav>
  `;

    footer.innerHTML = `
    <footer>
      <p>© 2025 CineFind. Powered by TMDB.</p>
    </footer>
  `;

    // Search button handler
    document.getElementById("search-btn").addEventListener("click", () => {
        const query = document.getElementById("search-input").value.trim();
        if (query) {
            window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
        }
    });

    // Enter key handler
    document.getElementById("search-input").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const query = e.target.value.trim();
            if (query) {
                window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
            }
        }
    });
}