import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    base: "./", // ✅ 경로를 상대 경로로 설정 (필수!)
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
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),                   // 기본 entry
                notice: resolve(__dirname, 'public/html/notice.html'),   // 추가된 entry
            },
        },
    },
});