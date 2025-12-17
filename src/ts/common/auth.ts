import {fetchWithAuth} from "../api/api.ts";
import {AdminUserInfo, DecodedToken} from "../types/adminUser.ts";
import {jwtDecode} from "jwt-decode";
import {setStoredUser} from "../utils/userStorage.ts";
import {apiGet} from "../api/apiHelpers.ts";

/**
 * ✅ 토큰 사용자 권한 확인
 */
export function getUserFromToken(): DecodedToken | null {
    const accessToken = getToken();
    if (!accessToken) return null;

    try {
        return jwtDecode<DecodedToken>(accessToken);
    } catch (err) {
        console.error("❌ 토큰 디코딩 실패:", err);
        return null;
    }
}

/**
 * ✅ 로그인된 사용자 권한 확인
 */
export async function checkUserAccess() {
    const res = await fetchWithAuth("/model_admin_login?func=me");

    if (res.status === 401 || res.status === 403) {
        console.warn("🚫 인증 실패 - 로그인 페이지로 이동");
        localStorage.removeItem("accessToken");
        window.location.href = "/html/log.html";
        return;
    }

    const data = await res.json();

    const grade = data?.grade;

    if (!grade) {
        console.warn("❌ 사용자 grade 정보가 없습니다.");
        return;
    }

    // ✅ 권한별 접근 허용 페이지 정의
    const pageAccess: Record<string, number[]> = {
        "/html/notice.html": [1, 2],
        "/html/notice-edit.html": [1, 2],
        "/html/noticeList.html": [1, 2, 3, 4],
        "/html/user-register.html": [1, 2],
        "/html/menuMerge.html": [1, 2, 3],
        "/html/notice.html?type=admin": [1, 2],
        "/html/notice.html?type=notice": [1, 2],
        "/html/notice.html?type=store": [1, 2],
        "/html/notice.html?type=news": [1, 2],
        "/html/notice.html?type=machine": [1, 2],
        "/html/empowerment.html": [1, 2],
        "/html/adminEmpowerment.html": [1, 2],
        "/html/register.html": [1, 2],
        "/html/franchise.html": [1, 2],
    };

    const gradeHome: Record<number, string> = {
        1: "/html/home.html",
        2: "/html/home.html",
        3: "/html/franchiseHome.html",
        4: "/html/home.html",
        //[TODO] 권한별 home화면 만들어넣기
    };

    const pathname = window.location.pathname;
    const allowedGrades = pageAccess[pathname];

    if (allowedGrades && !allowedGrades.includes(grade)) {
        alert("이 페이지에 접근할 수 있는 권한이 없습니다.");
        window.location.href = gradeHome[grade] || "/html/log.html";
    }
}

/**
 * ✅ 로그인된 사용자 정보 확인
 */
export async function getUserData(): Promise<AdminUserInfo | null> {
    const res = await fetchWithAuth("/model_admin_login?func=me");

    if (!res.ok) {
        console.warn("❌ 사용자 정보를 가져오지 못했습니다.");
        return null;
    }

    const data = await res.json();

    return {
        adminId: data.adminId,
        name: data.name,
        grade: data.grade,
        franchiseId: data.franchiseId,
        userId: data.userId,
    };
}

export async function getUserInfo(userId: string | undefined) {

    if (userId) {
        const res = await apiGet(`/model_user_setting?func=get-user&userId=${userId}`);

        if (res.ok) {
            const {user} = await res.json();

            console.log("user: ", user);
            setStoredUser(user);
            console.log("✅ 사용자 정보 저장 완료");
        } else {
            if ("text" in res) {
                const errorBody = await res.text();
                console.error("❌ 사용자 정보 조회 실패:", res.status, errorBody);
            }

            alert("사용자 정보를 불러오지 못했습니다.");
            return;
        }
    }
}

/**
 * ✅ 로그아웃
 */
export function logout() {
    localStorage.removeItem("accessToken");
    window.location.href = "/log.html";
}

/**
 * ✅ 로그인 세션확인
 */
export function getToken() {
    return sessionStorage.getItem("accessToken")
        || localStorage.getItem("accessToken");
}