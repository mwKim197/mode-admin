import { defineConfig } from "vite";

export default defineConfig({
    css: {
        postcss: "./postcss.config.js",
    },
    optimizeDeps: {
        include: ["suneditor"],
    },
    build: {
        commonjsOptions: {
            transformMixedEsModules: true, // ✅ CommonJS 패키지를 ESM으로 변환
        },
    },
});