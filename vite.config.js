import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                search: resolve(__dirname, "search.html"),
                detail: resolve(__dirname, "detail.html"),
                watchlist: resolve(__dirname, "watchlist.html"),
                browse: resolve(__dirname, "browse.html"),
            },
        },
    },
});