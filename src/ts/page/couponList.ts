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
