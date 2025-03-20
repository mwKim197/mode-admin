import { getUserData } from "./ts/auth";
import "./ts/login"; // ✅ 로그인 관련 스크립트 불러오기

// 📌 main.ts (불필요한 코드 로딩 방지)
document.addEventListener("DOMContentLoaded", async () => {
    console.log("✅ main.ts 실행됨");
    await getUserData();
    // 📌 현재 페이지 URL 확인
    const path = window.location.pathname;
    console.log("path: ", path);
    if (path === "/index.html") {
        console.log("📌 로그인 페이지 - login.ts 로드");
        import("./ts/login").then((module) => {
            module.initLogin(); // login.ts의 함수 실행
        });
    } else if (path === "/html/register.html") {
        console.log("📌 회원가입 페이지 - register.ts 로드");
        import("./ts/register").then((module) => {
            module.initRegister();
        });
    }  else {
        console.log("📌 기본 페이지");

    }
});
