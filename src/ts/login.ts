//import {checkAuth} from "./auth.ts";
const API_URL = "https://api.narrowroad-model.com"; // ✅ 전역 객체와 충돌 방지

document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ login.ts 파일이 정상적으로 로드되었습니다.");
    //checkAuth(); // ✅ 로그인 상태 체크 → 로그인된 사용자는 `modelAdmin.html`로 이동

    const loginForm = document.getElementById("login-form") as HTMLFormElement;

    if (!loginForm) {
        console.error("❌ 로그인 폼을 찾을 수 없습니다.");
        return;
    }

    // ✅ 기본적인 Form Submit 이벤트를 완전히 막음
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // ✅ 폼 제출 동작 방지

        const adminId = (document.getElementById("adminId") as HTMLInputElement).value.trim();
        const password = (document.getElementById("password") as HTMLInputElement).value.trim();

        if (!adminId || !password) {
            alert("아이디와 비밀번호를 입력해주세요.");
            return;
        }

        try {
            // ✅ 로그인 API 호출
            const response = await fetch(`${API_URL}/model_admin_login?func=login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminId, password }),
                mode: "cors",
            });

            const result = await response.json();

            if (response.ok) {
                // ✅ 로그인 성공 시 토큰 저장
                localStorage.setItem("authToken", result.token);
                console.log("✅ 로그인 성공 → 토큰 저장 완료!");

                // ✅ 로그인 성공 시 페이지 이동
                window.location.href = "/html/main.html";
            } else {
                alert(result.message || "로그인 실패. 다시 시도하세요.");
            }
        } catch (error) {
            console.error("❌ 로그인 오류:", error);
            alert("서버 오류가 발생했습니다. 다시 시도하세요.");
        }
    });
});

// ✅ 카카오 로그인 처리
document.getElementById("kakao-login-btn")?.addEventListener("click", () => {
    const KAKAO_CLIENT_ID = "240886095629b93f9655026145a39487";
    const KAKAO_REDIRECT_URI = "http://model-web-admin.s3-website.ap-northeast-2.amazonaws.com/html/kakao-callback.html";

    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}`;

    // 📱 모바일 환경 감지 (너비 768px 이하 or 모바일 UserAgent)
    const isMobile = window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);

    if (isMobile) {
        // 🔹 모바일 → 리디렉트 방식 사용
        console.log("📱 모바일 환경 → 리디렉트 방식 사용");
        window.location.href = kakaoAuthURL;
    } else {
        // ✅ PC → 팝업 창에서 로그인 실행
        console.log("💻 PC 환경 → 팝업 로그인 사용");
        const loginPopup = window.open(kakaoAuthURL, "kakaoLogin", "width=500,height=700");

        // ✅ 팝업 창에서 로그인 완료 후, 부모 창으로 메시지 전달받음
        window.addEventListener("message", (event) => {
            if (event.origin !== "http://model-web-admin.s3-website.ap-northeast-2.amazonaws.com") return;

            const { code } = event.data;
            if (code) {
                console.log("✅ 카카오 로그인 코드 받음:", code);
                loginPopup?.close(); // ✅ 로그인 창 닫기

                // Lambda로 로그인 요청 보내기
                fetch(`${API_URL}/model_admin_login?func=kakao-login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code }),
                })
                    .then(response => response.json().then(result => ({ status: response.status, body: result })))
                    .then(({ body }) => {
                        if (body.token) {
                            localStorage.setItem("authToken", body.token);
                            console.log("✅ 로그인 성공 → 토큰 저장 완료!");
                            window.location.href = "/html/main.html"; // ✅ 로그인 완료 후 메인 페이지 이동
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
});