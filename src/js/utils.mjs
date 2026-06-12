// Shared utility functions used across all modules

// Reads a URL query parameter by name
// Example: getParam("id") from "/detail.html?id=123" returns "123"
export function getParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Saves data to localStorage as a JSON string
export function setLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Reads and parses data from localStorage
// Returns an empty array if key doesn't exist or data is corrupted
export function getLocalStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

// Renders a list of items into a parent element using a template function
// Also triggers fade-in animation on images after they load
export function renderListWithTemplate(templateFn, parentElement, list) {
    parentElement.innerHTML = list.map(templateFn).join("");
    parentElement.querySelectorAll("img").forEach((img) => {
        img.addEventListener("load", () => img.classList.add("loaded"));
        if (img.complete) img.classList.add("loaded");
    });
}