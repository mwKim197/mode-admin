import { fetchWithAuth } from "./api";

/**
 * ✅ 로그인된 사용자 정보 가져오기
 */
export async function getUserData() {
    const userData = await fetchWithAuth("?func=me");

    if (userData) {
        console.log("✅ 사용자 정보:", userData);
    } else {
        console.log("❌ 사용자 정보를 가져오지 못했습니다.");
    }
}

/**
 * ✅ 로그아웃
 */
export function logout() {
    localStorage.removeItem("authToken");
    window.location.href = "../../index.html";
}