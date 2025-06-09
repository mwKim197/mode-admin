/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./html/**/*.html",
        "./src/**/*.{js,ts,jsx,tsx}"  // 🔹 Vite 프로젝트에 맞게 설정
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};
