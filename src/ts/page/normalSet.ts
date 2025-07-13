import { ModelUser } from "../types/user";
import { apiGet, apiPut, apiPost } from "../api/apiHelpers";

// 파일 업로드 관련 전역 변수
let logoFile: File | null = null;
let iconFile: File | null = null;
let logoBase64: string = "";
let iconBase64: string = "";

export function initNormalSet() {
  // 페이지 로드 시 매장 정보 가져오기
  loadStoreInfo();

  initSaveButtonHandler();
  initFileUploadHandlers();
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
let originalUserData: ModelUser | null = null;

// 매장 정보 로드 함수
async function loadStoreInfo() {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const userId = userInfo.userId;

    if (!userId) {
      return;
    }

    const response = await apiGet(
      `/model_user_setting?func=get-user&userId=${userId}`
    );
    const data = await response.json();

    if (data && data.user) {
      // 원래 데이터 저장 (나중에 비교용)
      originalUserData = data.user as ModelUser;

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
        limitCountInput.value = data.user.limitCount || "";
      }

      // 전체 세척 예약 시간 설정
      const washTimeInput = document.querySelector(
        "#wash-time-input"
      ) as HTMLInputElement;
      if (washTimeInput) {
        washTimeInput.value = data.user.washTime || "";
      }

      // 원격 주소 설정
      const remoteAddressInput = document.querySelector(
        "#remote-address"
      ) as HTMLInputElement;
      if (remoteAddressInput) {
        remoteAddressInput.value = data.user.remoteAddress || "";
      }

      // 포인트 사용 체크박스 설정
      // payType이 false면 체크박스 켜짐 (true), payType이 true면 체크박스 꺼짐 (false)
      const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
      const pointCheckbox = allCheckboxes[0] as HTMLInputElement;
      if (pointCheckbox) {
        pointCheckbox.checked = !data.user.payType; // payType의 반대값
      }

      // 로고 이미지 표시
      if (data.user.logoUrl) {
        const logoPreview = document.getElementById(
          "logoPreview"
        ) as HTMLImageElement;
        if (logoPreview) {
          logoPreview.src = data.user.logoUrl;
          logoPreview.style.display = "block";

          // 이미지 로드 실패 시 처리 (S3 권한 문제 등)
          logoPreview.onerror = () => {
            logoPreview.style.display = "none";
          };
        }
      } else if (data.user.logoBase64) {
        // Base64 데이터가 있는 경우 (기존 코드 유지)
        const logoPreview = document.getElementById(
          "logoPreview"
        ) as HTMLImageElement;
        if (logoPreview) {
          logoPreview.src = data.user.logoBase64;
          logoPreview.style.display = "block";
        }
      }

      // 아이콘 이미지 표시
      if (data.user.iconUrl) {
        const iconPreview = document.getElementById(
          "iconPreview"
        ) as HTMLImageElement;
        if (iconPreview) {
          iconPreview.src = data.user.iconUrl;
          iconPreview.style.display = "block";

          // 이미지 로드 실패 시 처리 (S3 권한 문제 등)
          iconPreview.onerror = () => {
            iconPreview.style.display = "none";
          };
        }
      } else if (data.user.iconBase64) {
        // Base64 데이터가 있는 경우 (기존 코드 유지)
        const iconPreview = document.getElementById(
          "iconPreview"
        ) as HTMLImageElement;
        if (iconPreview) {
          iconPreview.src = data.user.iconBase64;
          iconPreview.style.display = "block";
        }
      }
    }
  } catch (error) {
    window.showToast("매장 정보 로드에 실패했습니다.", 3000, "error");
  }
}

// 매장 정보 저장 함수
async function saveStoreInfo() {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      return;
    }

    // 현재 사용자 ID
    const currentUserId = userInfo.userId || "zero001";

    // 폼 데이터 수집
    const storeNameInput = document.querySelector(
      'input[name="player-id"]'
    ) as HTMLInputElement;
    const telInput = document.querySelector("#tel-input") as HTMLInputElement;
    const remoteAddressInput = document.querySelector(
      "#remote-address"
    ) as HTMLInputElement;
    const passwordInput = document.querySelector(
      'input[type="password"]'
    ) as HTMLInputElement;
    const limitCountInput = document.querySelector(
      '.in-box input[type="text"]'
    ) as HTMLInputElement;
    const washTimeInput = document.querySelector(
      "#wash-time-input"
    ) as HTMLInputElement;
    // 포인트 사용 체크박스 선택자 수정
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    const pointCheckbox = allCheckboxes[0] as HTMLInputElement;

    // 수정된 필드만 추가
    let hasChanges = false;
    let hasPasswordChange = false;
    let hasFileChanges = false; // 파일 변경 체크 추가

    // 매장명이 수정되었는지 확인
    if (
      storeNameInput &&
      storeNameInput.value !== originalUserData?.storeName
    ) {
      hasChanges = true;
    }

    // 매장 연락처가 수정되었는지 확인
    if (telInput && telInput.value !== originalUserData?.tel) {
      hasChanges = true;
    }

    // 원격 주소가 수정되었는지 확인 (실제로 변경된 경우만)
    if (
      remoteAddressInput &&
      remoteAddressInput.value !== originalUserData?.remoteAddress
    ) {
      hasChanges = true;
    }

    // 전체 세척 예약 시간이 수정되었는지 확인
    if (washTimeInput && washTimeInput.value !== originalUserData?.washTime) {
      hasChanges = true;
    }

    if (pointCheckbox && pointCheckbox.checked !== !originalUserData?.payType) {
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
        window.showToast(
          "비밀번호는 6자리 이상이어야 합니다.",
          3000,
          "warning"
        );
        return;
      }
      hasPasswordChange = true;
    }

    // 한번에 결제 가능한 최대 잔 수가 수정되었는지 확인
    const currentLimitCount = limitCountInput?.value || "";
    const originalLimitCount = originalUserData?.limitCount?.toString() || "";

    if (
      limitCountInput &&
      currentLimitCount !== "" &&
      currentLimitCount !== originalLimitCount
    ) {
      hasChanges = true;
    }

    // 파일 변경사항 체크
    if (logoFile || iconFile) {
      hasFileChanges = true;
    }

    // 수정할 내용이 없으면 저장하지 않음
    if (!hasChanges && !hasPasswordChange && !hasFileChanges) {
      window.showToast("변경사항이 없습니다.", 3000, "warning");
      return;
    }

    // 일반 정보 업데이트 (비밀번호 제외)
    if (hasChanges || hasFileChanges) {
      const updateData: any = {
        userId: currentUserId,
        adminId: currentUserId,
      };

      // 매장명 추가 (변경된 경우만)
      if (
        storeNameInput &&
        storeNameInput.value !== originalUserData?.storeName
      ) {
        updateData.storeName = storeNameInput.value;
      }

      // 매장 연락처 추가 (변경된 경우만)
      if (telInput && telInput.value !== originalUserData?.tel) {
        updateData.tel = telInput.value;
      }

      // 원격 주소 추가 (변경된 경우만)
      if (
        remoteAddressInput &&
        remoteAddressInput.value !== originalUserData?.remoteAddress
      ) {
        updateData.remoteAddress = remoteAddressInput.value;
      }

      // 전체 세척 예약 시간 추가 (변경된 경우만)
      if (washTimeInput && washTimeInput.value !== originalUserData?.washTime) {
        updateData.washTime = washTimeInput.value;
      }

      // 포인트 사용 추가 (변경된 경우만)
      if (
        pointCheckbox &&
        pointCheckbox.checked !== !originalUserData?.payType
      ) {
        updateData.payType = !pointCheckbox.checked;
      }

      // 한번에 결제 가능한 최대 잔 수 추가 (변경된 경우만)
      if (
        limitCountInput &&
        currentLimitCount !== "" &&
        currentLimitCount !== originalLimitCount
      ) {
        updateData.limitCount = parseInt(currentLimitCount);
      }

      // 파일 업로드 데이터 추가
      if (logoFile) {
        updateData.logoFileName = logoFile.name;
        updateData.logoBase64 = logoBase64;
      }

      if (iconFile) {
        updateData.iconFileName = iconFile.name;
        updateData.iconBase64 = iconBase64;
      }

      const response = await apiPut(
        `/model_user_setting?func=update-user`,
        updateData
      );
      const result = await response.json();

      // update-user 성공 후 머신 컨트롤 API 호출
      if (result.success || result.status === "success" || response.ok) {
        const machineControlData = {
          userId: currentUserId,
          func: "update-user",
        };

        await apiPost(`/model_machine_controll`, machineControlData);
      }
    }

    // 비밀번호 업데이트 (별도 API)
    if (hasPasswordChange) {
      const passwordData = {
        userId: currentUserId,
        newPassword: passwordInput.value,
        adminId: currentUserId,
      };

      await apiPut(`/model_user_setting?func=update-password`, passwordData);
    }

    window.showToast("변경사항이 저장되었습니다.", 3000, "success");

    // 저장 성공 시 비밀번호 필드를 ******로 초기화
    if (passwordInput) {
      passwordInput.value = "******";
    }

    // 저장 성공 시 파일 변수 초기화
    if (logoFile) {
      logoFile = null;
      logoBase64 = "";
    }
    if (iconFile) {
      iconFile = null;
      iconBase64 = "";
    }
  } catch (error) {
    window.showToast("저장 중 오류가 발생했습니다.", 3000, "error");
  }
}

// 파일 업로드 핸들러 초기화
function initFileUploadHandlers() {
  // 로고 파일 업로드
  const logoUpload = document.getElementById("logoUpload") as HTMLInputElement;
  if (logoUpload) {
    logoUpload.addEventListener("change", handleLogoUpload);
  }

  // 아이콘 파일 업로드
  const iconUpload = document.getElementById("iconUpload") as HTMLInputElement;
  if (iconUpload) {
    iconUpload.addEventListener("change", handleIconUpload);
  }
}

// 이미지 크기 체크 함수
function checkImageSize(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(img.width <= maxWidth && img.height <= maxHeight);
    };
    img.src = URL.createObjectURL(file);
  });
}

// 파일을 Base64로 변환하는 함수
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // data:image/png;base64, 부분 제거하고 순수 Base64만 반환
      const base64Only = result.split(",")[1];
      resolve(base64Only);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 미리보기용 Base64 변환 함수
function fileToBase64WithHeader(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 로고 파일 업로드 처리
async function handleLogoUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // 파일 크기 체크
  if (file.size > 2 * 1024 * 1024) {
    window.showToast("파일 크기는 2MB 이하여야 합니다.", 3000, "warning");
    return;
  }

  // 이미지 크기 체크
  const isValidSize = await checkImageSize(file, 600, 140);
  if (!isValidSize) {
    window.showToast("로고 이미지는 600x140 이하여야 합니다.", 3000, "warning");
    return;
  }

  // Base64 변환
  logoFile = file;
  logoBase64 = await fileToBase64(file);

  // 파일명 표시
  const fileNameElement = document.getElementById("fileName");
  if (fileNameElement) {
    fileNameElement.textContent = file.name;
  }

  // 미리보기 표시
  const previewElement = document.getElementById(
    "logoPreview"
  ) as HTMLImageElement;
  if (previewElement) {
    const previewBase64 = await fileToBase64WithHeader(file);
    previewElement.src = previewBase64;
    previewElement.style.display = "block";
  }
}

// 아이콘 파일 업로드 처리
async function handleIconUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // 파일 크기 체크
  if (file.size > 2 * 1024 * 1024) {
    window.showToast("파일 크기는 2MB 이하여야 합니다.", 3000, "warning");
    return;
  }

  // 이미지 크기 체크
  const isValidSize = await checkImageSize(file, 1300, 2000);
  if (!isValidSize) {
    window.showToast(
      "아이콘 이미지는 1300x2000 이하여야 합니다.",
      3000,
      "warning"
    );
    return;
  }

  // Base64 변환
  iconFile = file;
  iconBase64 = await fileToBase64(file);

  // 파일명 표시
  const iconFileNameElement = document.getElementById("iconFileName");
  if (iconFileNameElement) {
    iconFileNameElement.textContent = file.name;
  }

  // 미리보기 표시
  const previewElement = document.getElementById(
    "iconPreview"
  ) as HTMLImageElement;
  if (previewElement) {
    const previewBase64 = await fileToBase64WithHeader(file);
    previewElement.src = previewBase64;
    previewElement.style.display = "block";
  }
}
