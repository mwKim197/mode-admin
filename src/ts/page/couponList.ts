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

  // 전체 선택 체크박스 이벤트 리스너 추가
  initSelectAllCheckbox();
}

// 전체 선택 체크박스 초기화
function initSelectAllCheckbox() {
  const selectAllCheckbox = document.querySelector(
    'thead input[type="checkbox"]'
  ) as HTMLInputElement;

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", function () {
      const isChecked = this.checked;
      const dataCheckboxes = document.querySelectorAll(
        'tbody input[type="checkbox"]'
      ) as NodeListOf<HTMLInputElement>;

      dataCheckboxes.forEach((checkbox) => {
        checkbox.checked = isChecked;
      });
    });
  }
}

// 개별 체크박스 상태에 따른 전체 선택 체크박스 상태 업데이트
function updateSelectAllCheckbox() {
  const selectAllCheckbox = document.querySelector(
    'thead input[type="checkbox"]'
  ) as HTMLInputElement;
  const dataCheckboxes = document.querySelectorAll(
    'tbody input[type="checkbox"]'
  ) as NodeListOf<HTMLInputElement>;

  if (selectAllCheckbox && dataCheckboxes.length > 0) {
    const checkedCount = Array.from(dataCheckboxes).filter(
      (checkbox) => checkbox.checked
    ).length;

    if (checkedCount === 0) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
    } else if (checkedCount === dataCheckboxes.length) {
      selectAllCheckbox.checked = true;
      selectAllCheckbox.indeterminate = false;
    } else {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = true;
    }
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
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
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

    // 개별 체크박스 이벤트 리스너 추가
    const checkbox = row.querySelector(
      'input[type="checkbox"]'
    ) as HTMLInputElement;
    if (checkbox) {
      checkbox.addEventListener("change", updateSelectAllCheckbox);
    }

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

  // 테이블 렌더링 후 전체 선택 체크박스 상태 초기화
  updateSelectAllCheckbox();
}
