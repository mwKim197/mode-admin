import { apiGet } from "../api/apiHelpers.ts";
import { getStoredUser } from "../utils/userStorage.ts";
import { MenuItem } from "../types/product.ts";

let allMenuItems: MenuItem[] = [];

export async function initMenuMerge() {
  console.log("✅ menuMerge.ts 로드됨");

  // 현재 사용자 정보 가져오기
  const user = getStoredUser();
  if (!user) {
    window.showToast("사용자 정보가 없습니다.", 3000, "error");
    return;
  }

  // 계정 목록 로드
  await loadAccountList();

  // 이벤트 리스너 추가
  initEventListeners();
}

// 계정 목록 로드
async function loadAccountList() {
  try {
    const response = await apiGet("/model_user_setting?func=get-users");
    const data = await response.json();

    if (data.users && Array.isArray(data.users)) {
      populateAccountSelects(data.users);
    } else {
      console.error("사용자 목록을 가져올 수 없습니다.");
      window.showToast("계정 목록을 불러오는데 실패했습니다.", 3000, "error");
    }
  } catch (error) {
    console.error("계정 목록 로드 실패:", error);
    window.showToast("계정 목록을 불러오는데 실패했습니다.", 3000, "error");
  }
}

// 계정 선택 옵션 생성 (couponDetail의 sampleSelect와 동일한 방식)
function populateAccountSelects(users: any[]) {
  const sourceSelect = document.getElementById(
    "sourceAccount"
  ) as HTMLSelectElement;
  const targetSelect = document.getElementById(
    "targetAccount"
  ) as HTMLSelectElement;

  if (sourceSelect && users) {
    sourceSelect.innerHTML = '<option value="">계정을 선택해주세요</option>';

    users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.userId;
      option.textContent = `${user.storeName} (${user.userId})`;
      sourceSelect.appendChild(option);
    });

    // couponDetail과 동일한 Choices 초기화
    new window.Choices(sourceSelect, {
      shouldSort: false,
      searchEnabled: true,
      position: "auto",
      classNames: {
        containerOuter: "custom-select",
        containerInner: "custom-select-inner",
        input: "custom-select-input",
        itemChoice: "custom-select-item",
        listDropdown: "custom-select-dropdown",
        placeholder: "custom-select-placeholder",
      },
    });
  }

  if (targetSelect && users) {
    targetSelect.innerHTML = '<option value="">계정을 선택해주세요</option>';

    users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.userId;
      option.textContent = `${user.storeName} (${user.userId})`;
      targetSelect.appendChild(option);
    });

    new window.Choices(targetSelect, {
      shouldSort: false,
      searchEnabled: true,
      position: "auto",
      classNames: {
        containerOuter: "custom-select",
        containerInner: "custom-select-inner",
        input: "custom-select-input",
        itemChoice: "custom-select-item",
        listDropdown: "custom-select-dropdown",
        placeholder: "custom-select-placeholder",
      },
    });
  }
}

// 이벤트 리스너 초기화
function initEventListeners() {
  const sourceSelect = document.getElementById("sourceAccount");
  if (sourceSelect) {
    sourceSelect.addEventListener("change", async (e: Event) => {
      const target = e.target as HTMLSelectElement;
      if (target.value) {
        await loadMenuList(target.value);
      }
    });
  }

  // 전체 선택 체크박스
  const selectAllCheckbox = document.getElementById(
    "selectAll"
  ) as HTMLInputElement;
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", (e) => {
      const isChecked = (e.target as HTMLInputElement).checked;
      toggleAllMenuSelection(isChecked);
    });
  }
}

// 메뉴 목록 로드
async function loadMenuList(userId: string) {
  try {
    console.log(`메뉴 목록 로드 시작: ${userId}`);

    const response = await apiGet(
      `/model_admin_menu?userId=${userId}&func=get-all-menu`
    );
    const data = await response.json();

    if (data.items && Array.isArray(data.items)) {
      allMenuItems = data.items as MenuItem[];
      renderMenuTable(allMenuItems);
      console.log(`메뉴 목록 로드 완료: ${allMenuItems.length}개`);
    } else {
      console.error("메뉴 목록을 가져올 수 없습니다.");
      window.showToast("메뉴 목록을 불러오는데 실패했습니다.", 3000, "error");
      displayMenuList([]);
    }
  } catch (error) {
    console.error("메뉴 목록 로드 실패:", error);
    window.showToast("메뉴 목록을 불러오는데 실패했습니다.", 3000, "error");
    displayMenuList([]);
  }
}

// 메뉴 목록 표시
function renderMenuTable(items: MenuItem[]) {
  const tbody = document.getElementById("menu-table-body");
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="h-14 text-center flex justify-center items-center">
          복사할 계정을 선택하면 메뉴 목록이 표시됩니다.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = items
    .map((item, index) => {
      const imageFile = item.image?.split("\\").pop() ?? "";
      const encodedFile = encodeURIComponent(imageFile);
      const imageUrl = `https://model-narrow-road.s3.ap-northeast-2.amazonaws.com/model/${item.userId}/${encodedFile}`;

      return `
        <tr>
          <td><input type="checkbox" class="menu-checkbox" value="${
            item.menuId
          }" /></td>
          <td>${item.no || index + 1}</td>
          <td style="text-align: center;">
            <img src="${imageUrl}" alt="${
        item.name
      }" style="width:36px;height:46px; object-fit:cover;display: inline-block;" />
          </td>
          <td>${item.name}</td>
          <td>${Number(item.price).toLocaleString()}원</td>
          <td>${item.empty === "no" ? "진열" : "숨김"}</td>
        </tr>
      `;
    })
    .join("");
}

function displayMenuList(menus: any[]) {
  renderMenuTable(menus);
}

// 전체 선택/해제
function toggleAllMenuSelection(isChecked: boolean) {
  const checkboxes = document.querySelectorAll(
    ".menu-checkbox"
  ) as NodeListOf<HTMLInputElement>;
  checkboxes.forEach((checkbox) => {
    checkbox.checked = isChecked;
  });
}
