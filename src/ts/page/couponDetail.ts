import { apiGet } from "../api/apiHelpers.ts";
import { getStoredUser } from "../utils/userStorage.ts";

export function initCouponDetail() {
  console.log("쿠폰 발행 페이지 초기화");

  // API에서 사용자 정보 가져와서 가맹점/지점에 넣기
  loadUserData();

  // 목록으로 버튼 클릭 시 couponList 페이지로 이동
  const backToListBtn = document.getElementById("back-to-list");
  
  if (backToListBtn) {
    backToListBtn.addEventListener("click", function () {
      window.location.href = "/html/couponList.html";
    });
  }

  // 폼 제출 이벤트
  const couponForm = document.getElementById("coupon-form") as HTMLFormElement;
  
  if (couponForm) {
    couponForm.addEventListener("submit", function (e) {
      e.preventDefault();
      // 쿠폰 발급 로직 구현
      console.log("쿠폰 발급 처리");
      // 성공 시 목록으로 이동
      window.location.href = "/html/couponList.html";
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
