import { ModelUser } from "../types/user";
import { apiGet, apiPut, apiPost } from "../api/apiHelpers";

// 파일 업로드 관련 전역 변수
let logoFile: File | null = null;
let iconFile: File | null = null;
let logoBase64: string = "";
let iconBase64: string = "";
let logoDeleted: boolean = false;
let iconDeleted: boolean = false;

let pendingDeleteCategories: Array<{
  name: string;
  item: string;
  element: Element;
}> = [];

export function initNormalSet() {
  loadStoreInfo();
  initSaveButtonHandler();
  initFileUploadHandlers();
  initCategoryHandlers();
}

function initCategoryHandlers() {
  // 삭제 버튼 이벤트 리스너 추가
  const deleteButtons = document.querySelectorAll(".delete-category");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", () =>
      deleteCategory(button as HTMLButtonElement)
    );
  });

  // 추가 버튼 이벤트 리스너 추가
  const addButton = document.querySelector(".category-actions .btn-outline");
  if (addButton) {
    addButton.addEventListener("click", addCategory);
  }
}

// 카테고리 추가 함수
function addCategory() {
  const container = document.getElementById("category-container");
  if (!container) return;

  const currentCount = container.querySelectorAll(".category-item").length;
  if (currentCount >= 9) {
    window.showToast(
      "카테고리는 최대 9개까지 추가할 수 있습니다.",
      3000,
      "warning"
    );
    return;
  }

  const newCategory = document.createElement("div");
  newCategory.className = "data_input category-item";
  newCategory.innerHTML = `
    <p>카테고리${currentCount + 1}</p>
    <div class="category-input-group">
      <input type="text"/>
      <button type="button" class="btn-i delete-category">-</button>
    </div>
  `;

  const deleteButton = newCategory.querySelector(".delete-category");
  if (deleteButton) {
    deleteButton.addEventListener("click", () =>
      deleteCategory(deleteButton as HTMLButtonElement)
    );
  }

  container.appendChild(newCategory);
}

// 카테고리 삭제 함수
function deleteCategory(button: HTMLButtonElement) {
  const container = document.getElementById("category-container");
  if (!container) return;

  const categoryItem = button.closest(".category-item");
  if (!categoryItem) return;

  // 삭제하려는 카테고리 정보 수집
  const categoryInput = categoryItem.querySelector("input") as HTMLInputElement;
  const categoryValue = categoryInput.value.trim();

  const originalCategory = originalUserData?.category?.find(
    (c) => c.name === categoryValue
  );
  const itemValue =
    originalCategory?.item || categoryValue.toLowerCase().replace(/\s+/g, "_");

  pendingDeleteCategories.push({
    name: categoryValue,
    item: itemValue,
    element: categoryItem as Element,
  });

  categoryItem.remove();
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
      const storeNameInput = document.getElementById(
        "storeNm"
      ) as HTMLInputElement;
      if (storeNameInput) {
        storeNameInput.value = data.user.storeName || "";
      }

      // 매장 연락처 설정
      const telInput = document.querySelector("#tel-input") as HTMLInputElement;
      if (telInput) {
        telInput.value = data.user.tel || "";
      }

      // 매장 연락처 설정
      const businessNo = document.getElementById(
        "businessNo"
      ) as HTMLInputElement;
      if (businessNo) {
        businessNo.value = data.user.businessNo || "";
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

      // 카테고리 데이터
      loadCategoryData(data.user.category || []);

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

// 카테고리 데이터
function loadCategoryData(categories: any[]) {
  const container = document.getElementById("category-container");
  if (!container) return;

  container.innerHTML = "";

  // 전체메뉴 제외하고 렌더링
  const visibleCategories = (categories || []).filter(
    (c: any) => c && c.no !== "0" && c.item !== "all" && c.item !== "0"
  );

  if (visibleCategories.length > 0) {
    visibleCategories.forEach((category) => {
      const itemVal = String(category.item ?? "");

      const categoryItem = document.createElement("div");
      categoryItem.className = "data_input category-item";
      categoryItem.innerHTML = `
        <p>카테고리${itemVal}</p>
        <div class="category-input-group">
          <input type="text" value="${category.name || ""}" />
          <button type="button" class="btn-i delete-category">-</button>
        </div>
      `;
      const del = categoryItem.querySelector(
        ".delete-category"
      ) as HTMLButtonElement;
      if (del) del.addEventListener("click", () => deleteCategory(del));
      container.appendChild(categoryItem);
    });
  }
}

// 매장 정보 저장 함수 (수정됨)
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
      "#storeNm"
    ) as HTMLInputElement;
    const telInput = document.querySelector("#tel-input") as HTMLInputElement;
    const businessNoInput = document.getElementById(
      "businessNo"
    ) as HTMLInputElement;
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
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    const pointCheckbox = allCheckboxes[0] as HTMLInputElement;

    // 수정된 필드만 추가
    let hasChanges = false;
    let hasPasswordChange = false;
    let hasFileChanges = false;
    let hasCategoryChanges = false;

    // 카테고리 데이터 수집 및 변경사항 체크
    const categoryInputs = document.querySelectorAll(
      "#category-container .category-input-group input"
    );

    const visibleCategories = Array.from(categoryInputs)
      .map((input, idx) => {
        const value = (input as HTMLInputElement).value.trim();
        if (!value) return null;

        const originalCategory = originalUserData?.category?.find(
          (cat) => cat.name === value
        );

        const no = (idx + 1).toString();
        const item = originalCategory?.item || no;

        return { name: value, no, item };
      })
      .filter((c) => c !== null) as Array<{
      name: string;
      no: string;
      item: string;
    }>;

    const categories = [
      { name: "전체메뉴", no: "0", item: "all" },
      ...visibleCategories,
    ];

    // 카테고리 변경사항 체크
    const originalCategories = originalUserData?.category || [];
    const hasPendingDeletes = pendingDeleteCategories.length > 0;

    if (categories.length !== originalCategories.length || hasPendingDeletes) {
      hasCategoryChanges = true;
    } else {
      for (let i = 0; i < categories.length; i++) {
        const current = categories[i];
        const original = originalCategories[i];
        if (!original || current?.name !== original.name) {
          hasCategoryChanges = true;
          break;
        }
      }
    }

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

    // 사업자등록번호가 수정되었는지 확인
    if (
      businessNoInput &&
      businessNoInput.value !== originalUserData?.businessNo
    ) {
      hasChanges = true;
    }

    // 원격 주소가 수정되었는지 확인
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

    // 비밀번호가 수정되었는지 확인
    if (
      passwordInput &&
      passwordInput.value !== "" &&
      passwordInput.value !== "******"
    ) {
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
    if (logoFile || iconFile || logoDeleted || iconDeleted) {
      hasFileChanges = true;
    }

    // 수정할 내용이 없으면 저장하지 않음
    if (
      !hasChanges &&
      !hasPasswordChange &&
      !hasFileChanges &&
      !hasCategoryChanges
    ) {
      window.showToast("변경사항이 없습니다.", 3000, "warning");
      return;
    }

    // 일반 정보 업데이트 (비밀번호 제외)
    if (hasChanges || hasFileChanges || hasCategoryChanges) {
      // 삭제 대기 중인 카테고리들 처리
      if (hasPendingDeletes) {
        await processPendingCategoryDeletes(currentUserId);
      }

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

      // 사업자등록번호 추가 (변경된 경우만)
      if (
        businessNoInput &&
        businessNoInput.value !== originalUserData?.businessNo
      ) {
        updateData.businessNo = businessNoInput.value;
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

      // 카테고리 데이터 추가 (변경된 경우만)
      if (hasCategoryChanges && categories.length > 0) {
        updateData.category = categories;
      }

      // 파일 업로드 데이터 추가
      if (logoFile) {
        updateData.logoFileName = logoFile.name;
        updateData.logoBase64 = logoBase64;
      } else if (logoDeleted) {
        updateData.logoFileName = "";
        updateData.logoBase64 = "";
        updateData.logoUrl = "";
      }

      if (iconFile) {
        updateData.iconFileName = iconFile.name;
        updateData.iconBase64 = iconBase64;
      } else if (iconDeleted) {
        updateData.iconFileName = "";
        updateData.iconBase64 = "";
        updateData.iconUrl = "";
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

    // 저장 성공 시 삭제 대기 목록 초기화
    pendingDeleteCategories = [];

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

    logoDeleted = false;
    iconDeleted = false;

    if (originalUserData) {
      if (logoDeleted) {
        originalUserData.logoUrl = "";
        originalUserData.logoBase64 = "";
      }
      if (iconDeleted) {
        originalUserData.iconUrl = "";
        originalUserData.iconBase64 = "";
      }
      if (hasCategoryChanges) {
        // item 속성을 추가하여 타입 맞춤
        originalUserData.category = categories.map((cat, index) => ({
          ...cat,
          item:
            originalUserData?.category?.[index]?.item ||
            cat.name.toLowerCase().replace(/\s+/g, "_"),
        }));
      }
    }
  } catch (error) {
    window.showToast("저장 중 오류가 발생했습니다.", 3000, "error");
  }
}

// 삭제 대기 중인 카테고리들 처리 함수
async function processPendingCategoryDeletes(userId: string) {
  for (const pendingCategory of pendingDeleteCategories) {
    try {
      console.log(`카테고리 ${pendingCategory.name} 처리 시작`);

      // 전송할 데이터 확인
      console.log(`전송할 데이터:`, {
        userId: userId,
        category: pendingCategory.item,
        categoryName: pendingCategory.name,
      });

      //카테고리 사용 여부 확인
      const checkResponse = await apiGet(
        `/model_user_setting?func=check-category-usage&userId=${userId}&category=${pendingCategory.item}`
      );

      console.log(`응답:`, checkResponse.status, checkResponse.ok);

      if (!checkResponse.ok) {
        throw new Error(
          `카테고리 사용 여부 확인 실패: ${checkResponse.status}`
        );
      }

      const checkResult = await checkResponse.json();
      console.log(`결과:`, checkResult);

      if (checkResult.hasAny) {
        console.log(`카테고리 ${pendingCategory.name} 사용 중`);

        //전체메뉴로 이동
        const moveResponse = await fetch(
          `https://api.narrowroad-model.com/model_user_setting?func=move-category-to-all`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: userId,
              category: pendingCategory.item,
            }),
          }
        );

        console.log(`응답:`, moveResponse.status, moveResponse.ok);

        if (!moveResponse.ok) {
          throw new Error(`카테고리 이동 실패: ${moveResponse.status}`);
        }

        const moveResult = await moveResponse.json();
        console.log(`결과:`, moveResult);

        if (!moveResult.success) {
          throw new Error("카테고리 이동에 실패했습니다.");
        }
      } else {
        console.log(
          `카테고리 ${pendingCategory.name} 사용되지 않음 - 바로 삭제`
        );
      }

      console.log(`카테고리 ${pendingCategory.name} 처리 완료`);
    } catch (error) {
      console.error(`카테고리 ${pendingCategory.name} 처리 중 오류:`, error);

      // 오류 발생 시 화면 복원
      const container = document.getElementById("category-container");
      if (container) {
        container.appendChild(pendingCategory.element);

        // 번호 재정렬
        const categories = container.querySelectorAll(".category-item");
        categories.forEach((item, index) => {
          const label = item.querySelector("p");
          if (label) label.textContent = `카테고리 ${index + 1}`;
        });
      }

      window.showToast(
        `카테고리 ${pendingCategory.name} 삭제 중 오류가 발생했습니다.`,
        3000,
        "error"
      );
    }
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

  // 로고 삭제 버튼
  const logoDeleteBtn = document.querySelector(
    ".icon-header button"
  ) as HTMLButtonElement;
  if (logoDeleteBtn) {
    logoDeleteBtn.addEventListener("click", handleLogoDelete);
  }
  // 아이콘 삭제 버튼
  const iconDeleteBtns = document.querySelectorAll(".icon-header button");
  const iconDeleteBtn = iconDeleteBtns[1] as HTMLButtonElement;
  if (iconDeleteBtn) {
    iconDeleteBtn.addEventListener("click", handleIconDelete);
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
  // 새 파일 업로드 시 삭제 플래그 해제
  logoDeleted = false;

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
  // 새 파일 업로드 시 삭제 플래그 해제
  iconDeleted = false;

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

// 로고 파일 삭제 처리
function handleLogoDelete() {
  // 기존 이미지가 없으면 삭제하지 않음
  if (!originalUserData?.logoUrl && !originalUserData?.logoBase64) {
    return;
  }

  // 파일 변수 초기화
  logoFile = null;
  logoBase64 = "";

  logoDeleted = true;

  // 파일 입력 초기화
  const logoUpload = document.getElementById("logoUpload") as HTMLInputElement;
  if (logoUpload) {
    logoUpload.value = "";
  }

  // 파일명 표시 숨기기
  const fileNameElement = document.getElementById("fileName");
  if (fileNameElement) {
    fileNameElement.textContent = "";
  }

  // 미리보기 숨기기
  const previewElement = document.getElementById(
    "logoPreview"
  ) as HTMLImageElement;
  if (previewElement) {
    previewElement.src = "";
    previewElement.style.display = "none";
  }

  if (originalUserData) {
    originalUserData.logoUrl = "";
    originalUserData.logoBase64 = "";
  }
}

// 아이콘 파일 삭제 처리
function handleIconDelete() {
  // 기존 이미지가 없으면 삭제하지 않음
  if (!originalUserData?.iconUrl && !originalUserData?.iconBase64) {
    return;
  }

  // 파일 변수 초기화
  iconFile = null;
  iconBase64 = "";

  iconDeleted = true;

  // 파일 입력 초기화
  const iconUpload = document.getElementById("iconUpload") as HTMLInputElement;
  if (iconUpload) {
    iconUpload.value = "";
  }

  // 파일명 표시 숨기기
  const iconFileNameElement = document.getElementById("iconFileName");
  if (iconFileNameElement) {
    iconFileNameElement.textContent = "";
  }

  // 미리보기 숨기기
  const previewElement = document.getElementById(
    "iconPreview"
  ) as HTMLImageElement;
  if (previewElement) {
    previewElement.src = "";
    previewElement.style.display = "none";
  }

  if (originalUserData) {
    originalUserData.iconUrl = "";
    originalUserData.iconBase64 = "";
  }
}
