import html2canvas from "html2canvas";

let items: any[] = []; // 현재 페이지 데이터만 저장
let pageKeys: any[] = []; // 페이지 키 배열
let totalItems = 0; // 전체 아이템 수
let currentPage = 1;
const pageLimit = 10;
let currentSalesType = "transaction"; // 'transaction' (건별) 또는 'product' (상품별)

// 날짜 검색 관련 변수
let startDate = "";
let endDate = "";

// 결제방식 관련 변수 추가
let currentPaymentType = "all"; // 'all', 'card', 'point'

export function initSales() {
  console.log("✅ sales.ts 로드됨");

  // 매출 구분 라디오 버튼 이벤트 리스너 추가
  initSalesTypeRadioHandlers();

  // 날짜 검색 이벤트 리스너 추가
  initDateSearchHandlers();

  // 상세설정 라디오 버튼 이벤트 리스너 추가
  initDetailPeriodHandlers();

  // 결제방식 라디오 버튼 이벤트 리스너 추가
  initPaymentTypeHandlers();

  // 엑셀 다운로드 이벤트 리스너 추가
  initExcelDownloadHandler();

  // 페이지 로드 시 기본값 설정 (건별이 체크되어 있음)
  currentSalesType = "transaction";

  // 통계 정보 초기화
  resetSalesStatistics();

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

        // 상품별 데이터일 때 통계 정보 초기화
        if (currentSalesType === "product") {
          resetSalesStatistics();

          // 날짜 파라미터 초기화
          startDate = "";
          endDate = "";
        }

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
      <th style="padding-left: 3rem; text-align: center;">상품</th>
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

    // 건별 데이터일 때는 섹션과 테이블을 따로 호출
    if (currentSalesType === "transaction") {
      // 섹션 부분을 위한 전체 통계 API 호출 (페이지네이션 없이)
      await updateSectionWithPaymentData(userId);

      // 테이블 부분을 위한 페이지별 데이터 API 호출
      await getTableData(userId);
    } else {
      // 상품별 데이터는 테이블만 따로 호출하고, 섹션은 건별 탭과 동일하게
      await updateSectionWithPaymentData(userId);

      // 상품별 데이터는 전체 데이터를 한 번에 가져오기
      let apiUrl = `https://api.narrowroad-model.com/model_payment?userId=${userId}&func=get-menu-statistics`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      // 정렬 없이 그대로 사용
      items = data.items || [];

      await renderSalesTable(items);
    }
  } catch (error) {
    console.error("매출 데이터 로드 실패:", error);
  }
}

// 섹션 부분을 위한 전체 통계 API 호출
async function updateSectionWithPaymentData(userId: string) {
  try {
    let paymentApiUrl = `https://api.narrowroad-model.com/model_payment?func=get-payment&userId=${userId}`;

    if (startDate && endDate) {
      paymentApiUrl += `&startDate=${startDate}&endDate=${endDate}`;
    }

    const paymentResponse = await fetch(paymentApiUrl);
    const paymentData = await paymentResponse.json();

    updateSalesStatistics(paymentData);
  } catch (error) {
    console.error("섹션 데이터 로드 실패:", error);
  }
}

// 결제방식 라디오 버튼 이벤트 핸들러 추가
function initPaymentTypeHandlers() {
  const paymentRadioButtons = document.querySelectorAll(
    'input[name="payment-type"]'
  );

  paymentRadioButtons.forEach((radio, index) => {
    radio.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      if (target.checked) {
        switch (index) {
          case 0: // 전체
            currentPaymentType = "all";
            break;
          case 1: // 카드
            currentPaymentType = "card";
            break;
          case 2: // 포인트
            currentPaymentType = "point";
            break;
        }
        currentPage = 1;
        getSalesList();
      }
    });
  });
}

// 테이블 부분을 위한 페이지별 데이터 API 호출
async function getTableData(userId: string) {
  try {
    let apiUrl = `https://api.narrowroad-model.com/model_payment?func=get-payment&userId=${userId}`;

    if (startDate && endDate) {
      apiUrl += `&startDate=${startDate}&endDate=${endDate}`;
    }

    // 결제방식 파라미터 추가 (전체가 아닌 경우에만)
    if (currentPaymentType !== "all") {
      apiUrl += `&paymentType=${currentPaymentType}`;
    }

    // 페이지네이션 키 추가
    if (currentPage > 1 && pageKeys.length > 0) {
      const keyIndex = currentPage - 2;
      if (pageKeys[keyIndex]) {
        apiUrl += `&lastEvaluatedKey=${encodeURIComponent(
          JSON.stringify(pageKeys[keyIndex])
        )}`;
      }
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    // 페이지네이션 데이터 업데이트
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
    console.error("테이블 데이터 로드 실패:", error);
  }
}

// 매출 통계 정보 업데이트 함수
function updateSalesStatistics(data: any) {
  // HTML 요소 업데이트
  const countArea = document.querySelector(".countArea");
  if (countArea) {
    const countboxes = countArea.querySelectorAll(".countbox");

    // 총 매출
    if (countboxes[0]) {
      const totalPriceElement = countboxes[0].querySelector("h4");
      if (totalPriceElement) {
        const totalPriceSum = data.totalPriceSum || 0;
        totalPriceElement.innerHTML = `${totalPriceSum.toLocaleString()}<small>원</small>`;
      }
    }

    // 총 판매량
    if (countboxes[1]) {
      const totalCountElement = countboxes[1].querySelector("h4");
      if (totalCountElement) {
        const totalCount = data.totalCount || 0;
        totalCountElement.innerHTML = `${totalCount}<small>건</small>`;
      }
    }

    // 포인트 매출
    if (countboxes[2]) {
      const pointSumElement = countboxes[2].querySelector("h4");
      if (pointSumElement) {
        const pointSum = data.pointSum || 0;
        pointSumElement.innerHTML = `${pointSum}<small>P</small>`;
      }
    }

    // 포인트 결제건
    if (countboxes[3]) {
      const pointCountElement = countboxes[3].querySelector("h4");
      if (pointCountElement) {
        const pointCount = data.pointCount || 0;
        pointCountElement.innerHTML = `${pointCount}<small>건</small>`;
      }
    }
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

      // 각 메뉴의 count를 모두 더한 값 계산
      const totalQuantity = item.menuSummary.reduce(
        (sum: number, menu: any) => sum + (menu.count || 1),
        0
      );
      const quantityDisplay =
        totalQuantity > 1
          ? `<label class="plus">+${totalQuantity - 1}</label>`
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
        <td>${index + 1}</td>
        <td class="rel" style="padding-left: 3rem; text-align: left;"><span>${productName}</span></td>
        <td>${totalSales.toLocaleString()}원</td>
        <td class="blue">${totalCount}건</td>
      `;
    }

    const row = document.createElement("tr");
    row.className = "on-popup";

    // 상품별 탭에서는 단순 인덱스, 건별 탭에서는 페이지네이션 고려
    const dataIndex =
      currentSalesType === "product"
        ? index.toString()
        : ((currentPage - 1) * pageLimit + index).toString();

    row.setAttribute("data-index", dataIndex);
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

  // 상품별 탭일 때는 페이지네이션 완전히 숨기기
  if (currentSalesType === "product") {
    paginationContainer.style.display = "none";
    return;
  }

  // 건별 탭일 때만 페이지네이션 표시
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

  // 건별 탭일 때는 버튼들 표시하고 이벤트 리스너 설정
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

  // 버튼들 표시
  if (firstBtn) firstBtn.style.display = "inline-block";
  if (prevBtn) prevBtn.style.display = "inline-block";
  if (nextBtn) nextBtn.style.display = "inline-block";
  if (lastBtn) lastBtn.style.display = "inline-block";

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

    // 이미지 저장 버튼 클릭
    if (target.closest(".save-img")) {
      savePopupAsImage();
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
    let actualIndex: number;
    let item: any;

    if (currentSalesType === "product") {
      // 상품별 탭에서는 rowIndex를 그대로 사용
      actualIndex = rowIndex;
      item = items[actualIndex];
    } else {
      // 건별 탭에서는 페이지네이션 고려
      actualIndex = rowIndex % pageLimit;
      item = items[actualIndex];
    }

    if (!item) {
      console.error("해당 인덱스의 데이터를 찾을 수 없습니다:", actualIndex);
      return;
    }

    // 매장 정보 가져오기
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const userId = userInfo.userId;
    let storeInfo = { storeName: "정보 없음", tel: "정보 없음" };

    try {
      const storeResponse = await fetch(
        `https://api.narrowroad-model.com/model_user_setting?func=get-user&userId=${userId}`
      );
      const storeData = await storeResponse.json();

      if (storeData && storeData.user) {
        storeInfo = {
          storeName: storeData.user.storeName || "정보 없음",
          tel: storeData.user.tel || "정보 없음",
        };
      }
    } catch (error) {
      console.error("매장 정보 로드 실패:", error);
    }

    let popupContent = "";

    if (currentSalesType === "transaction") {
      // 건별 데이터 팝업
      const menuItems = item.menuSummary
        .map((menu: any, index: number) => {
          return `${menu.name} ${menu.count || 1}개`;
        })
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

      const usedPoints = item.point === 0 ? "0P" : `${item.point}P`;

      // 해당 주문의 실제 결제방식 확인
      let actualPaymentType = "card"; // 기본값
      let paymentMethodText = "카드"; // 기본값
      let pointContact = "정보 없음";
      let earnedPoints = "정보없음";

      // 실제 결제방식 확인을 먼저 실행
      if (item.point > 0) {
        actualPaymentType = "point";
        paymentMethodText = "포인트";
      } else {
      }

      // API 호출 제거하고 현재 데이터에서 포인트 정보 가져오기
      if (item.pointData) {
        pointContact = item.pointData.tel || "정보 없음";
        const earnedPointsValue = item.pointData.points || 0;
        earnedPoints = `${earnedPointsValue}P`;
      } else {
      }

      // 실제 결제방식에 따라 표시 정보 결정
      let paymentMethodInfo = "";
      let pointInfo = "";

      if (actualPaymentType === "card") {
        // 카드 결제일 때: 카드 정보만 표시
        paymentMethodInfo = `
          <div>
            <h5>결제 카드</h5>
            <p>정보 없음</p>
          </div>
          <div>
            <h5>카드 번호</h5>
            <p>정보 없음</p>
          </div>
        `;
        pointInfo = "";
      } else if (actualPaymentType === "point") {
        // 포인트 결제일 때: 포인트 정보만 표시
        paymentMethodInfo = "";
        pointInfo = `
          <div>
            <h5>포인트 연락처</h5>
            <p>${pointContact}</p>
          </div>
          <div>
            <h5>사용 포인트</h5>
            <p>${usedPoints}</p>
          </div>
          <div>
            <h5>적립 포인트</h5>
            <p>${earnedPoints}</p>
          </div>
        `;
      }

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
            <p>${storeInfo.storeName}</p>
          </div>
          <div>
            <h5>매장 연락처</h5>
            <p>${storeInfo.tel}</p>
          </div>
          <div>
            <h5>사업자 등록번호</h5>
            <p>추후등록예정</p>
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
            <p>${paymentMethodText}</p>
          </div>
          ${paymentMethodInfo}
          ${pointInfo}
        </li>
      `;
    } else {
      // 상품별 데이터 팝업 (기존과 동일)
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

    // 환불/삭제 버튼을 투명하게 만들고 취소 버튼만 보이게
    const popupFooter = document.querySelector(".popup-footer") as HTMLElement;
    if (popupFooter) {
      const refundBtn = popupFooter.querySelector(".btn.blue") as HTMLElement;
      const deleteBtn = popupFooter.querySelector(".btn.red") as HTMLElement;

      if (refundBtn) {
        refundBtn.style.visibility = "hidden"; // 공간은 유지하되 보이지 않게
        refundBtn.style.opacity = "0";
      }
      if (deleteBtn) {
        deleteBtn.style.visibility = "hidden"; // 공간은 유지하되 보이지 않게
        deleteBtn.style.opacity = "0";
      }
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

// 팝업을 이미지로 저장하는 함수
async function savePopupAsImage() {
  try {
    const popup = document.querySelector(".popup") as HTMLElement;
    if (!popup) {
      showToastMessage("팝업을 찾을 수 없습니다.");
      return;
    }

    // 캡처에서 제외할 요소들
    const elementsToHide = [
      popup.querySelector(".save-img"),
      popup.querySelector(".close-btn"),
      ...popup.querySelectorAll(".popup-footer .btn"),
    ].filter(Boolean) as HTMLElement[];

    // 원래 display 값 저장 및 숨김
    const originalDisplays = elementsToHide.map((el) => el.style.display);
    elementsToHide.forEach((el) => (el.style.display = "none"));

    // 스타일 저장
    const originalStyles = {
      animation: popup.style.animation,
      boxShadow: popup.style.boxShadow,
      opacity: popup.style.opacity,
      transform: popup.style.transform,
      width: popup.style.width,
      height: popup.style.height,
    };

    const historyElement = popup.querySelector(".history") as HTMLElement;
    const originalHistoryStyles = {
      maxHeight: historyElement.style.maxHeight,
      minHeight: historyElement.style.minHeight,
      height: historyElement.style.height,
      overflow: historyElement.style.overflow,
    };

    // 캡처용 스타일 적용
    Object.assign(popup.style, {
      animation: "none",
      boxShadow: "none",
      opacity: "1",
      transform: "none",
      width: "400px",
      height: "auto",
    });

    Object.assign(historyElement.style, {
      maxHeight: "none",
      minHeight: "auto",
      height: "auto",
      overflow: "visible",
    });

    // 캡처 실행
    setTimeout(() => {
      html2canvas(popup, {
        scale: 1,
        useCORS: true,
        width: 400,
        height: popup.scrollHeight,
      })
        .then((canvas) => {
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

          // 다운로드
          const fileName = `매출정보_${new Date()
            .toISOString()
            .slice(0, 10)}.png`;
          downloadURI(roundedCanvas.toDataURL("image/png"), fileName);

          // 스타일 복구
          restoreStyles();
          showToastMessage("이미지가 성공적으로 저장되었습니다.");
        })
        .catch((error) => {
          console.error("이미지 저장 실패:", error);
          showToastMessage("이미지 저장에 실패했습니다.");
          restoreStyles();
        });
    }, 100);

    // 스타일 복구 함수
    function restoreStyles() {
      Object.assign(popup.style, originalStyles);
      Object.assign(historyElement.style, originalHistoryStyles);
      elementsToHide.forEach((el, index) => {
        el.style.display = originalDisplays[index];
      });
    }
  } catch (error) {
    console.error("이미지 저장 실패:", error);
    showToastMessage("이미지 저장에 실패했습니다.");
  }
}

// 이미지 다운로드 함수
function downloadURI(uri: string, name: string) {
  const link = document.createElement("a");
  link.download = name; // 다운로드할 파일 이름
  link.href = uri; // Data URI
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link); // DOM 정리
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

// 통계 정보 초기화 함수
function resetSalesStatistics() {
  const countArea = document.querySelector(".countArea");
  if (countArea) {
    const countboxes = countArea.querySelectorAll(".countbox");

    // 총 매출
    if (countboxes[0]) {
      const totalPriceElement = countboxes[0].querySelector("h4");
      if (totalPriceElement) {
        totalPriceElement.innerHTML = `0<small>원</small>`;
      }
    }

    // 총 판매량
    if (countboxes[1]) {
      const totalCountElement = countboxes[1].querySelector("h4");
      if (totalCountElement) {
        totalCountElement.innerHTML = `0<small>건</small>`;
      }
    }

    // 포인트 매출
    if (countboxes[2]) {
      const pointSumElement = countboxes[2].querySelector("h4");
      if (pointSumElement) {
        pointSumElement.innerHTML = `0<small>P</small>`;
      }
    }

    // 포인트 결제건
    if (countboxes[3]) {
      const pointCountElement = countboxes[3].querySelector("h4");
      if (pointCountElement) {
        pointCountElement.innerHTML = `0<small>건</small>`;
      }
    }
  }
}

// 엑셀 다운로드 이벤트 핸들러 추가
function initExcelDownloadHandler() {
  const excelBtn = document.querySelector(".btn.wt") as HTMLButtonElement;

  if (excelBtn) {
    excelBtn.addEventListener("click", downloadExcel);
  }
}

// 엑셀 다운로드 함수
async function downloadExcel() {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const userId = userInfo.userId;

    if (!userId) {
      showToastMessage("사용자 정보를 찾을 수 없습니다.");
      return;
    }

    // 현재 탭에 따라 다른 API 호출
    let apiUrl = "";

    if (currentSalesType === "transaction") {
      // 건별 탭: 기존 API
      apiUrl = `https://api.narrowroad-model.com/model_payment?func=get-payment-excel&userId=${userId}`;

      // 결제방식 파라미터 추가 (전체가 아닌 경우에만)
      if (currentPaymentType !== "all") {
        apiUrl += `&paymentType=${currentPaymentType}`;
      }

      // 날짜 파라미터 추가 (전체가 아닌 경우에만)
      if (startDate && endDate) {
        apiUrl += `&startDate=${startDate}&endDate=${endDate}`;
      }
    } else {
      // 상품별 탭: 새로운 API
      apiUrl = `https://api.narrowroad-model.com/model_payment?func=get-menu-statistics-excel&userId=${userId}`;

      // 페이지네이션 키 추가 (1페이지가 아닌 경우에만)
      if (currentPage > 1 && pageKeys.length > 0) {
        const keyIndex = currentPage - 2;
        if (pageKeys[keyIndex]) {
          apiUrl += `&lastEvaluatedKey=${encodeURIComponent(
            JSON.stringify(pageKeys[keyIndex])
          )}`;
        }
      }
    }

    console.log("엑셀 다운로드 API URL:", apiUrl);

    // API 호출
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.excelUrl) {
      throw new Error("엑셀 URL을 받지 못했습니다.");
    }

    // S3 URL로 파일 다운로드 (백엔드 파일명 그대로 사용)
    const a = document.createElement("a");
    a.href = data.excelUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error("엑셀 다운로드 실패:", error);
    showToastMessage("엑셀 다운로드에 실패했습니다.");
  }
}
