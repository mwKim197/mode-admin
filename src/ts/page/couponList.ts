import { apiGet } from "../api/apiHelpers.ts";
import { getStoredUser } from "../utils/userStorage.ts";
import { renderBarcodeToCanvas } from "../utils/barcode.ts"; // ✅ 바코드 import 다시 추가
import html2canvas from "html2canvas"; // ✅ html2canvas import 추가

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

  // ✅ 이미지 저장 버튼 이벤트 리스너 추가
  const saveSelectedCouponsBtn = document.getElementById(
    "save-selected-coupons"
  );
  if (saveSelectedCouponsBtn) {
    saveSelectedCouponsBtn.addEventListener(
      "click",
      saveSelectedCouponsAsImages
    );
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

  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.trim();

    // 기존 타이머가 있으면 취소 (디바운스 효과)
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

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
      <td>${coupon.couponCode}</td>
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
    updateCouponOverlay(couponData);
    popup.style.display = "flex";
  }
}

function updateCouponOverlay(couponData: any) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekday = weekdays[date.getDay()];
    return `${year}년 ${month}월 ${day}일(${weekday})`;
  };

  const title = couponData.title.replace(" 무료", "");
  const endDate = formatDate(couponData.expiresAt);
  const period = `${endDate}까지`;
  const storeName = userInfo?.storeName || "전체 지점";
  const titleLength = title.length;
  const titleClass = titleLength >= 10 ? "coupon-title small" : "coupon-title";
  const freeClass = titleLength >= 10 ? "coupon-free small" : "coupon-free";

  const couponOverlay = document.querySelector(
    ".coupon-overlay"
  ) as HTMLElement;
  if (couponOverlay) {
    couponOverlay.innerHTML = ` 
      <div class="coupon-period" style="transform: translateY(-7px);">${period}</div>
      <div class="${titleClass}" style="transform: translateY(-7px);">${title}</div>
      <div class="${freeClass}" style="transform: translateY(-7px);">1잔 무료</div>
      <div class="coupon-store" style="transform: translateY(-7px);">${storeName}</div>
      <div class="coupon-id" style="transform: translateY(-7px);">${couponData.couponId}</div>
      <canvas id="coupon-barcode" style="transform: translateY(-7px);"></canvas>  
    `;
  }

  setTimeout(() => {
    const barcodeCanvas = document.getElementById(
      "coupon-barcode"
    ) as HTMLCanvasElement;
    if (barcodeCanvas) {
      try {
        renderBarcodeToCanvas(couponData.couponCode, barcodeCanvas);
        console.log("바코드 생성 완료:", couponData.couponCode);
      } catch (error) {
        console.error("바코드 생성 실패:", error);
      }
    }
  }, 100);
}

async function saveCouponPopupAsImage() {
  try {
    const couponContainer = document.querySelector(
      "#coupon-popup .coupon-container"
    ) as HTMLElement;
    if (!couponContainer) {
      window.showToast("쿠폰 이미지를 찾을 수 없습니다.", 3000, "error");
      return;
    }

    // ✅ 현재 표시된 쿠폰 데이터 가져오기
    const currentCouponData = getCurrentCouponData();
    if (!currentCouponData) {
      window.showToast("쿠폰 데이터를 찾을 수 없습니다.", 3000, "error");
      return;
    }

    const elementsToHide = [couponContainer.querySelector(".save-img")].filter(
      Boolean
    ) as HTMLElement[];

    const originalDisplays = elementsToHide.map((el) => el.style.display);
    elementsToHide.forEach((el) => (el.style.display = "none"));

    // 스타일 저장
    const originalStyles = {
      position: couponContainer.style.position,
      width: couponContainer.style.width,
      height: couponContainer.style.height,
      margin: couponContainer.style.margin,
      padding: couponContainer.style.padding,
    };

    Object.assign(couponContainer.style, {
      position: "relative",
      margin: "0",
      padding: "0",
    });

    // 캡처 실행
    setTimeout(() => {
      html2canvas(couponContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      })
        .then((canvas) => {
          const roundedCanvas = document.createElement("canvas");
          const ctx = roundedCanvas.getContext("2d");

          roundedCanvas.width = canvas.width;
          roundedCanvas.height = canvas.height;

          if (ctx) {
            ctx.beginPath();
            ctx.roundRect(0, 0, canvas.width, canvas.height, 10);
            ctx.clip();
            ctx.drawImage(canvas, 0, 0);
          }

          const safeTitle = currentCouponData.title
            .replace(/[^\w\s가-힣]/g, "")
            .replace(/\s+/g, "_");
          const fileName = `${safeTitle}_${currentCouponData.couponCode}.png`;

          // 다운로드
          downloadURI(roundedCanvas.toDataURL("image/png"), fileName);

          // 스타일 복구
          restoreStyles();
          window.showToast(
            "쿠폰 이미지가 성공적으로 저장되었습니다.",
            3000,
            "success"
          );
        })
        .catch((error) => {
          console.error("이미지 저장 실패:", error);
          window.showToast("이미지 저장에 실패했습니다.", 3000, "error");
          restoreStyles();
        });
    }, 100);

    // 스타일 복구 함수
    function restoreStyles() {
      Object.assign(couponContainer.style, originalStyles);
      elementsToHide.forEach((el, index) => {
        el.style.display = originalDisplays[index];
      });
    }
  } catch (error) {
    console.error("이미지 저장 실패:", error);
    window.showToast("이미지 저장에 실패했습니다.", 3000, "error");
  }
}

function getCurrentCouponData(): any {
  const popup = document.getElementById("coupon-popup");
  if (popup && popup.style.display === "flex") {
    // 쿠폰 ID나 다른 식별자를 통해 현재 쿠폰 찾기
    const couponIdElement = popup.querySelector(".coupon-id");
    if (couponIdElement) {
      const couponId = couponIdElement.textContent;
      return allCoupons.find((coupon) => coupon.couponId === couponId);
    }
  }
  return null;
}

// 이미지 다운로드 함수
function downloadURI(uri: string, name: string) {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
  const saveImgBtn = document.querySelector(
    "#coupon-popup .save-img"
  ) as HTMLElement;

  // 닫기 버튼 클릭
  if (closeBtn) {
    closeBtn.addEventListener("click", hideCouponPopup);
  }

  // 이미지 저장 버튼 클릭
  if (saveImgBtn) {
    saveImgBtn.addEventListener("click", saveCouponPopupAsImage);
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

async function saveSelectedCouponsAsImages() {
  const checkedCheckboxes = document.querySelectorAll(
    'tbody input[type="checkbox"]:checked'
  ) as NodeListOf<HTMLInputElement>;

  if (checkedCheckboxes.length === 0) {
    window.showToast("저장할 쿠폰을 선택해주세요.", 3000, "warning");
    return;
  }

  console.log(`${checkedCheckboxes.length}개의 쿠폰 이미지 저장 시작`);

  // 로딩 표시
  const saveBtn = document.getElementById(
    "save-selected-coupons"
  ) as HTMLButtonElement;
  const originalText = saveBtn.textContent;
  saveBtn.textContent = "저장 중...";
  saveBtn.disabled = true;

  try {
    const selectedIndices: number[] = [];
    checkedCheckboxes.forEach((checkbox) => {
      const row = checkbox.closest("tr") as HTMLElement;
      const index = parseInt(row.getAttribute("data-coupon-index") || "0");
      selectedIndices.push(index);
    });

    const selectedCoupons = selectedIndices
      .map((index) => allCoupons[index])
      .filter(Boolean);

    // 각 쿠폰에 대해 이미지 생성 및 저장
    for (let i = 0; i < selectedCoupons.length; i++) {
      const coupon = selectedCoupons[i];
      console.log(
        `${i + 1}/${selectedCoupons.length} 쿠폰 처리 중: ${coupon.title}`
      );

      // 쿠폰 팝업을 숨겨진 상태로 생성
      await generateCouponImage(coupon);
    }

    window.showToast(
      `${selectedCoupons.length}개의 쿠폰 이미지가 저장되었습니다.`,
      3000,
      "success"
    );

    // ✅ 저장 완료 후 페이지 새로고침
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    console.error("이미지 저장 실패:", error);
    window.showToast("이미지 저장에 실패했습니다.", 3000, "error");
  } finally {
    saveBtn.textContent = originalText;
    saveBtn.disabled = false;
  }
}

// ✅ 개별 쿠폰 이미지 생성 함수 (수정)
async function generateCouponImage(couponData: any): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const popup = document.getElementById("coupon-popup") as HTMLElement;

      popup.style.display = "flex";
      popup.style.position = "fixed";
      popup.style.top = "-9999px";
      popup.style.left = "-9999px";
      popup.style.zIndex = "-1";

      // 쿠폰 오버레이 업데이트 (기존 함수 사용)
      updateCouponOverlay(couponData);

      // 바코드 렌더링 후 이미지 생성
      setTimeout(async () => {
        try {
          const barcodeCanvas = document.getElementById(
            "coupon-barcode"
          ) as HTMLCanvasElement;
          if (barcodeCanvas) {
            renderBarcodeToCanvas(couponData.couponCode, barcodeCanvas);
          }

          // ✅ 기존 팝업 저장 로직과 동일하게 처리
          const couponContainer = document.querySelector(
            "#coupon-popup .coupon-container"
          ) as HTMLElement;

          // 저장 버튼 숨기기
          const saveBtn = couponContainer.querySelector(
            ".save-img"
          ) as HTMLElement;
          const originalDisplay = saveBtn ? saveBtn.style.display : "";
          if (saveBtn) saveBtn.style.display = "none";

          const originalStyles = {
            position: couponContainer.style.position,
            width: couponContainer.style.width,
            height: couponContainer.style.height,
            margin: couponContainer.style.margin,
            padding: couponContainer.style.padding,
          };

          Object.assign(couponContainer.style, {
            position: "relative",
            margin: "0",
            padding: "0",
          });

          // 캡처 실행
          setTimeout(async () => {
            try {
              const canvas = await html2canvas(couponContainer, {
                scale: 2,
                useCORS: true,
                backgroundColor: null,
              });

              // 둥근 모서리 적용
              const roundedCanvas = document.createElement("canvas");
              const ctx = roundedCanvas.getContext("2d");
              roundedCanvas.width = canvas.width;
              roundedCanvas.height = canvas.height;

              if (ctx) {
                ctx.beginPath();
                ctx.roundRect(0, 0, canvas.width, canvas.height, 10);
                ctx.clip();
                ctx.drawImage(canvas, 0, 0);
              }

              // 파일명 생성
              const safeTitle = couponData.title
                .replace(/[^\w\s가-힣]/g, "")
                .replace(/\s+/g, "_");
              const fileName = `${safeTitle}_${couponData.couponCode}.png`;

              // 다운로드
              downloadURI(roundedCanvas.toDataURL("image/png"), fileName);

              // ✅ 스타일 복구
              Object.assign(couponContainer.style, originalStyles);
              if (saveBtn) saveBtn.style.display = originalDisplay;

              // 팝업 숨기기
              popup.style.display = "none";

              resolve();
            } catch (error) {
              // 에러 시에도 스타일 복구
              Object.assign(couponContainer.style, originalStyles);
              if (saveBtn) saveBtn.style.display = originalDisplay;
              popup.style.display = "none";
              reject(error);
            }
          }, 100);
        } catch (error) {
          popup.style.display = "none";
          reject(error);
        }
      }, 200);
    } catch (error) {
      reject(error);
    }
  });
}

// ✅ updateCouponOverlayForImage 함수는 제거 (기존 updateCouponOverlay 사용)
