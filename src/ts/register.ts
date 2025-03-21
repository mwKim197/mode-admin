import {fetchWithAuth} from "./api.ts";

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
        const confirmPassword = (document.getElementById("confirmPassword") as HTMLInputElement).value.trim();

        if (!adminId || !password || !confirmPassword) {
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

        try {
            // ✅ 회원가입 API 호출
            const response = await fetchWithAuth("/model_admin_login?func=register-admin", {
                  method: "POST",
                  body: JSON.stringify({ adminId, password }),
                  mode: "cors",
              });

            const result = await response.json();

            if (response.ok) {
                console.log("✅ 회원가입 성공 → 로그인 페이지로 이동");
                alert("✅ 회원가입 성공! 로그인 페이지로 이동합니다.");
                window.location.href = "../index.html";
            } else {
                alert(result.message || "회원가입 실패. 다시 시도하세요.");
            }
        } catch (error) {
            console.error("❌ 회원가입 오류:", error);
            alert("서버 오류가 발생했습니다. 다시 시도하세요.");
        }
    });
}
