import {bootstrapAuth, getToken, logout} from "../common/auth.ts";

const API_URL = "https://api.narrowroad-model.com";

export async function fetchWithAuth(
    endpoint: string,
    options: RequestInit = {},
    showLoading = true
) {
    const isLoginPage =
        window.location.pathname.includes("/html/log.html") ||
        window.location.pathname === "/";

    // 로그인 페이지에서는 인증 요청 안 함
    if (isLoginPage) {
        return {
            ok: false,
            status: 200,
            json: async () => ({message: "login page"}),
        };
    }

    // 🔥 1️⃣ accessToken 없으면 → refresh 시도
    let accessToken = getToken();
    if (!accessToken) {
        const ok = await bootstrapAuth();
        if (!ok) {
            logout();
            return {
                ok: false,
                status: 401,
                json: async () => ({message: "인증 필요"}),
            };
        }
        accessToken = getToken();
    }

    const fetchOptions: RequestInit = {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    };

    if (showLoading) window.showLoading();

    try {
        const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

        // 🔥 2️⃣ accessToken 만료 → refresh → 재시도
        if (response.status === 401 || response.status === 403) {
            const ok = await bootstrapAuth();
            if (!ok) {
                logout();
                return response;
            }

            const newToken = getToken();
            return fetch(`${API_URL}${endpoint}`, {
                ...fetchOptions,
                headers: {
                    ...(fetchOptions.headers || {}),
                    Authorization: `Bearer ${newToken}`,
                },
            });
        }

        return response;
    } catch (error) {
        console.error("❌ API 요청 오류:", error);
        return {
            ok: false,
            status: 500,
            json: async () => ({message: "API 요청 오류"}),
        };
    } finally {
        if (showLoading) window.hideLoading();
    }
}


// 로딩없는요청
export function fetchWithoutLoading(endpoint: string, options: RequestInit = {}) {
    return fetchWithAuth(endpoint, options, false);
}
