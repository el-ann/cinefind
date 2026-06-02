export function getParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

export function setLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

export function getLocalStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

export function renderListWithTemplate(templateFn, parentElement, list) {
    parentElement.innerHTML = list.map(templateFn).join("");
    // Fade in images after render
    parentElement.querySelectorAll("img").forEach((img) => {
        img.addEventListener("load", () => img.classList.add("loaded"));
        if (img.complete) img.classList.add("loaded");
    });
}