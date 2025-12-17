import {setStoredUser} from "../utils/userStorage.ts";

const API_URL = "https://api.narrowroad-model.com"; // ✅ 전역 충돌 방지

export function initLogin() {
    console.log("✅ login.ts 로드됨");

    // 로그인정보 삭제
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userInfo"); // 유저정보 삭제

    const loginForm = document.getElementById("login-form") as HTMLFormElement;
    if (!loginForm) {
        console.error("❌ 로그인 폼을 찾을 수 없음");
        return;
    }

    // ✅ 폼 제출 이벤트 처리
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // 기본 제출 방지

        // ✅ 기존 토큰 삭제
        localStorage.removeItem("accessToken");
        // ✅ 기존 유저정보 삭제
        localStorage.removeItem("userInfo");
        console.log("🗑️ 기존 로그인 토큰 삭제됨");

        const adminId = (document.getElementById("adminId") as HTMLInputElement).value.trim();
        const password = (document.getElementById("password") as HTMLInputElement).value.trim();
        const autoLoginChecked = (document.getElementById("agree") as HTMLInputElement).checked;

        if (!adminId || !password) {
            alert("아이디와 비밀번호를 입력해주세요.");
            return;
        }

        // 글로벌
        window.showLoading(); // ✅ 로딩 시작
        try {
            const response = await fetch(`${API_URL}/model_admin_login?func=login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({adminId, password}),
            });

            const result = await response.json();

            if (response.ok) {
                await handlePostLogin(result, autoLoginChecked);
            } else {
                alert(result.message || "로그인 실패. 다시 시도하세요.");
            }
        } catch (error) {
            console.error("❌ 로그인 요청 중 오류 발생:", error);
            alert("서버 오류가 발생했습니다. 다시 시도하세요.");
        } finally {
            // 글로벌
            window.hideLoading(); // ✅ 로딩 종료
        }
    });

    // ✅ 카카오 로그인 버튼 이벤트 등록
    const kakaoLoginBtn = document.getElementById("kakao-login-btn");
    if (kakaoLoginBtn) {
        kakaoLoginBtn.addEventListener("click", handleKakaoLogin);
    }
}

// ✅ 카카오 로그인 처리 함수
function handleKakaoLogin() {
    const KAKAO_CLIENT_ID = "240886095629b93f9655026145a39487";
    const KAKAO_REDIRECT_URI = "https://zeroadmin.kr/html/kakao-callback.html";
    // 1) state 생성(보안/상관관계용) + 저장
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const state = Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
    sessionStorage.setItem("kakao_state", state);

    // 2) 인가 URL (redirect_uri/state는 반드시 인코딩)
    const kakaoAuthURL =
        `https://kauth.kakao.com/oauth/authorize` +
        `?response_type=code` +
        `&client_id=${encodeURIComponent(KAKAO_CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}` +
        `&state=${encodeURIComponent(state)}`;

    // 환경 체크
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const agreeEl = document.getElementById("agree") as HTMLInputElement | null;
    const autoLoginChecked = !!agreeEl?.checked;

    // 3) 콜백 메시지 핸들러 (origin + type + state 검증)
    const onMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        const data = event.data || {};
        if (data.type !== "kakao-auth") return;

        const expectedState = sessionStorage.getItem("kakao_state");
        if (!expectedState || data.state !== expectedState) {
            console.warn("Invalid state", {got: data.state, expected: expectedState});
            alert("로그인 보안 검증에 실패했습니다. 다시 시도해주세요.");
            return;
        }

        const {code, error} = data;
        if (error || !code) {
            console.error("❌ Kakao OAuth error or code missing:", error);
            alert("카카오 로그인 실패. 다시 시도하세요.");
            return;
        }

        try {
            const resp = await fetch(`${API_URL}/model_admin_login?func=kakao-login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({code, state: expectedState}), // 서버로 state도 전달(선택)
            });
            const body = await resp.json();

            if (resp.ok && body.accessToken) {
                await handlePostLogin(body, autoLoginChecked);
            } else if (resp.ok && body.redirectUrl) {
                window.location.href = body.redirectUrl;
            } else {
                console.error("❌ 카카오 로그인 실패 응답:", body);
                alert("카카오 로그인 실패. 다시 시도하세요.");
            }
        } catch (e) {
            console.error("❌ 카카오 로그인 요청 오류:", e);
            alert("서버 오류가 발생했습니다. 다시 시도하세요.");
        }
    };

    if (isMobile) {
        // 모바일: 전체 리디렉트 플로우
        window.location.href = kakaoAuthURL;
        return;
    }

    // 4) PC: 팝업 플로우 (리스너 먼저 등록)
    window.addEventListener("message", onMessage, {once: true});

    const loginPopup = window.open(kakaoAuthURL, "kakaoLogin", "width=500,height=700");
    if (!loginPopup) {
        // 팝업 차단 시 폴백
        window.location.href = kakaoAuthURL;
    }
}

// 로그인정보 검증
async function handlePostLogin(data: any, autoLoginChecked: boolean = false) {
    try {
        // 🔐 토큰 저장
        localStorage.setItem("accessToken", data.accessToken);
        if (autoLoginChecked) {
            console.log("✅ 로그인 성공 → 자동로그인 활성화");
            localStorage.setItem("refreshToken", data.refreshToken);
        } else {
            console.log("✅ 로그인 성공 → 자동로그인 삭제");
            localStorage.removeItem("refreshToken");
        }
        console.log("✅ 로그인 성공 → 토큰 저장 완료!");

        // 🧑‍💻 사용자 정보 조회
        const meRes = await fetch(`${API_URL}/model_admin_login?func=me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${data.accessToken}`
            },
            mode: "cors",
        });

        if (!meRes.ok) {
            console.error("❌ 사용자 정보 불러오기 실패:", meRes.status);
            alert("유저 정보를 불러오지 못했습니다.");
            return;
        }

        const userInfo = await meRes.json();

        // 📦 일반 계정이면 userInfo 저장
        if (userInfo.userId) {
            const res = await fetch(`${API_URL}/model_user_setting?func=get-user&userId=${userInfo.userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${data.accessToken}`
                },
                mode: "cors",
            });

            if (res.ok) {
                const {user} = await res.json();
                setStoredUser(user);
                console.log("✅ 사용자 정보 저장 완료");
            } else {
                const errorBody = await res.text();
                console.error("❌ 사용자 정보 조회 실패:", res.status, errorBody);
                alert("사용자 정보를 불러오지 못했습니다.");
                return;
            }
        }
        // ✅ 권한별 홈으로 이동
        if (userInfo?.grade === 3) {
            window.location.href = "/html/franchiseHome.html";
        } else if (userInfo?.grade === 1 || userInfo?.grade === 2) {
            window.location.href = "/html/adminHome.html";
        } else {
            window.location.href = "/html/home.html";
        }

    } catch (error) {
        console.error("❌ postLogin 처리 오류:", error);
        alert("로그인 후 처리 중 오류가 발생했습니다.");
    }
}
