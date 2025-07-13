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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminId, password }),
            });

            const result = await response.json();
            console.log("📥 로그인 응답:", response.status, result); // ✅ 응답 전체 출력

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
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}`;

    // 📱 모바일 환경 체크
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const autoLoginChecked = (document.getElementById("agree") as HTMLInputElement).checked;

    if (isMobile) {
        console.log("📱 모바일 환경 → 리디렉트 방식");
        window.location.href = kakaoAuthURL;
    } else {
        console.log("💻 PC 환경 → 팝업 로그인 사용");
        const loginPopup = window.open(kakaoAuthURL, "kakaoLogin", "width=500,height=700");

        window.addEventListener("message", (event) => {
            if (event.origin !== "https://zeroadmin.kr") return;
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
                    .then(async (body) => {
                        if (body) {
                            // 토큰 후 처리
                            await handlePostLogin(body, autoLoginChecked);
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
        console.log("사용자 정보:", userInfo);

        // 📦 일반 계정이면 userInfo 저장
        if (userInfo.grade === 4 && userInfo.userId) {
            const res = await fetch(`${API_URL}/model_user_setting?func=get-user&userId=${userInfo.userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${data.accessToken}`
                },
                mode: "cors",
            });

            if (res.ok) {
                const { user } = await res.json();
                localStorage.setItem("userInfo", JSON.stringify(user));
                console.log("✅ 일반 사용자 정보 저장 완료");
            } else {
                const errorBody = await res.text();
                console.error("❌ 사용자 정보 조회 실패:", res.status, errorBody);
                alert("사용자 정보를 불러오지 못했습니다.");
                return;
            }
        }

        // ✅ 홈으로 이동
        window.location.href = "/html/home.html";
    } catch (error) {
        console.error("❌ postLogin 처리 오류:", error);
        alert("로그인 후 처리 중 오류가 발생했습니다.");
    }
}
