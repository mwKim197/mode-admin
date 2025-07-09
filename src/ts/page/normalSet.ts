export function initNormalSet() {
  // 페이지 로드 시 매장 정보 가져오기
  loadStoreInfo();

  initSaveButtonHandler();
}

// 저장 버튼 이벤트 핸들러
function initSaveButtonHandler() {
  const saveButton = document.querySelector(
    ".btn-outline"
  ) as HTMLButtonElement;

  if (saveButton) {
    saveButton.addEventListener("click", (e) => {
      e.preventDefault();
      saveStoreInfo();
    });
  }
}

// 전역 변수로 원래 데이터 저장
let originalUserData: any = null;

// 매장 정보 로드 함수
async function loadStoreInfo() {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const userId = userInfo.userId;

    if (!userId) {
      return;
    }

    const response = await fetch(
      `https://api.narrowroad-model.com/model_user_setting?func=get-user&userId=${userId}`
    );
    const data = await response.json();

    if (data && data.user) {
      // 원래 데이터 저장 (나중에 비교용)
      originalUserData = data.user;

      // 매장명 설정
      const storeNameInput = document.querySelector(
        'input[value="mypas"]'
      ) as HTMLInputElement;
      if (storeNameInput) {
        storeNameInput.value = data.user.storeName || "";
      }

      // 매장 연락처 설정
      const telInput = document.querySelector(
        'input[placeholder="010-1234-5678"]'
      ) as HTMLInputElement;
      if (telInput) {
        telInput.value = data.user.tel || "";
      }

      // 한번에 결제 가능한 최대 잔 수 설정
      const limitCountInput = document.querySelector(
        'input[value="20"]'
      ) as HTMLInputElement;
      if (limitCountInput) {
        limitCountInput.value = data.user.limitCount || "10";
      }
    }
  } catch (error) {
    showToastMessage("매장 정보 로드에 실패했습니다.");
  }
}

// 매장 정보 저장 함수
async function saveStoreInfo() {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      return;
    }

    // 현재 사용자 ID
    const currentUserId = userInfo.userId || "zero001";

    // 폼 데이터 수집
    const remoteAddressInput = document.querySelector(
      'input[placeholder="원격 주소"]'
    ) as HTMLInputElement;
    const passwordInput = document.querySelector(
      'input[type="password"]'
    ) as HTMLInputElement;
    const limitCountInput = document.querySelector(
      'input[value="20"]'
    ) as HTMLInputElement;

    // API 요청 body (필수 필드)
    const updateData: any = {
      userId: currentUserId,
      adminId: currentUserId,
    };

    // 수정된 필드만 추가
    let hasChanges = false;

    // 원격 주소가 수정되었는지 확인
    if (remoteAddressInput && remoteAddressInput.value !== "") {
      updateData.ipAddress = remoteAddressInput.value;
      hasChanges = true;
    }

    // 비밀번호가 수정되었는지 확인 (******가 아닌 경우만)
    if (
      passwordInput &&
      passwordInput.value !== "" &&
      passwordInput.value !== "******"
    ) {
      // 비밀번호 유효성 검사
      if (passwordInput.value.length < 6) {
        showToastMessage("비밀번호는 6자리 이상이어야 합니다.");
        return;
      }
      updateData.password = passwordInput.value;
      hasChanges = true;
    }

    // 한번에 결제 가능한 최대 잔 수가 수정되었는지 확인
    // 저장된 원래 데이터와 비교
    const currentLimitCount = limitCountInput?.value || "";
    const originalLimitCount = originalUserData?.limitCount?.toString() || "";

    if (
      limitCountInput &&
      currentLimitCount !== "" &&
      currentLimitCount !== originalLimitCount
    ) {
      updateData.limitCount = parseInt(currentLimitCount);
      hasChanges = true;
    }

    // 수정할 내용이 없으면 저장하지 않음
    if (!hasChanges) {
      showToastMessage("변경사항이 없습니다.");
      return;
    }

    // body에 어떤 데이터가 가는지 콘솔로 확인
    console.log("📤 API 요청 body:", updateData);

    // API 호출하여 저장
    const response = await fetch(
      `https://api.narrowroad-model.com/model_user_setting?func=update-user`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updateData),
      }
    );

    const result = await response.json();

    if (result.message && result.message.includes("✅")) {
      showToastMessage("변경사항이 저장되었습니다.");
      // 저장 성공 시 비밀번호 필드를 ******로 초기화
      if (passwordInput) {
        passwordInput.value = "******";
      }
    } else {
      showToastMessage(result.message || "저장에 실패했습니다.");
    }
  } catch (error) {
    showToastMessage("저장 중 오류가 발생했습니다.");
  }
}

// 토스트 메시지 표시 함수
function showToastMessage(message: string) {
  const toast = document.createElement("div");
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #4CAF50;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 10000;
    font-size: 14px;
  `;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3000);
}
