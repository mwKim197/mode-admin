export function initSales() {
  console.log("✅ sales.ts 로드됨");

  // 테이블 부분만 동적으로 변경
  renderSalesTable();
  initPopupHandlers();
}

async function renderSalesTable() {
  const tbody = document.querySelector(".tableArea table tbody");
  if (!tbody) return;

  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const userId = userInfo.userId;

    const response = await fetch(
      `https://api.narrowroad-model.com/model_payment?func=get-payment&userId=${userId}`
    );

    const data = await response.json();

    tbody.innerHTML = "";

    data.items.forEach((item: any, index: number) => {
      const date = new Date(item.timestamp);
      const dateStr = date.toISOString().split("T")[0];
      const timeStr = date.toTimeString().split(" ")[0].substring(0, 5);
      const menuName = item.menuSummary[0]?.name || "알 수 없음";
      const quantityDisplay =
        item.menuSummary.length > 1
          ? `<label class="plus">+${item.menuSummary.length - 1}</label>`
          : "";

      const row = document.createElement("tr");
      row.className = "on-popup";
      row.setAttribute("data-index", index.toString());
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${dateStr} <br class="br-s">${timeStr}</td>
        <td class="rel"><span>${menuName}</span> ${quantityDisplay}</td>
        <td>${item.totalPrice.toLocaleString()}원</td>
        <td class="blue">정보없음</td>
      `;

      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("매출 데이터 로드 실패:", error);
  }
}

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
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const userId = userInfo.userId;

    const response = await fetch(
      `https://api.narrowroad-model.com/model_payment?func=get-payment&userId=${userId}`
    );

    const data = await response.json();
    const item = data.items[rowIndex];

    if (!item) return;

    // 주문상품 정보 구성
    const menuItems = item.menuSummary
      .map((menu: any) => `${menu.name} ${menu.quantity || 1}개`)
      .join(", ");

    // 결제일자 포맷팅
    const date = new Date(item.timestamp);
    const formattedDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(
      date.getHours()
    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(
      date.getSeconds()
    ).padStart(2, "0")}`;

    // 팝업 내용 업데이트
    const popupBody = document.querySelector(
      ".popup-body .history"
    ) as HTMLElement;
    if (popupBody) {
      popupBody.innerHTML = `
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
    }
  } catch (error) {
    console.error("팝업 데이터 업데이트 실패:", error);
  }
}
