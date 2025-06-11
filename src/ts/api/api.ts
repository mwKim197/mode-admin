const API_URL = "https://api.narrowroad-model.com";

/**
 * ✅ 공통 API 요청 함수
 * @param endpoint API 엔드포인트 (예: `/me`)
 * @param options fetch 옵션 (기본값: GET 요청)
 * @returns 응답 JSON 데이터 (자동으로 토큰 추가 & 만료 시 로그아웃)
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const isLoginPage =
        window.location.pathname.includes("/html/log.html") ||
        window.location.pathname === "/";

    // ✅ 로그인 페이지에서는 실행하지 않음
    if (isLoginPage) {
        return {
            ok: false,
            status: 200,
            json: async () => ({ message: "로그인 페이지에서는 인증 요청을 하지 않습니다." }),
        };
    }

    const token = localStorage.getItem("authToken");

    if (!token) {
        console.log("❌ 토큰이 없습니다. 로그인 페이지로 이동합니다.");
        window.location.href = "/index.html";
        return {
            ok: false,
            status: 401,
            json: async () => ({ message: "인증 토큰이 없습니다." }),
        };
    }

    // ✅ 기본 옵션 설정 (토큰 자동 추가)
    const fetchOptions: RequestInit = {
        ...options,
        headers: {
            ...options.headers,
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        }
    };

    // 글로벌
    window.showLoading(); // ✅ 로딩 시작

    try {
        const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

        if (response.status === 401 || response.status === 403) {
            const resJson = await response.json();
            console.error("❌ 인증 실패:", resJson.message);

            alert(resJson.message || "세션이 만료되었습니다. 다시 로그인해주세요.");
            localStorage.removeItem("authToken");
            window.location.href = "/index.html";
            return {
                ok: false,
                status: response.status,
                json: async () => resJson,
            };
        }
        return response;
    } catch (error) {
        console.error("❌ API 요청 오류:", error);
        return {
            ok: false,
            status: 500,
            json: async () => ({ message: "❌ API 요청 오류" }),
        };
    } finally {
        // 글로벌
        window.hideLoading(); // ✅ 로딩 종료
    }
}
