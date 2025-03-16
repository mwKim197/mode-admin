import { defineConfig } from "vite";

export default defineConfig({
    css: {
        postcss: "./postcss.config.js", // ✅ PostCSS 설정 파일 불러오기
    }
});