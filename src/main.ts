import { getUserData } from "./ts/auth";
import "./ts/login"; // ✅ 로그인 관련 스크립트 불러오기

// 페이지 로드 시 사용자 정보 확인
document.addEventListener("DOMContentLoaded", () => {
    getUserData();
});