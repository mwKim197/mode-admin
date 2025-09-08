export async function initUserRegister() {
  console.log("✅ user-register.ts 로드됨");

  const form = document.getElementById("user-register-form") as HTMLFormElement;
  const phoneInput = document.getElementById("phoneNumber") as HTMLInputElement;
  if (!form) return;

  function formatPhoneNumber(value: string): string {
    const numbers = value.replace(/[^0-9]/g, "");
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
        7,
        11
      )}`;
    }
  }

  phoneInput?.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    const formatted = formatPhoneNumber(target.value);
    target.value = formatted;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    window.showLoading();

    const userId = (document.getElementById("userId") as HTMLInputElement)
      .value;
    const password = (document.getElementById("password") as HTMLInputElement)
      .value;
    const confirmPassword = (
      document.getElementById("confirmPassword") as HTMLInputElement
    ).value;
    const storeName = (document.getElementById("storeName") as HTMLInputElement)
      .value;
    const tel = (document.getElementById("phoneNumber") as HTMLInputElement)
      .value;

    if (!userId || !password || !confirmPassword || !storeName || !tel) {
      window.showToast("모든 필드를 입력해주세요.", 3000, "warning");
      return;
    }

    if (password !== confirmPassword) {
      window.showToast("비밀번호가 일치하지 않습니다.", 3000, "error");
      return;
    }

    try {
      const response = await fetch(
        "https://api.narrowroad-model.com/model_new_store",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            password,
            storeName,
            tel,
          }),
        }
      );

      if (response.ok) {
        window.showToast("매장계정생성이 완료되었습니다.", 3000, "success");
      } else {
        const error = await response.json();
        window.showToast(`등록 실패: ${error.message}`, 3000, "error");
      }
    } catch (error) {
      console.error("매장계정생성 오류:", error);
      window.showToast("등록 중 오류가 발생했습니다.", 3000, "error");
    } finally {
      window.hideLoading();
    }
  });
}
