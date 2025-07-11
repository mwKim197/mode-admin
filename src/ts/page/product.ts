import {getStoredUser} from "../utils/userStorage.ts";
import {apiGet, apiPost} from "../api/apiHelpers.ts";
import {MenuItem} from "../types/product.ts";

const changeList: { menuId: number; empty?: string; delete?: boolean }[] = [];

export function initProduct() {
  // localstorage에 저장된 user 정보를 불러옴
  const user = getStoredUser();

  if (!user) {
    window.showToast(`❌ 사용자 정보가 없습니다.`, 3000, "error");
    return;
  }

  async function fetchMenuList() {
    const res = await apiGet(`/model_admin_menu?userId=${user?.userId}&func=get-all-menu`);
    const data = await res.json();

    return data.items as MenuItem[];
  }

  function renderMenuTable(items: MenuItem[]) {
    const tbody = document.getElementById("menu-table-body");
    if (!tbody) return;
    changeList.length = 0; // 기존 변경사항 모두 제거

    tbody.innerHTML = items.map(item => {
      const imageFile = item.image?.split("\\").pop() ?? "";
      const encodedFile = encodeURIComponent(imageFile); // ✅ 한글/공백 처리
      const imageUrl = `https://model-narrow-road.s3.ap-northeast-2.amazonaws.com/model/${item.userId}/${encodedFile}`; // 필요 시 경로 조정

      return `
      <tr>
        <td>${item.no}</td>
        <td><img src="${imageUrl}" alt="상품 이미지" style="width:36px;height:46px; object-fit:cover;"></td>
        <td class="product-name w-[100px] whitespace-normal break-all text-sm" onclick="window.location.href='./product-detail.html?menuId=${item.menuId}'">
          ${item.name}
        </td>
        <td>${Number(item.price).toLocaleString()}</td>
        <td>
          <label class="toggle-switch">
            <input
              type="checkbox"
              ${item.empty === 'no' ? 'checked' : ''}
              onchange="onToggleChange(${item.menuId}, this.checked)">
            <span class="slider"></span>
          </label>
        </td>
        <td>
          <span class="tag blue" data-menu='${encodeURIComponent(JSON.stringify(item))}' onclick="onAdminOder(this)">제조</span>
          <span class="tag red" onclick="onDeleteClick(${item.menuId}, event)">삭제</span>
        </td>
      </tr>
    `;
    }).join("");
  }

  (async function init() {
    try {
      const menuItems = await fetchMenuList();
      renderMenuTable(menuItems);
      changeList.length = 0; // 기존 변경사항 모두 제거
    } catch (err) {
      console.error("❌ 메뉴 목록 불러오기 실패", err);
      window.showToast(`❌ 메뉴 목록 불러오기 실패: ${err}`, 3000, "error");
    }
  })();

}

const saveBtn = document.getElementById("saveBtn") as HTMLInputElement;

if (saveBtn) {

  saveBtn.addEventListener("click", () => {

    if (changeList.length === 0) {
      window.showToast(`변경된 내용이 없습니다.`, 3000, "warning");
      return;
    }

    if(confirm("수정사항을 저장하시겠습니까?")) {
      saveChanges().catch(() => {
        window.showToast(`❌ 수정에 실패했습니다.`, 3000, "error");
      });
    }
  })
}

// 토글 버튼
function onToggleChange(menuId: number, isChecked: boolean) {
  const emptyValue = isChecked ? "no" : "yes";
  updateChangeList(menuId, { empty: emptyValue });
  console.log("changeList: ", changeList);
}

// 삭제 버튼
function onDeleteClick(menuId: number, event: any) {
  updateChangeList(menuId, { delete: true });
  const row = event.target.closest("tr");
  if (row) row.classList.add("tr-disabled");
}

// 어드민 주문
function onAdminOder(el: HTMLElement) {
  const itemStr = decodeURIComponent(el.dataset.menu || '{}');
  const item = JSON.parse(itemStr);
  const data = transformToOrderData(item);
  sendMachineCommand("order", data);
}

// 주문내역 변환
function transformToOrderData(item: any): any {
  return {
    orderData: {
      orderList: [
        {
          orderId: `${item.menuId}-${item.userId}`,
          userId: item.userId,
          menuId: item.menuId,
          name: item.name,
          count: 1 // ✅ 주문 개수로 사용
        }
      ]
    }
  };
}

// 수정 목록 업데이트
function updateChangeList(menuId: number, updates: { empty?: string; delete?: boolean }) {
  const index = changeList.findIndex(item => item.menuId === menuId);
  if (index !== -1) {
    changeList[index] = { ...changeList[index], ...updates };
  } else {
    changeList.push({ menuId, ...updates });
  }
}

// 저장 버튼 동작
async function saveChanges() {

  const user = getStoredUser();
  if (!user) return;

  const body = {
    userId: user.userId,
    items: changeList
  };

  try {
    const res = await apiPost(`/model_admin_menu?func=bulk-update-or-delete`, body);

    if (res.ok) {
      window.showToast(`변경 사항 저장 완료`);
      location.reload(); // 또는 init() 호출
    } else {
      const err = await res.json();
      console.error("❌ 저장 실패:", err.message);
      window.showToast(`❌ 저장 실패: ${err.message} `, 3000, "error");
    }
  } catch (err) {
    console.error("❌ 저장 오류:", err);
    window.showToast(`❌ 저장 오류: ${err} `, 3000, "error");
  }
}

async function sendMachineCommand(func: string, data: any = {}) {
  const user = getStoredUser();
  if (!user) {
    window.showToast(`❌ 사용자 정보가 없습니다.`, 3000, "error");
    return;
  }
  const payload = {
    func,
    userId: user.userId,
    ...(func === "order" ? { orderData: data.orderData } : {})
  };

  // ✅ 요청만 보내고 응답 기다리지 않음
  apiPost("/model_machine_controll", payload)
      .then(() => {
        window.showToast(`제조 명령 전송 완료`);
      })
      .catch(err => {
        window.showToast(`❌ 명령 전송 실패: ${err} `, 3000, "error");
      });

  window.showToast(`제조 명령 전송`);
}

// 맨 아래에 추가하세요
(window as any).onToggleChange = onToggleChange;
(window as any).onDeleteClick = onDeleteClick;
(window as any).onAdminOder = onAdminOder;