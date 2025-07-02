let items: any[] = []; // API 데이터 저장용
let currentPage = 1;
const pageLimit = 10;
let currentSalesType = "transaction"; // 'transaction' (건별) 또는 'product' (상품별)

export function initSales() {
  console.log("✅ sales.ts 로드됨");

  // 매출 구분 라디오 버튼 이벤트 리스너 추가
  initSalesTypeRadioHandlers();

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
        updateTableHeader(); // 테이블 헤더 업데이트
        getSalesList(); // 새로운 데이터 로드
        console.log("매출 구분 변경:", currentSalesType); // 디버깅용
      }
    });
  });
}

// 테이블 헤더 업데이트 함수
function updateTableHeader() {
  const tableHeader = document.getElementById("table-header");
  if (!tableHeader) {
    console.error("테이블 헤더를 찾을 수 없습니다.");
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
  } else {
    // 상품별 헤더
    tableHeader.innerHTML = `
      <th>순서</th>
      <th>상품</th>
      <th>총주문액</th>
      <th>총건수</th>
    `;
  }
  console.log("테이블 헤더 업데이트 완료:", currentSalesType); // 디버깅용
}

async function getSalesList() {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const userId = userInfo.userId;

    let apiUrl = "";

    if (currentSalesType === "transaction") {
      // 건별 매출 데이터
      apiUrl = `https://api.narrowroad-model.com/model_payment?func=get-payment&userId=${userId}&limit=1000`;
    } else {
      // 상품별 매출 데이터
      apiUrl = `https://api.narrowroad-model.com/model_payment?userId=${userId}&func=get-menu-statistics`;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();
    items = data.items || [];

    // 페이지네이션으로 테이블 렌더링
    await renderSalesTable(items);
  } catch (error) {
    console.error("매출 데이터 로드 실패:", error);
  }
}

async function renderSalesTable(data: any[]) {
  const tbody = document.querySelector(".tableArea table tbody");
  if (!tbody) return;

  // 페이지네이션 계산
  const startIndex = (currentPage - 1) * pageLimit;
  const endIndex = startIndex + pageLimit;
  const pageData = data.slice(startIndex, endIndex);

  tbody.innerHTML = "";

  pageData.forEach((item: any, index: number) => {
    let rowContent = "";

    if (currentSalesType === "transaction") {
      // 건별 데이터 렌더링
      const date = new Date(item.timestamp);
      const dateStr = date.toISOString().split("T")[0];
      const timeStr = date.toTimeString().split(" ")[0].substring(0, 5);
      const menuName = item.menuSummary[0]?.name || "알 수 없음";
      const quantityDisplay =
        item.menuSummary.length > 1
          ? `<label class="plus">+${item.menuSummary.length - 1}</label>`
          : "";

      rowContent = `
        <td>${startIndex + index + 1}</td>
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
        <td>${startIndex + index + 1}</td>
        <td class="rel"><span>${productName}</span></td>
        <td>${totalSales.toLocaleString()}원</td>
        <td class="blue">${totalCount}건</td>
      `;
    }

    const row = document.createElement("tr");
    row.className = "on-popup";
    row.setAttribute("data-index", (startIndex + index).toString());
    row.innerHTML = rowContent;

    tbody.appendChild(row);
  });

  // 페이지네이션 버튼 렌더링
  renderSimplePagination(data.length);
}

// 페이지네이션 렌더링
function renderSimplePagination(totalItems: number) {
  const paginationContainer = document.querySelector(
    ".pagination"
  ) as HTMLElement;
  if (!paginationContainer) return;

  // null 체크 후에 사용
  paginationContainer.style.display = "block";

  const totalPages = Math.ceil(totalItems / pageLimit);

  // 페이지 번호 업데이트
  const pageNumbers = paginationContainer.querySelector(".page-numbers");
  if (pageNumbers) {
    pageNumbers.textContent = `${currentPage} / ${totalPages}`;
  }

  // 모든 버튼에 이벤트 리스너 추가
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

  // 기존 이벤트 리스너 제거 (중복 방지)
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
        renderSalesTable(items);
      }
    });
    newFirstBtn.disabled = currentPage === 1;
  }

  // 이전 버튼
  if (newPrevBtn) {
    newPrevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderSalesTable(items);
      }
    });
    newPrevBtn.disabled = currentPage === 1;
  }

  // 다음 버튼
  if (newNextBtn) {
    newNextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderSalesTable(items);
      }
    });
    newNextBtn.disabled = currentPage === totalPages;
  }

  // 맨 뒤로 버튼
  if (newLastBtn) {
    newLastBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage = totalPages;
        renderSalesTable(items);
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
    // 전역 items 배열에서 해당 인덱스의 데이터 가져오기
    const item = items[rowIndex];

    if (!item) {
      console.error("해당 인덱스의 데이터를 찾을 수 없습니다:", rowIndex);
      return;
    }

    let popupContent = "";

    if (currentSalesType === "transaction") {
      // 건별 데이터 팝업 (기존 코드)
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
            <p>${item.storePhone || "정보 없음"}</p>
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
