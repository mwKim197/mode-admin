import { getUserData } from "./ts/auth";
import "./ts/login";

// 📌 main.ts (불필요한 코드 로딩 방지)
document.addEventListener("DOMContentLoaded", async () => {
    console.log("✅ main.ts 실행됨");
    await getUserData();
    // 📌 현재 페이지 URL 확인
    const path = window.location.pathname;

    if (path === "/index.html" || path === "/") {
        console.log("📌 로그인 페이지 - login.ts 로드");
        import("./ts/login").then((module) => {
            module.initLogin(); // login.ts의 함수 실행
        });
    } else if (path === "/html/register.html") {
        console.log("📌 회원가입 페이지 - register.ts 로드");
        import("./ts/register").then((module) => {
            module.initRegister();
        });
    } else if (path === "/html/notice.html") {
        console.log("📌 공지사항 - notice.ts 로드");
        import("./ts/notice.ts").then((module) => {
            module.initNotice();
        });
    } else if (path === "/html/notice-edit.html") {
        console.log("📌 공지사항등록 - notice-edit.ts 로드");
        import("./ts/notice-edit.ts").then((module) => {
            module.initNoticeEdit();
        });
    } else if (path === "/html/franchise_dashboard.html") {
        console.log("🏘️ 프랜차이즈 - franchise.ts 로드");
        import("./ts/franchise.ts").then((module) => {
            module.franchiseEdit();
        });
    } else if (path === "/html/store_dashboard.html") {
        console.log("📌 공지사항등록 - store_dashboard.ts 로드");
        import("./ts/store.ts").then((module) => {
            module.storeEdit();
        });
    }  else {
        console.log("📌 기본 페이지");

    }
});
