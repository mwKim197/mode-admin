import { apiGet } from "../api/apiHelpers.ts";
import { getStoredUser } from "../utils/userStorage.ts";
import { renderBarcodeToCanvas } from "../utils/barcode.ts";

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

  // 쿠폰 목록 로드
  loadCouponList();

  // 발급하기 버튼 클릭 시 couponDetail 페이지로 이동
  const openCouponDetailBtn = document.getElementById("open-coupon-detail");

  if (openCouponDetailBtn) {
    openCouponDetailBtn.addEventListener("click", function () {
      window.location.href = "/html/couponDetail.html";
    });
  }
}

// 쿠폰 목록 API 호출
async function loadCouponList() {
  try {
    const user = getStoredUser();
    if (!user) {
      window.showToast("사용자 정보가 없습니다.", 2000, "error");
      return;
    }

    const response = await apiGet(
      `/model_coupon?func=coupon&userId=${user.userId}`
    );
    const data = await response.json();

    if (response.ok) {
      renderCouponTable(data.items);
    } else {
      window.showToast("쿠폰 목록을 불러오는데 실패했습니다.", 3000, "error");
    }
  } catch (error) {
    window.showToast("쿠폰 목록을 불러오는데 실패했습니다.", 3000, "error");
  }
}

// 쿠폰 테이블 렌더링
function renderCouponTable(coupons: any[]) {
  const tbody = document.getElementById("coupon-table-body");

  if (!tbody) {
    console.error("tbody 요소를 찾을 수 없습니다!");
    return;
  }

  tbody.innerHTML = "";

  if (!coupons || coupons.length === 0) {
    console.log("쿠폰 데이터가 없습니다.");
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
      <td colspan="6" class="text-center">발급된 쿠폰이 없습니다.</td>
    `;
    tbody.appendChild(emptyRow);
    return;
  }

  console.log(`${coupons.length}개의 쿠폰을 렌더링합니다.`);

  coupons.forEach((coupon, index) => {
    const row = document.createElement("tr");

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const year = String(date.getFullYear()).slice(-2);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}.${month}.${day}`;
    };

    const startsAt = formatDate(coupon.startsAt);
    const expiresAt = formatDate(coupon.expiresAt);

    const displayTitle = coupon.title.replace(" 무료", "");

    row.innerHTML = `
      <td><input type="checkbox" /></td>
      <td>${index + 1}</td>
      <td>${displayTitle}</td>
      <td>${startsAt}~${expiresAt}</td>
      <td>
        ${coupon.couponCode}
        <!-- <canvas id="barcode-${
          coupon.couponId
        }" width="150" height="40"></canvas> -->
      </td>
      <td>미구현</td>
    `;

    tbody.appendChild(row);

    // 저장된 couponCode로 바코드 생성
    setTimeout(() => {
      const barcodeCanvas = row.querySelector(
        `#barcode-${coupon.couponId}`
      ) as HTMLCanvasElement;
      if (barcodeCanvas && coupon.couponCode) {
        renderBarcodeToCanvas(coupon.couponCode, barcodeCanvas);
      }
    }, 100);
  });
}
