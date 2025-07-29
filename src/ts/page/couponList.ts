import { getStoredUser } from "../utils/userStorage.ts";
import { renderBarcodeToCanvas } from "../utils/barcode.ts";

let allCoupons: any[] = []; // 전체 쿠폰 데이터 저장
let searchTimeout: NodeJS.Timeout | null = null; // 실시간 검색을 위한 타이머
let userInfo: any = null; // 사용자 정보 저장 (지점명 포함)

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

  // 사용자 정보 및 쿠폰 목록 로드
  loadUserInfoAndCoupons();

  // 발급하기 버튼 클릭 시 couponDetail 페이지로 이동
  const openCouponDetailBtn = document.getElementById("open-coupon-detail");

  if (openCouponDetailBtn) {
    openCouponDetailBtn.addEventListener("click", function () {
      window.location.href = "/html/couponDetail.html";
    });
  }

  // 전체 선택 체크박스 이벤트 리스너 추가
  initSelectAllCheckbox();

  // 검색 기능 초기화
  initSearchFunction();
}

// ✅ 사용자 정보와 쿠폰 목록을 동시에 로드
async function loadUserInfoAndCoupons() {
  const user = getStoredUser();
  if (!user) {
    window.showToast("사용자 정보가 없습니다.", 2000, "error");
    return;
  }

  try {
    // 병렬로 두 API 호출
    const [userResponse, couponResponse] = await Promise.all([
      apiGet(`/model_user_setting?func=get-user&userId=${user.userId}`),
      apiGet(`/model_coupon?func=coupon&userId=${user.userId}`),
    ]);

    // 사용자 정보 처리
    if (userResponse.ok) {
      const userData = await userResponse.json();
      userInfo = userData.user; // ✅ user 객체 안의 데이터를 저장
      console.log("사용자 정보 로드 완료:", userInfo);
    } else {
      console.error("사용자 정보 로드 실패");
    }

    // 쿠폰 목록 처리
    if (couponResponse.ok) {
      const couponData = await couponResponse.json();
      allCoupons = couponData.items || [];
      renderCouponTable(allCoupons);
    } else {
      window.showToast("쿠폰 목록을 불러오는데 실패했습니다.", 3000, "error");
    }
  } catch (error) {
    console.error("API 호출 오류:", error);
    window.showToast("데이터를 불러오는데 실패했습니다.", 3000, "error");
  }
}

// 검색 기능 초기화
function initSearchFunction() {
  const searchInput = document.getElementById(
    "searchCoupon"
  ) as HTMLInputElement;
  const searchBtn = document.getElementById(
    "searchButton"
  ) as HTMLButtonElement;
  const resetBtn = document.getElementById("searchReset") as HTMLButtonElement;

  if (!searchInput || !searchBtn || !resetBtn) {
    console.error("검색 요소를 찾을 수 없습니다!");
    return;
  }

  // 검색 버튼 클릭 이벤트
  searchBtn.addEventListener("click", () => {
    const searchTerm = searchInput.value.trim();
    performSearch(searchTerm);
  });

  // 리셋 버튼 클릭 이벤트
  resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    performSearch("");
  });

  // Enter 키 이벤트
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const searchTerm = searchInput.value.trim();
      performSearch(searchTerm);
    }
  });

  // ✅ 실시간 검색 기능 추가
  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.trim();

    // 기존 타이머가 있으면 취소 (디바운스 효과)
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // 300ms 후에 검색 실행 (너무 빠른 타이핑에 대한 성능 최적화)
    searchTimeout = setTimeout(() => {
      performRealTimeSearch(searchTerm);
    }, 300);
  });
}

// 실시간 검색 실행 (디바운스 적용)
function performRealTimeSearch(searchTerm: string) {
  console.log("실시간 검색:", searchTerm);
  performSearch(searchTerm);
}

// 검색 실행
function performSearch(searchTerm: string) {
  console.log("검색 실행:", searchTerm);

  if (!searchTerm) {
    // 검색어가 없으면 전체 목록 표시
    renderCouponTable(allCoupons);
    return;
  }

  // 쿠폰명 또는 쿠폰코드로 필터링
  const filteredCoupons = allCoupons.filter((coupon) => {
    const title = coupon.title?.toLowerCase() || "";
    const couponCode = coupon.couponCode?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return title.includes(search) || couponCode.includes(search);
  });

  console.log(`검색 결과: ${filteredCoupons.length}개 쿠폰`);
  renderCouponTable(filteredCoupons);
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
    row.classList.add("coupon-row");
    row.setAttribute("data-coupon-index", index.toString());

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const year = String(date.getFullYear()).slice(-2);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}.${month}.${day}`;
    };

    const expiresAt = formatDate(coupon.expiresAt);

    const displayTitle = coupon.title.replace(" 무료", "");

    row.innerHTML = `
      <td><input type="checkbox" /></td>
      <td>${index + 1}</td>
      <td>${displayTitle}</td>
      <td>~${expiresAt}</td>
      <td>
        ${coupon.couponCode}
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
      // 체크박스 클릭 시 이벤트 전파 방지
      checkbox.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    // ✅ 행 클릭 이벤트 추가 (쿠폰 데이터와 함께 팝업 표시)
    row.addEventListener("click", () => {
      showCouponPopup(coupon);
    });
  });

  // 테이블 렌더링 후 전체 선택 체크박스 상태 초기화
  updateSelectAllCheckbox();

  // 팝업 닫기 이벤트 리스너 추가 (한 번만 실행)
  initCouponPopupEvents();
}

// ✅ 쿠폰 팝업 표시 (데이터 포함)
function showCouponPopup(couponData: any) {
  const popup = document.getElementById("coupon-popup") as HTMLElement;

  if (popup) {
    // 쿠폰 데이터를 SVG 위에 오버레이로 표시
    updateCouponOverlay(couponData);
    popup.style.display = "flex";
  }
}

// ✅ 쿠폰 오버레이 데이터 업데이트 (바코드 포함)
function updateCouponOverlay(couponData: any) {
  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // 쿠폰 제목 (무료 제거)
  const title = couponData.title.replace(" 무료", "");

  // 기간 포맷팅
  const startDate = formatDate(couponData.startsAt);
  const endDate = formatDate(couponData.expiresAt);
  const period = `${startDate} ~ ${endDate}`;

  // 지점명 (user 객체에서 가져오기)
  const storeName = userInfo?.storeName || "전체 지점";

  // 오버레이 HTML 업데이트
  const couponOverlay = document.querySelector(
    ".coupon-overlay"
  ) as HTMLElement;
  if (couponOverlay) {
    couponOverlay.innerHTML = ` 
      <div class="coupon-period">${period}</div>
      
      <div class="coupon-title">${title}</div>
      <div class="coupon-free">1잔 무료</div>
      <div class="coupon-store">${storeName}</div>
      <div class="coupon-id">${couponData.couponId}</div>
      <canvas id="coupon-barcode"></canvas>  
    `;
  }

  // ✅ 바코드 생성 (배경 투명)
  setTimeout(() => {
    const barcodeCanvas = document.getElementById(
      "coupon-barcode"
    ) as HTMLCanvasElement;
    if (barcodeCanvas) {
      try {
        // 바코드 생성 with 투명 배경
        renderBarcodeToCanvas(couponData.couponCode, barcodeCanvas);
        console.log("바코드 생성 완료:", couponData.couponCode);
      } catch (error) {
        console.error("바코드 생성 실패:", error);
      }
    }
  }, 100);
}

// 쿠폰 팝업 닫기
function hideCouponPopup() {
  const popup = document.getElementById("coupon-popup") as HTMLElement;
  if (popup) {
    popup.style.display = "none";
  }
}

// 팝업 이벤트 초기화 (중복 실행 방지)
let popupEventsInitialized = false;

function initCouponPopupEvents() {
  if (popupEventsInitialized) return;

  const closeBtn = document.querySelector(
    "#coupon-popup .close-btn"
  ) as HTMLElement;
  const popupOverlay = document.getElementById("coupon-popup") as HTMLElement;

  // 닫기 버튼 클릭
  if (closeBtn) {
    closeBtn.addEventListener("click", hideCouponPopup);
  }

  // 오버레이 클릭 시 닫기
  if (popupOverlay) {
    popupOverlay.addEventListener("click", (e) => {
      if (e.target === popupOverlay) {
        hideCouponPopup();
      }
    });
  }

  popupEventsInitialized = true;
}
