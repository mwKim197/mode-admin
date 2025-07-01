export function initSales() {
  console.log("✅ sales.ts 로드됨");

  // 테이블 부분만 동적으로 변경
  renderSalesTable();
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
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${dateStr} <br class="br-s">${timeStr}</td>
        <td class="rel"><span>${menuName}</span> ${quantityDisplay}</td>
        <td>${item.totalPrice.toLocaleString()}원</td>
        <td class="blue">완료</td>
      `;

      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("매출 데이터 로드 실패:", error);
  }
}
