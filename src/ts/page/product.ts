import {getStoredUser} from "../utils/userStorage.ts";
import {apiGet, apiPost} from "../api/apiHelpers.ts";
import {MenuItem} from "../types/product.ts";

const changeList: { menuId: number; empty?: string; delete?: boolean }[] = [];

export function initProduct() {
  // localstorage에 저장된 user 정보를 불러옴
  const user = getStoredUser();

  if (!user) {
    alert("사용자 정보가 없습니다.");
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
      const imageUrl = `https://model-narrow-road.s3.ap-northeast-2.amazonaws.com/model/${item.userId}/${imageFile}`; // 필요 시 경로 조정

      return `
      <tr>
        <td>${item.no}</td>
        <td><img src="${imageUrl}" alt="상품 이미지" style="width:36px;height:46px; object-fit:cover;"></td>
        <td class="product-name w-[100px] whitespace-normal break-all text-sm" onclick="window.open('./product-detail.html?menuId=${item.menuId}', '_blank')">
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
          <span class="tag blue">제조</span>
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
    }
  })();

}

const saveBtn = document.getElementById("saveBtn") as HTMLInputElement;

if (saveBtn) {

  saveBtn.addEventListener("click", () => {

    if (changeList.length === 0) {
      alert("변경된 내용이 없습니다.");
      return;
    }

    if(confirm("수정사항을 저장하시겠습니까?")) {
      saveChanges().catch(() => {
        alert("수정에 실패했습니다.");
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
      alert("✅ 변경 사항 저장 완료");
      location.reload(); // 또는 init() 호출
    } else {
      const err = await res.json();
      alert(`❌ 저장 실패: ${err.message}`);
    }
  } catch (err) {
    console.error("❌ 저장 오류:", err);
    alert("서버 오류로 저장에 실패했습니다.");
  }
}

// 맨 아래에 추가하세요
(window as any).onToggleChange = onToggleChange;
(window as any).onDeleteClick = onDeleteClick;