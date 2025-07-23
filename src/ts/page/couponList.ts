import { apiGet } from "../api/apiHelpers.ts";
import { getStoredUser } from "../utils/userStorage.ts";

export function initCoupon() {
  console.log("✅ coupon.ts 로드됨");

  // localstorage에 저장된 user 정보를 불러옴
  const user = getStoredUser();

  if (!user) {
    window.showToast(`❌ 사용자 정보가 없습니다.`, 3000, "error");
    return;
  }
}

export function initCouponList() {
  console.log("쿠폰 목록 페이지 초기화");

  // API에서 사용자 정보 가져와서 가맹점/지점에 넣기
  loadUserData();

  // 팝업 열기/닫기 기능
  const openPopupBtn = document.getElementById("open-popup");
  const closePopupBtn = document.getElementById("close-popup");
  const popup = document.getElementById("popup");

  if (openPopupBtn && popup) {
    openPopupBtn.addEventListener("click", function () {
      popup.style.display = "flex";
    });
  }

  if (closePopupBtn && popup) {
    closePopupBtn.addEventListener("click", function () {
      popup.style.display = "none";
    });
  }

  // 팝업 배경 클릭시 닫기
  if (popup) {
    popup.addEventListener("click", function (e) {
      if (e.target === this) {
        this.style.display = "none";
      }
    });
  }
}

async function loadUserData() {
  try {
    const user = getStoredUser();
    if (!user) return;

    const response = await apiGet(
      `/model_user_setting?func=get-user&userId=${user.userId}`
    );
    const data = await response.json();

    const storeName = data.user.storeName;

    // 가맹점과 지점에 storeName 값 설정
    const franchiseInput = document.getElementById(
      "franchise-input"
    ) as HTMLInputElement;
    const storeInput = document.getElementById(
      "store-input"
    ) as HTMLInputElement;
    const deviceInput = document.getElementById(
      "device-input"
    ) as HTMLInputElement;

    if (franchiseInput) franchiseInput.value = storeName;
    if (storeInput) storeInput.value = storeName;
    if (deviceInput) deviceInput.value = user.userId;

    // 메뉴 데이터 가져와서 select 박스에 추가
    await loadMenuData(user.userId);
    await sampleSelect(user.userId);
  } catch (error) {
    console.error("사용자 데이터 로드 실패:", error);
  }
}

async function loadMenuData(userId: string) {
  try {
    const response = await apiGet(
      `/model_admin_menu?userId=${userId}&func=get-all-menu`
    );
    const data = await response.json();

    const selectElement = document.getElementById(
      "coupon-type-select"
    ) as HTMLSelectElement;

    if (selectElement && data.items) {
      // 기존 옵션들 제거 (--선택-- 제외하고)
      selectElement.innerHTML = '<option value="">--선택--</option>';

      // 메뉴 데이터로 옵션 추가
      data.items.forEach((item: any) => {
        const option = document.createElement("option");
        option.value = item.menuId;
        option.textContent = item.name;
        selectElement.appendChild(option);
      });
    }
  } catch (error) {
    console.error("메뉴 데이터 로드 실패:", error);
  }
}



async function sampleSelect(userId: string) {
  try {
    const response = await apiGet(
        `/model_admin_menu?userId=${userId}&func=get-all-menu`
    );
    const data = await response.json();

    const selectElement = document.getElementById('sample') as HTMLSelectElement;

    if (selectElement && data.items) {
      // 기존 옵션 제거
      selectElement.innerHTML = '<option value="">--선택--</option>';

      // 메뉴 데이터로 옵션 추가
      data.items.forEach((item: any) => {
        const option = document.createElement("option");
        option.value = item.menuId;
        option.textContent = item.name;
        selectElement.appendChild(option);
      });

      new window.Choices(selectElement, {
        position: 'bottom', // 드롭다운 select 아래 고정
        allowHTML: true,
        shouldSort: false,
        searchEnabled: true,
        maxItemCount: 20,
        renderChoiceLimit: 20,
        classNames: {
          containerOuter: 'custom-select',
          containerInner: 'custom-select-inner',
          input: 'custom-select-input',
          listDropdown: 'custom-select-dropdown',
          itemChoice: 'custom-select-item',
          placeholder: 'custom-select-placeholder'
        }
      });
    }
  } catch (error) {
    console.error("메뉴 데이터 로드 실패:", error);
  }
}