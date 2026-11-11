import {fetchWithAuth} from "../api/api.ts";
import {AdminUserInfo, DecodedToken} from "../types/adminUser.ts";
import {jwtDecode} from "jwt-decode";
import {setStoredUser} from "../utils/userStorage.ts";
import {apiGet} from "../api/apiHelpers.ts";
import {getRefreshTokenForAutoLogin} from "../utils/biometricAuth.ts";
import {API_BASE_URL as API_URL} from "../config/apiConfig.ts";

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

    if (!res.ok) {
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
        "/html/categoryAndMenuMerge.html": [1, 2],
        "/html/notice.html?type=admin": [1, 2],
        "/html/notice.html?type=notice": [1, 2],
        "/html/notice.html?type=store": [1, 2],
        "/html/notice.html?type=news": [1, 2],
        "/html/notice.html?type=machine": [1, 2],
        "/html/empowerment.html": [1, 2],
        "/html/adminEmpowerment.html": [1, 2],
        "/html/register.html": [1, 2],
        "/html/franchise.html": [1, 2],
        "/html/adminLog.html": [1, 2],
        "/html/adminLogDetail.html": [1, 2],
        "/html/billing.html": [1, 2, 3, 4],
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
export function clearLoginContext() {
    for (const storage of [sessionStorage, localStorage]) {
        storage.removeItem("accessToken");
        storage.removeItem("userInfo");
    }
}

let leaving = false;
export function logout(message?: string) {
    if (leaving) return;
    leaving = true;
    clearLoginContext();
    if (message) alert(message);
    window.location.replace("/html/log.html?reauth=1");
}

/**
 * ✅ 로그인 세션확인
 */
export function getToken() {
    return sessionStorage.getItem("accessToken")
        || localStorage.getItem("accessToken");
}

/**
 * ✅ 앱 시작 / 토큰 만료 시 자동 로그인 복구
 */
let refreshInFlight: Promise<boolean> | undefined;
export function bootstrapAuth(force = false): Promise<boolean> {
    // 1️⃣ accessToken 있으면 그대로 통과
    const accessToken = getToken();
    if (accessToken && !force) return Promise.resolve(true);
    // 대리 로그인 토큰을 원래 관리자 계정의 refreshToken으로 교체하지 않는다.
    if (sessionStorage.getItem("accessToken")) return Promise.resolve(false);
    return refreshInFlight ??= refreshAccessToken().finally(() => { refreshInFlight = undefined; });
}

async function refreshAccessToken(): Promise<boolean> {
    // 2️⃣ refreshToken 없으면 로그인 불가
    const refreshToken = await getRefreshTokenForAutoLogin();
    if (!refreshToken) return false;

    // 3️⃣ refresh 요청
    const res = await fetch(`${API_URL}/model_admin_login?func=refresh`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({refreshToken}),
    });

    if ([400, 401, 403].includes(res.status)) {
        localStorage.removeItem("refreshToken");
        return false;
    }
    if (!res.ok) throw new Error("토큰 갱신 요청 실패");

    const data = await res.json();

    // 4️⃣ 새 accessToken 저장
    if (leaving || typeof data.accessToken !== "string" || !data.accessToken) return false;
    if (sessionStorage.getItem("accessToken")) return false;
    localStorage.setItem("accessToken", data.accessToken);
    return true;
}
