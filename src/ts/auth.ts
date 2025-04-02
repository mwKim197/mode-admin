import { fetchWithAuth } from "./api";

/**
 * ✅ 로그인된 사용자 정보 가져오기
 */
export async function getUserData() {
    const res = await fetchWithAuth("/model_admin_login?func=me");

    if (!res.ok) {
        console.warn("❌ 사용자 정보 요청 실패:", res.status);
        return;
    }

    const data = await res.json();
    console.log("✅ 사용자 정보:", data);

    const grade = data?.grade;

    if (!grade) {
        console.warn("❌ 사용자 grade 정보가 없습니다.");
        return;
    }

    // ✅ 권한별 접근 허용 페이지 정의
    const pageAccess: Record<string, number[]> = {
        "/html/notice.html": [1, 2],
        "/html/notice-edit.html": [1, 2],
    };

    const gradeHome: Record<number, string> = {
        1: "/html/dashboard.html",
        2: "/html/dashboard.html",
        3: "/html/franchise_dashboard.html",
        4: "/html/store_dashboard.html",
    };

    const pathname = window.location.pathname;
    const allowedGrades = pageAccess[pathname];

    if (allowedGrades && !allowedGrades.includes(grade)) {
        alert("이 페이지에 접근할 수 있는 권한이 없습니다.");
        window.location.href = gradeHome[grade] || "/index.html";
    }
}

/**
 * ✅ 로그아웃
 */
export function logout() {
    localStorage.removeItem("authToken");
    window.location.href = "/index.html";
}