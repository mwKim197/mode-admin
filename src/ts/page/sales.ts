let items: any[] = []; // 현재 페이지 데이터만 저장
let pageKeys: any[] = []; // 페이지 키 배열
let totalItems = 0; // 전체 아이템 수
let currentPage = 1;
const pageLimit = 10;
let currentSalesType = "transaction"; // 'transaction' (건별) 또는 'product' (상품별)

// 날짜 검색 관련 변수
let startDate = "";
let endDate = "";

export function initSales() {
  console.log("✅ sales.ts 로드됨");

  // 매출 구분 라디오 버튼 이벤트 리스너 추가
  initSalesTypeRadioHandlers();

  // 날짜 검색 이벤트 리스너 추가
  initDateSearchHandlers();

  // 상세설정 라디오 버튼 이벤트 리스너 추가
  initDetailPeriodHandlers();

  // 페이지 로드 시 기본값 설정 (건별이 체크되어 있음)
  currentSalesType = "transaction";

  // 테이블 부분만 동적으로 변경
  getSalesList();
  initPopupHandlers();
}

// 매출 구분 라디오 버튼 이벤트 핸들러
function initSalesTypeRadioHandlers() {
  const radioButtons = document.querySelectorAll('input[name="sales-type"]');

  radioButtons.forEach((radio, index) => {
    radio.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      if (target.checked) {
        currentSalesType = index === 0 ? "transaction" : "product";
        currentPage = 1; // 페이지 초기화
        updateTableHeader(); // 테이블 헤더 업데이트 (결제/연락처 섹션도 함께 처리)
        getSalesList(); // 새로운 데이터 로드
      }
    });
  });
}

// 날짜 검색 이벤트 핸들러
function initDateSearchHandlers() {
  const startDateInput = document.querySelector(
    'input[type="date"]:first-of-type'
  ) as HTMLInputElement;
  const endDateInput = document.querySelector(
    'input[type="date"]:last-of-type'
  ) as HTMLInputElement;
  const searchBtn = document.querySelector(
    ".btn-i.search"
  ) as HTMLButtonElement;
  const resetBtn = document.querySelector(".btn-i.reset") as HTMLButtonElement;

  // 시작일 변경 이벤트
  if (startDateInput) {
    startDateInput.addEventListener("change", (e) => {
      startDate = (e.target as HTMLInputElement).value;
    });
  }

  // 종료일 변경 이벤트
  if (endDateInput) {
    endDateInput.addEventListener("change", (e) => {
      endDate = (e.target as HTMLInputElement).value;
    });
  }

  // 검색 버튼 클릭 이벤트
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      if (!validateDateRange()) {
        return;
      }
      currentPage = 1;
      getSalesList();
    });
  }

  // 리셋 버튼 클릭 이벤트
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      resetDateInputs();
      currentPage = 1;
      getSalesList();
    });
  }
}

// 상세설정 라디오 버튼 이벤트 핸들러
function initDetailPeriodHandlers() {
  const periodRadioButtons = document.querySelectorAll(
    'input[name="detail-period"]'
  );

  periodRadioButtons.forEach((radio, index) => {
    radio.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      if (target.checked) {
        setDateRangeByPeriod(index);
        currentPage = 1;
        getSalesList();
      }
    });
  });
}

// 기간별 날짜 설정 함수
function setDateRangeByPeriod(periodIndex: number) {
  const startDateInput = document.querySelector(
    'input[type="date"]:first-of-type'
  ) as HTMLInputElement;
  const endDateInput = document.querySelector(
    'input[type="date"]:last-of-type'
  ) as HTMLInputElement;

  if (!startDateInput || !endDateInput) return;

  const today = new Date();
  let startDateValue = "";
  let endDateValue = "";

  switch (periodIndex) {
    case 0: // 전체
      startDateValue = "";
      endDateValue = "";
      break;
    case 1: // 당일
      startDateValue = formatDate(today);
      endDateValue = formatDate(today);
      break;
    case 2: // 전일
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      startDateValue = formatDate(yesterday);
      endDateValue = formatDate(yesterday);
      break;
    case 3: // 당월
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      const lastDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      );
      startDateValue = formatDate(firstDayOfMonth);
      endDateValue = formatDate(lastDayOfMonth);
      break;
    case 4: // 전월
      const firstDayOfLastMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );
      const lastDayOfLastMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      );
      startDateValue = formatDate(firstDayOfLastMonth);
      endDateValue = formatDate(lastDayOfLastMonth);
      break;
  }

  // 날짜 인풋에 값 설정
  startDateInput.value = startDateValue;
  endDateInput.value = endDateValue;

  // 전역 변수 업데이트
  startDate = startDateValue;
  endDate = endDateValue;
}

// 테이블 헤더 업데이트 함수
function updateTableHeader() {
  const tableHeader = document.getElementById("table-header");
  const tableArea = document.querySelector(".tableArea");
  const dateSearchSection = document.getElementById("date-search-section");
  const detailSettingsSection = document.getElementById(
    "detail-settings-section"
  );

  if (!tableHeader || !tableArea) {
    console.error("테이블 요소를 찾을 수 없습니다.");
    return;
  }

  if (currentSalesType === "transaction") {
    // 건별 헤더
    tableHeader.innerHTML = `
      <th>순서</th>
      <th>일자</th>
      <th>상품</th>
      <th>가격</th>
      <th>상태</th>
    `;
    // 건별 클래스 제거
    tableArea.classList.remove("product-view");

    // 모든 섹션 표시
    if (dateSearchSection) {
      dateSearchSection.style.display = "flex";
    }
    if (detailSettingsSection) {
      detailSettingsSection.style.display = "block";
    }
  } else {
    // 상품별 헤더
    tableHeader.innerHTML = `
      <th>순서</th>
      <th>상품</th>
      <th>총주문액</th>
      <th>총건수</th>
    `;
    // 상품별 클래스 추가
    tableArea.classList.add("product-view");

    // 달력 조회, 상세설정 섹션 모두 숨기기
    if (dateSearchSection) {
      dateSearchSection.style.display = "none";
    }
    if (detailSettingsSection) {
      detailSettingsSection.style.display = "none";
    }
  }
}

async function getSalesList() {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const userId = userInfo.userId;

    let apiUrl = "";

    if (currentSalesType === "transaction") {
      apiUrl = `https://api.narrowroad-model.com/model_payment?func=get-payment&userId=${userId}`;

      if (startDate && endDate) {
        apiUrl += `&startDate=${startDate}&endDate=${endDate}`;
      }
    } else {
      apiUrl = `https://api.narrowroad-model.com/model_payment?userId=${userId}&func=get-menu-statistics`;
    }

    // 1페이지가 아닌 경우에만 lastEvaluatedKey 추가
    if (currentPage > 1 && pageKeys.length > 0) {
      const keyIndex = currentPage - 2; // 2페이지는 pageKeys[0], 3페이지는 pageKeys[1]

      if (pageKeys[keyIndex]) {
        apiUrl += `&lastEvaluatedKey=${encodeURIComponent(
          JSON.stringify(pageKeys[keyIndex])
        )}`;
      }
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    // 1페이지에서만 초기화
    if (currentPage === 1) {
      pageKeys = [];
      totalItems = data.total || 0;

      if (data.pageKeys) {
        try {
          pageKeys = JSON.parse(data.pageKeys);
        } catch (e) {
          console.error("pageKeys 파싱 실패:", e);
        }
      }
    }

    items = data.items || [];
    await renderSalesTable(items);
  } catch (error) {
    console.error("매출 데이터 로드 실패:", error);
  }
}

async function renderSalesTable(data: any[]) {
  const tbody = document.querySelector(".tableArea table tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  data.forEach((item: any, index: number) => {
    let rowContent = "";

    if (currentSalesType === "transaction") {
      // 건별 데이터 렌더링
      const date = String(item.timestamp).split("T");
      const dateStr = date[0];
      const timeStr = date[1].substring(0, 5);

      const menuName = item.menuSummary[0]?.name || "알 수 없음";
      const quantityDisplay =
        item.menuSummary.length > 1
          ? `<label class="plus">+${item.menuSummary.length - 1}</label>`
          : "";

      rowContent = `
        <td>${(currentPage - 1) * pageLimit + index + 1}</td>
        <td>${dateStr} <br class="br-s">${timeStr}</td>
        <td class="rel"><span>${menuName}</span> ${quantityDisplay}</td>
        <td>${item.totalPrice.toLocaleString()}원</td>
        <td class="blue">정보없음</td>
      `;
    } else {
      // 상품별 데이터 렌더링
      const productName = item.name || "알 수 없음";
      const totalSales = item.totalSales || 0;
      const totalCount = item.totalCount || 0;

      rowContent = `
        <td>${(currentPage - 1) * pageLimit + index + 1}</td>
        <td class="rel" style="padding-left: 10rem; text-align: left;"><span>${productName}</span></td>
        <td>${totalSales.toLocaleString()}원</td>
        <td class="blue">${totalCount}건</td>
      `;
    }

    const row = document.createElement("tr");
    row.className = "on-popup";
    row.setAttribute(
      "data-index",
      ((currentPage - 1) * pageLimit + index).toString()
    );
    row.innerHTML = rowContent;

    tbody.appendChild(row);
  });

  // 페이지네이션 버튼 렌더링
  renderServerSidePagination();
}

// 서버 사이드 페이지네이션 렌더링
function renderServerSidePagination() {
  const paginationContainer = document.querySelector(
    ".pagination"
  ) as HTMLElement;
  if (!paginationContainer) return;

  paginationContainer.style.display = "block";

  // 전체 페이지 수 계산 (매번 계산)
  const totalPages = Math.ceil(totalItems / pageLimit);

  // 기존 내용 초기화
  const pageNumbers = paginationContainer.querySelector(".page-numbers");
  if (pageNumbers) {
    pageNumbers.innerHTML = "";
  }

  // 기존 페이지 번호 버튼들 제거
  const existingPageButtons =
    paginationContainer.querySelectorAll("button[data-page]");
  existingPageButtons.forEach((btn) => btn.remove());

  // 페이지 번호 버튼 생성
  const visiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
  let endPage = startPage + visiblePages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - visiblePages + 1);
  }

  // 페이지 번호 버튼들 생성
  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement("button");
    btn.setAttribute("data-page", String(i));
    btn.innerText = String(i);
    btn.style.display = "inline-block";
    btn.style.margin = "0 2px";
    btn.style.padding = "5px 10px";
    btn.style.border = "1px solid #ddd";
    btn.style.backgroundColor = i === currentPage ? "#007bff" : "#fff";
    btn.style.color = i === currentPage ? "#fff" : "#333";
    btn.style.cursor = "pointer";

    if (i === currentPage) {
      btn.classList.add("active");
    }

    btn.addEventListener("click", () => {
      if (i !== currentPage) {
        currentPage = i;
        getSalesList();
      }
    });

    // 페이지 번호 버튼을 > 버튼 앞에 삽입
    const nextBtn = paginationContainer.querySelector(".page-next");
    if (nextBtn) {
      paginationContainer.insertBefore(btn, nextBtn);
    } else {
      paginationContainer.appendChild(btn);
    }
  }

  // 기존 <<, <, >, >> 버튼 이벤트 리스너 설정
  const firstBtn = paginationContainer.querySelector(
    ".page-first"
  ) as HTMLButtonElement;
  const prevBtn = paginationContainer.querySelector(
    ".page-prev"
  ) as HTMLButtonElement;
  const nextBtn = paginationContainer.querySelector(
    ".page-next"
  ) as HTMLButtonElement;
  const lastBtn = paginationContainer.querySelector(
    ".page-last"
  ) as HTMLButtonElement;

  // 기존 이벤트 리스너 제거
  [firstBtn, prevBtn, nextBtn, lastBtn].forEach((btn) => {
    if (btn) {
      btn.replaceWith(btn.cloneNode(true));
    }
  });

  // 새로운 버튼들 가져오기
  const newFirstBtn = paginationContainer.querySelector(
    ".page-first"
  ) as HTMLButtonElement;
  const newPrevBtn = paginationContainer.querySelector(
    ".page-prev"
  ) as HTMLButtonElement;
  const newNextBtn = paginationContainer.querySelector(
    ".page-next"
  ) as HTMLButtonElement;
  const newLastBtn = paginationContainer.querySelector(
    ".page-last"
  ) as HTMLButtonElement;

  // 맨 앞으로 버튼
  if (newFirstBtn) {
    newFirstBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage = 1;
        getSalesList();
      }
    });
    newFirstBtn.disabled = currentPage === 1;
  }

  // 이전 버튼
  if (newPrevBtn) {
    newPrevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        getSalesList();
      }
    });
    newPrevBtn.disabled = currentPage === 1;
  }

  // 다음 버튼
  if (newNextBtn) {
    newNextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        getSalesList();
      }
    });
    newNextBtn.disabled = currentPage === totalPages;
  }

  // 맨 뒤로 버튼
  if (newLastBtn) {
    newLastBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage = totalPages;
        getSalesList();
      }
    });
    newLastBtn.disabled = currentPage === totalPages;
  }
}

// 팝업 이벤트 핸들러 초기화
function initPopupHandlers() {
  const popupOverlay = document.querySelector(".popup-overlay") as HTMLElement;

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    // 테이블 행 클릭
    if (target.closest(".on-popup")) {
      const row = target.closest(".on-popup") as HTMLElement;
      const rowIndex = parseInt(row.getAttribute("data-index") || "0");

      // 해당 행의 데이터로 팝업 내용 업데이트
      updatePopupContent(rowIndex);
      popupOverlay.style.display = "flex";
    }

    // 팝업 닫기 버튼들 클릭
    if (target.closest(".popup-footer .gr") || target.closest(".close-btn")) {
      popupOverlay.style.display = "none";
    }
  });
}

// 팝업 내용을 실제 데이터로 업데이트하는 함수
async function updatePopupContent(rowIndex: number) {
  try {
    // 현재 페이지의 실제 데이터 인덱스 계산
    const actualIndex = rowIndex % pageLimit; // 0~9 범위로 변환
    const item = items[actualIndex];

    if (!item) {
      console.error("해당 인덱스의 데이터를 찾을 수 없습니다:", actualIndex);
      return;
    }

    console.log(
      `팝업 데이터 - 페이지: ${currentPage}, rowIndex: ${rowIndex}, actualIndex: ${actualIndex}`
    );

    let popupContent = "";

    if (currentSalesType === "transaction") {
      // 건별 데이터 팝업
      const menuItems = item.menuSummary
        .map((menu: any) => `${menu.name} ${menu.quantity || 1}개`)
        .join("<br>");

      const date = new Date(item.timestamp);
      const formattedDate = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(
        date.getHours()
      ).padStart(2, "0")}:${String(date.getMinutes()).padStart(
        2,
        "0"
      )}:${String(date.getSeconds()).padStart(2, "0")}`;

      popupContent = `
        <li>
          <div>
            <h5>주문상품</h5>
            <p>${menuItems}</p>
          </div>
        </li>
        <li>
          <div>
            <h5>매장명</h5>
            <p>${item.storeName || "정보 없음"}</p>
          </div>
          <div>
            <h5>매장 연락처</h5>
            <p>${item.tel || "정보 없음"}</p>
          </div>
          <div>
            <h5>사업자 등록번호</h5>
            <p>${item.businessNumber || "정보 없음"}</p>
          </div>
        </li>
        <li>
          <div>
            <h5>결제 금액</h5>
            <p>${item.totalPrice.toLocaleString()}원</p>
          </div>
          <div>
            <h5>결제 일자</h5>
            <p>${formattedDate}</p>
          </div>
          <div>
            <h5>승인번호</h5>
            <p>${item.orderId || "정보 없음"}</p>
          </div>
          <div>
            <h5>결제 수단</h5>
            <p>정보없음</p>
          </div>
          <div>
            <h5>결제 카드</h5>
            <p>정보 없음</p>
          </div>
          <div>
            <h5>카드 번호</h5>
            <p>정보 없음</p>
          </div>
          <div>
            <h5>포인트 연락처</h5>
            <p>정보 없음</p>
          </div>
          <div>
            <h5>사용 포인트</h5>
            <p>정보 없음</p>
          </div>
          <div>
            <h5>적립 포인트</h5>
            <p>${item.point || "정보없음"}P</p>
          </div>
        </li>
      `;
    } else {
      // 상품별 데이터 팝업
      const lastOrderDate = new Date(item.lastOrderTimestamp);
      const formattedDate = `${lastOrderDate.getFullYear()}-${String(
        lastOrderDate.getMonth() + 1
      ).padStart(2, "0")}-${String(lastOrderDate.getDate()).padStart(2, "0")}`;

      popupContent = `
        <li>
          <div>
            <h5>상품명</h5>
            <p>${item.name || "정보 없음"}</p>
          </div>
          <div>
            <h5>상품 ID</h5>
            <p>${item.menuId || "정보 없음"}</p>
          </div>
        </li>
        <li>
          <div>
            <h5>총 주문액</h5>
            <p>${(item.totalSales || 0).toLocaleString()}원</p>
          </div>
          <div>
            <h5>총 주문 건수</h5>
            <p>${item.totalCount || 0}건</p>
          </div>
          <div>
            <h5>마지막 주문일</h5>
            <p>${formattedDate}</p>
          </div>
        </li>
      `;
    }

    // 팝업 내용 업데이트
    const popupBody = document.querySelector(
      ".popup-body .history"
    ) as HTMLElement;
    if (popupBody) {
      popupBody.innerHTML = popupContent;
    }
  } catch (error) {
    console.error("팝업 데이터 업데이트 실패:", error);
  }
}

// 날짜 포맷팅 함수 (YYYY-MM-DD)
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 날짜 범위 유효성 검사
function validateDateRange(): boolean {
  if (!startDate && !endDate) {
    return true;
  }

  if (!startDate || !endDate) {
    showToastMessage("시작일과 종료일을 모두 선택해주세요.");
    return false;
  }

  if (startDate > endDate) {
    showToastMessage("시작일은 종료일보다 클 수 없습니다.");
    return false;
  }

  return true;
}

// 날짜 인풋 초기화
function resetDateInputs() {
  const startDateInput = document.querySelector(
    'input[type="date"]:first-of-type'
  ) as HTMLInputElement;
  const endDateInput = document.querySelector(
    'input[type="date"]:last-of-type'
  ) as HTMLInputElement;

  if (startDateInput) {
    startDateInput.value = "";
    startDate = "";
  }
  if (endDateInput) {
    endDateInput.value = "";
    endDate = "";
  }

  // 상세설정 라디오 버튼도 초기화 (전체 선택)
  const periodRadioButtons = document.querySelectorAll(
    'input[name="detail-period"]'
  ) as NodeListOf<HTMLInputElement>;

  if (periodRadioButtons.length > 0) {
    // 첫 번째 버튼(전체)을 선택
    periodRadioButtons[0].checked = true;
  }

  console.log("날짜 검색 초기화 완료");
}

// 토스트 메시지 표시
function showToastMessage(message: string) {
  const toast = document.createElement("div");
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #ff4444;
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
