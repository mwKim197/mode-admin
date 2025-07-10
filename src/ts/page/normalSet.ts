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
        'input[name="player-id"]'
      ) as HTMLInputElement;
      if (storeNameInput) {
        storeNameInput.value = data.user.storeName || "";
      }

      // 매장 연락처 설정
      const telInput = document.querySelector("#tel-input") as HTMLInputElement;
      if (telInput) {
        telInput.value = data.user.tel || "";
      }

      // 한번에 결제 가능한 최대 잔 수 설정
      const limitCountInput = document.querySelector(
        '.in-box input[type="text"]'
      ) as HTMLInputElement;
      if (limitCountInput) {
        limitCountInput.value = data.user.limitCount || "10";
      }

      // 원격 주소 설정
      const remoteAddressInput = document.querySelector(
        'input[placeholder="원격 주소"]'
      ) as HTMLInputElement;
      if (remoteAddressInput) {
        remoteAddressInput.value = data.user.ipAddress || "";
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

    // 수정된 필드만 추가
    let hasChanges = false;
    let hasPasswordChange = false;

    // 원격 주소가 수정되었는지 확인
    if (remoteAddressInput && remoteAddressInput.value !== "") {
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
      hasPasswordChange = true;
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
      hasChanges = true;
    }

    // 수정할 내용이 없으면 저장하지 않음
    if (!hasChanges && !hasPasswordChange) {
      showToastMessage("변경사항이 없습니다.");
      return;
    }

    // 일반 정보 업데이트 (비밀번호 제외)
    if (hasChanges) {
      const updateData: any = {
        userId: currentUserId,
        adminId: currentUserId,
      };

      // 원격 주소 추가
      if (remoteAddressInput && remoteAddressInput.value !== "") {
        updateData.ipAddress = remoteAddressInput.value;
      }

      // 한번에 결제 가능한 최대 잔 수 추가
      if (
        limitCountInput &&
        currentLimitCount !== "" &&
        currentLimitCount !== originalLimitCount
      ) {
        updateData.limitCount = parseInt(currentLimitCount);
      }

      console.log("📤 일반 정보 API 요청:", updateData);

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
      console.log("📥 일반 정보 API 응답:", result);
    }

    // 비밀번호 업데이트 (별도 API)
    if (hasPasswordChange) {
      const passwordData = {
        userId: currentUserId,
        newPassword: passwordInput.value,
        adminId: currentUserId,
      };

      console.log("📤 비밀번호 API 요청:", passwordData);

      const passwordResponse = await fetch(
        `https://api.narrowroad-model.com/model_user_setting?func=update-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(passwordData),
        }
      );

      const passwordResult = await passwordResponse.json();
      console.log("📥 비밀번호 API 응답:", passwordResult);
    }

    showToastMessage("변경사항이 저장되었습니다.");

    // 저장 성공 시 비밀번호 필드를 ******로 초기화
    if (passwordInput) {
      passwordInput.value = "******";
    }
  } catch (error) {
    console.error("❌ 저장 중 오류:", error);
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
