import { defineConfig } from "vite";
import { resolve, dirname } from "path"; // ✅ 여기서 dirname도 import 해줘야 함
import {fileURLToPath} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


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
                main: resolve(__dirname, 'index.html'),                                 // 기본 페이지
                login: resolve(__dirname, 'html/log.html'),                                 // 기본 페이지
                dashboard: resolve(__dirname, 'html/dashboard.html'),                   // 추가: 데시보드
                kakao: resolve(__dirname, 'html/kakao-callback.html'),                  // 추가: 카카오 콜백
                account: resolve(__dirname, 'html/link-account.html'),                  // 추가: 연동
                notice: resolve(__dirname, 'html/01.notice.html'),                         // ✅ 공지 페이지
                noticeEdit: resolve(__dirname, 'html/01.notice-edit.html'),                // ✅ 공지 등록
                adminNotice: resolve(__dirname, 'html/notice.html'),              // ✅ 관리자 공지 등록
                empowerment: resolve(__dirname, 'html/empowerment.html'),               // 추가: 권한관리
                register: resolve(__dirname, 'html/register.html'),                     // 추가: 회원가입 페이지
                franchise: resolve(__dirname, 'html/franchise_dashboard.html'),         // 추가: 회원가입 페이지
                store: resolve(__dirname, 'html/store_dashboard.html'),                 // 추가: 회원가입 페이지
                // 다른 html들도 여기에 추가 가능
            },
        },
    },
});