import {fetchWithAuth} from "../api/api.ts";

export function initRegister() {
    console.log("✅ register.ts 로드됨");

    const registerForm = document.getElementById("register-form") as HTMLFormElement;
    if (!registerForm) {
        console.error("❌ 회원가입 폼을 찾을 수 없음");
        return;
    }

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // 기본 제출 방지

        const adminId = (document.getElementById("adminId") as HTMLInputElement).value.trim();
        const password = (document.getElementById("password") as HTMLInputElement).value.trim();
        const number = (document.getElementById("number") as HTMLInputElement).value.trim();
        const confirmPassword = (document.getElementById("confirmPassword") as HTMLInputElement).value.trim();
        const privacyAgree = (document.getElementById("privacyAgree") as HTMLInputElement).checked;
        const kakaoAgree = (document.getElementById("kakaoAgree") as HTMLInputElement).checked;

        // 약관 전문
        const privacyContent = `
        - 수집 항목: 성명, 전화번호, 아이디, 비밀번호, 결제정보 등
        - 이용 목적: 회원관리, 서비스 제공, 카카오 알림톡 발송 등
        - 보유 기간: 이용 종료 후 5년 보관 (관련 법령에 따름)
        - 제3자 제공: 없음 (단, 결제/배송 등 서비스 제공 목적 위탁 가능)
        - 동의 거부 시 서비스 이용 제한 가능
        `;

        const kakaoContent = `
        - 수신 항목: 서비스 안내, 마케팅 및 이벤트 정보
        - 수신 방법: 카카오 알림톡, 카카오 채널 메시지 등
        - 보유 기간: 동의 철회 시까지
        - 동의는 선택 사항이며, 미동의해도 서비스 이용에 제한은 없습니다.
        `;

        if (!adminId || !password || !confirmPassword || !number) {
            alert("⚠️ 모든 필드를 입력해주세요.");
            return;
        }

        if (password !== confirmPassword) {
            alert("⚠️ 비밀번호가 일치하지 않습니다.");
            return;
        }

        if (password.length < 6) {
            alert("⚠️ 비밀번호는 최소 6자리 이상이어야 합니다.");
            return;
        }

        if (!privacyAgree) {
            alert("⚠️ 개인정보 수집 및 이용에 동의해주세요.");
            return;
        }

        try {
            // ✅ 회원가입 API 호출
            const response = await fetchWithAuth("/model_admin_user?func=register-admin", {
                method: "POST",
                body: JSON.stringify({
                    adminId,
                    password,
                    number,
                    privacyAgree,
                    privacyContent,
                    kakaoAgree,
                    kakaoContent,
                    agreedAt: new Date().toISOString()
                }),
                mode: "cors",
            });

            const result = await response.json();

            if (response.ok) {
                console.log("✅ 계정생성 성공 → 메인 페이지로 이동");
                alert("✅ 계정생성 성공! 메인 페이지로 이동합니다.");
                window.location.href = "/html/home.html";
            } else {
                alert(result.message || "회원가입 실패. 다시 시도하세요.");
            }
        } catch (error) {
            console.error("❌ 회원가입 오류:", error);
            alert("서버 오류가 발생했습니다. 다시 시도하세요.");
        }
    });

    const terms = {
        privacy: {
            title: "개인정보 수집 및 이용 동의서",
            body: `
      - 수집 항목: 성명, 전화번호, 아이디, 비밀번호, 결제정보 등<br/>
      - 이용 목적: 회원관리, 서비스 제공, 카카오 알림톡 발송 등<br/>
      - 보유 기간: 이용 종료 후 5년 보관 (관련 법령에 따름)<br/>
      - 제3자 제공: 없음 (단, 결제/배송 등 서비스 제공 목적 위탁 가능)<br/>
      - 동의 거부 시 서비스 이용 제한 가능
      `
        },
        kakao: {
            title: "카카오톡 수신 동의 안내",
            body: `
      - 수신 항목: 서비스 안내, 마케팅 및 이벤트 정보<br/>
      - 수신 방법: 카카오 알림톡, 카카오 채널 메시지 등<br/>
      - 보유 기간: 동의 철회 시까지<br/>
      - 동의는 선택 사항이며, 미동의해도 <br/>서비스 이용에 제한은 없습니다.
      `
        }
    };

    type ModalType = "privacy" | "kakao";

    function openModal(type: ModalType) {
        const backdrop = document.getElementById("modal-backdrop") as HTMLElement;
        const content = document.getElementById("modal-content") as HTMLElement;
        const titleEl = document.getElementById("modal-title") as HTMLElement;
        const bodyEl = document.getElementById("modal-body") as HTMLElement;

        backdrop.style.display = "flex";  // overlay는 flex
        content.style.display = "flex";   // container도 flex

        titleEl.innerText = terms[type].title;
        bodyEl.innerHTML = terms[type].body;
    }

    function closeModal() {
        const backdrop = document.getElementById("modal-backdrop") as HTMLElement;
        const content = document.getElementById("modal-content") as HTMLElement;

        backdrop.style.display = "none";
        content.style.display = "none";
    }


// 💡 전역 등록 (HTML에서 호출 가능하게)
    (window as any).openModal = openModal;
    (window as any).closeModal = closeModal;
}
