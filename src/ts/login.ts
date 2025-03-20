const API_URL = "https://api.narrowroad-model.com"; // ✅ 전역 충돌 방지

export function initLogin() {
    console.log("✅ login.ts 로드됨");

    const loginForm = document.getElementById("login-form") as HTMLFormElement;
    if (!loginForm) {
        console.error("❌ 로그인 폼을 찾을 수 없음");
        return;
    }

    // ✅ 폼 제출 이벤트 처리
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // 기본 제출 방지

        // ✅ 기존 토큰 삭제
        localStorage.removeItem("authToken");
        console.log("🗑️ 기존 로그인 토큰 삭제됨");

        const adminId = (document.getElementById("adminId") as HTMLInputElement).value.trim();
        const password = (document.getElementById("password") as HTMLInputElement).value.trim();

        if (!adminId || !password) {
            alert("아이디와 비밀번호를 입력해주세요.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/model_admin_login?func=login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminId, password }),
                mode: "cors",
            });

            const result = await response.json();

            if (response.ok) {
                localStorage.setItem("authToken", result.token);
                console.log("✅ 로그인 성공 → 토큰 저장 완료!");
                window.location.href = "/html/main.html";
            } else {
                alert(result.message || "로그인 실패. 다시 시도하세요.");
            }
        } catch (error) {
            console.error("❌ 로그인 오류:", error);
            alert("서버 오류가 발생했습니다. 다시 시도하세요.");
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
    const KAKAO_REDIRECT_URI = "http://model-web-admin.s3-website.ap-northeast-2.amazonaws.com/html/kakao-callback.html";
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}`;

    // 📱 모바일 환경 체크
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (isMobile) {
        console.log("📱 모바일 환경 → 리디렉트 방식");
        window.location.href = kakaoAuthURL;
    } else {
        console.log("💻 PC 환경 → 팝업 로그인 사용");
        const loginPopup = window.open(kakaoAuthURL, "kakaoLogin", "width=500,height=700");

        window.addEventListener("message", (event) => {
            if (event.origin !== "http://model-web-admin.s3-website.ap-northeast-2.amazonaws.com") return;
            const { code } = event.data;
            if (code) {
                console.log("✅ 카카오 로그인 코드 받음:", code);
                loginPopup?.close();

                fetch(`${API_URL}/model_admin_login?func=kakao-login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code }),
                })
                    .then(response => response.json())
                    .then((body) => {
                        if (body.token) {
                            // ✅ 기존 토큰 삭제
                            localStorage.removeItem("authToken");
                            console.log("🗑️ 기존 로그인 토큰 삭제됨");

                            localStorage.setItem("authToken", body.token);
                            console.log("✅ 로그인 성공 → 토큰 저장 완료!");
                            window.location.href = "/html/main.html";
                        } else if (body.redirectUrl) {
                            console.log("✅ 신규 사용자 → 연동 페이지로 이동:", body.redirectUrl);
                            window.location.href = body.redirectUrl;
                        } else {
                            alert("카카오 로그인 실패. 다시 시도하세요.");
                        }
                    })
                    .catch(error => {
                        console.error("❌ 로그인 오류:", error);
                    });
            }
        });
    }
}