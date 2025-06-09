import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

export default {
    plugins: [
        tailwindcss(), // ✅ Tailwind 4에서는 이 방식으로 사용해야 함
        autoprefixer(),
    ],
};
