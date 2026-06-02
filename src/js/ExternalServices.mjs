const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";
const PLACEHOLDER = "https://via.placeholder.com/500x750?text=No+Image";

const options = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
    },
};

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

export function getImageUrl(path) {
    return path ? `${IMG_BASE_URL}${path}` : PLACEHOLDER;
}

export async function getTrending(type = "movie", timeWindow = "week") {
    const data = await fetchData(`${BASE_URL}/trending/${type}/${timeWindow}`);
    return data.results;
}

export async function searchMedia(query, type = "movie") {
    const data = await fetchData(
        `${BASE_URL}/search/${type}?query=${encodeURIComponent(query)}&include_adult=false`
    );
    return data.results;
}

export async function getDetails(id, type = "movie") {
    const data = await fetchData(`${BASE_URL}/${type}/${id}?append_to_response=credits`);
    return data;
}

export async function getTrailerKey(id, type = "movie") {
    const data = await fetchData(`${BASE_URL}/${type}/${id}/videos`);
    const trailer = data.results.find(
        (v) => v.type === "Trailer" && v.site === "YouTube"
    );
    return trailer ? trailer.key : null;
}

export async function getGenres(type = "movie") {
    const data = await fetchData(`${BASE_URL}/genre/${type}/list`);
    return data.genres;
}

export async function getByGenre(genreId, type = "movie") {
    const data = await fetchData(
        `${BASE_URL}/discover/${type}?with_genres=${genreId}&sort_by=popularity.desc`
    );
    return data.results;
}