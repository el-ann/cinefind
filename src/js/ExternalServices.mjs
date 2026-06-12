// Handles all external API calls to TMDB and YouTube Data API

const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";
const PLACEHOLDER = "https://via.placeholder.com/500x750?text=No+Image";

// TMDB authorization header using Vite environment variable
const options = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
    },
};

// Generic fetch wrapper with error handling
async function fetchData(url) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}

// Returns full image URL or placeholder if path is missing
export function getImageUrl(path) {
    return path ? `${IMG_BASE_URL}${path}` : PLACEHOLDER;
}

// Fetches trending movies or TV shows (type: "movie" | "tv")
export async function getTrending(type = "movie", timeWindow = "week") {
    const data = await fetchData(`${BASE_URL}/trending/${type}/${timeWindow}`);
    return data.results;
}

// Searches TMDB for movies or TV shows by query string
export async function searchMedia(query, type = "movie") {
    const data = await fetchData(
        `${BASE_URL}/search/${type}?query=${encodeURIComponent(query)}&include_adult=false`
    );
    return data.results;
}

// Fetches full details for a movie or show including credits
export async function getDetails(id, type = "movie") {
    const data = await fetchData(`${BASE_URL}/${type}/${id}?append_to_response=credits`);
    return data;
}

// Fetches the YouTube trailer key from TMDB videos endpoint
export async function getTrailerKey(id, type = "movie") {
    const data = await fetchData(`${BASE_URL}/${type}/${id}/videos`);
    const trailer = data.results.find(
        (v) => v.type === "Trailer" && v.site === "YouTube"
    );
    return trailer ? trailer.key : null;
}

// Fetches genre list for movies or TV shows
export async function getGenres(type = "movie") {
    const data = await fetchData(`${BASE_URL}/genre/${type}/list`);
    return data.genres;
}

// Fetches movies or shows filtered by genre ID
export async function getByGenre(genreId, type = "movie") {
    const data = await fetchData(
        `${BASE_URL}/discover/${type}?with_genres=${genreId}&sort_by=popularity.desc`
    );
    return data.results;
}

// Searches YouTube Data API for an official trailer
// Caches result in localStorage to preserve API quota
export async function getYouTubeTrailer(query) {
    const cached = localStorage.getItem(`yt_${query}`);
    if (cached) return cached;

    const key = import.meta.env.VITE_YOUTUBE_KEY;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + " official trailer")}&type=video&maxResults=1&key=${key}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);
        const data = await response.json();
        const videoId = data.items?.[0]?.id?.videoId || null;
        if (videoId) localStorage.setItem(`yt_${query}`, videoId);
        return videoId;
    } catch (error) {
        console.error("YouTube fetch error:", error);
        return null;
    }
}