import {apiGet, apiPost} from "../api/apiHelpers.ts";
import {getStoredUser} from "../utils/userStorage.ts";
import {MenuItem} from "../types/product.ts";
import {getUserData} from "../common/auth.ts";

let allMenuItems: MenuItem[] = [];

// 전역 변수로 선택값 저장
let selectedSourceAccount: string = "";
let selectedTargetAccount: string = "";

export async function initMenuMerge() {
    console.log("✅ menuMerge.ts 로드됨");

    // 현재 사용자 정보 가져오기
    /*  const user = getStoredUser();
      if (!user) {
        window.showToast("사용자 정보가 없습니다.", 3000, "error");
        return;
      }*/

    // 계정 목록 로드
    await loadAccountList();

    // 이벤트 리스너 추가
    initEventListeners();
}

// 계정 목록 로드
async function loadAccountList() {
    try {
        const adminInfo = await getUserData();

        if (!adminInfo) {
            window.showToast("사용자 정보를 가져올 수 없습니다.", 3000, "error");
            return;
        }

        let users = [];

        // 🔹 1) 관리자(1,2) → 전체 유저 조회
        if (adminInfo.grade <= 2) {
            const response = await apiGet("/model_user_setting?func=get-users");
            const data = await response.json();
            users = data.users ?? [];
        }

        // 🔹 2) 프랜차이즈(3) → 프랜차이즈 소속 매장만 조회
        else if (adminInfo.grade === 3) {
            const fid = adminInfo.franchiseId;

            if (!fid) {
                window.showToast("프랜차이즈 정보가 없습니다.", 3000, "error");
                return;
            }

            const response = await apiGet(
                `/model_admin_franchise?func=list-stores-summary&franchiseId=${fid}`
            );
            const data = await response.json();

            // list-stores-summary 응답: { franchiseId, monthTotal, stores:[{adminId,userId,...}] }
            users = data.stores ?? [];
        } else {
            window.showToast("해당 기능을 사용할 권한이 없습니다.", 3000, "warning");
            return;
        }

        populateAccountSelects(users);

    } catch (error) {
        console.error("계정 목록 로드 실패:", error);
        window.showToast("계정 목록을 불러오는데 실패했습니다.", 3000, "error");
    }
}

// 계정 선택 옵션 생성
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
            const storeName = user.storeName || "";
            option.value = user.userId;
            
            if (storeName) {
                option.textContent = `${user.userId}/${user.storeName}`;
            } else {
                option.textContent = `${user.userId}`;
            }
            sourceSelect.appendChild(option);
        });

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

function initEventListeners() {
    const sourceSelect = document.getElementById("sourceAccount");
    if (sourceSelect) {
        sourceSelect.addEventListener("change", async (e: Event) => {
            const target = e.target as HTMLSelectElement;
            selectedSourceAccount = target.value;
            console.log("보낼 계정 선택:", selectedSourceAccount);
            if (target.value) {
                await loadMenuList(target.value);
            }
        });
    }

    const targetSelect = document.getElementById("targetAccount");
    if (targetSelect) {
        targetSelect.addEventListener("change", (e: Event) => {
            const target = e.target as HTMLSelectElement;
            selectedTargetAccount = target.value;
            console.log("받을 계정 선택:", selectedTargetAccount);
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

    // 개별 체크박스 이벤트 리스너 추가
    document.addEventListener("change", (e) => {
        if ((e.target as HTMLElement).classList.contains("menu-checkbox")) {
            updateSelectAllCheckbox();
        }
    });

    // 복사하기 버튼 이벤트 리스너 추가
    const copyButton = document.getElementById("copyButton");
    if (copyButton) {
        copyButton.addEventListener("click", handleCopyMenus);
    }
}

// 메뉴 목록 로드
async function loadMenuList(userId: string) {
    try {
        const response = await apiGet(
            `/model_admin_menu?userId=${userId}&func=get-all-menu`
        );
        const data = await response.json();

        if (data.items && Array.isArray(data.items)) {
            allMenuItems = data.items as MenuItem[];
            renderMenuTable(allMenuItems);
        } else {
            console.error("메뉴 목록을 가져올 수 없습니다.");
            window.showToast("메뉴 목록을 불러오는데 실패했습니다.", 3000, "error");
            allMenuItems = []; // 빈 배열로 초기화
            displayMenuList([]);
        }
    } catch (error) {
        console.error("메뉴 목록 로드 실패:", error);
        window.showToast("메뉴 목록을 불러오는데 실패했습니다.", 3000, "error");
        allMenuItems = [];
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
        <td colspan="5" class="h-14 text-center flex justify-center items-center">
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
          <td>${index + 1}</td> 
          <td style="text-align: center;">
            <img src="${imageUrl}" alt="${
                item.name
            }" style="width:36px;height:46px; object-fit:cover;display: inline-block;" />
          </td>
          <td>${item.name}</td>
          <td>${Number(item.price).toLocaleString()}원</td>
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

// 헤더 체크박스 상태 업데이트 함수 추가
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById(
        "selectAll"
    ) as HTMLInputElement;
    const menuCheckboxes = document.querySelectorAll(
        ".menu-checkbox"
    ) as NodeListOf<HTMLInputElement>;

    if (selectAllCheckbox && menuCheckboxes.length > 0) {
        const checkedCount = Array.from(menuCheckboxes).filter(
            (checkbox) => checkbox.checked
        ).length;

        if (checkedCount === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (checkedCount === menuCheckboxes.length) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    }
}

// 메뉴 복사 처리 함수
async function handleCopyMenus() {
    if (!selectedSourceAccount || !selectedTargetAccount) {
        window.showToast(
            "보낼 계정과 받을 계정을 모두 선택해주세요.",
            3000,
            "warning"
        );
        return;
    }

    // 선택된 메뉴 확인
    const selectedCheckboxes = document.querySelectorAll(
        ".menu-checkbox:checked"
    ) as NodeListOf<HTMLInputElement>;

    if (selectedCheckboxes.length === 0) {
        window.showToast("복사할 메뉴를 선택해주세요.", 3000, "warning");
        return;
    }

    const selectedMenuIds = Array.from(selectedCheckboxes).map((checkbox) =>
        parseInt(checkbox.value)
    );

    const currentUser = getStoredUser();
    const isExistingAccount =
        currentUser && selectedTargetAccount === currentUser.userId;

    const requestBody = {
        sourceUserId: selectedSourceAccount,
        targetUserId: selectedTargetAccount,
        menuIds: selectedMenuIds,
        renameImageWithNewMenuId: isExistingAccount,
    };

    console.log("복사 요청 데이터:", requestBody);

    if (
        confirm(`선택된 ${selectedMenuIds.length}개의 메뉴를 복사하시겠습니까?`)
    ) {
        try {
            const response = await apiPost(
                "/model_admin_menu?func=duplicate-selected",
                requestBody
            );

            if (response.ok) {
                window.showToast("메뉴 복사가 완료되었습니다.", 3000, "success");

                selectedCheckboxes.forEach((checkbox) => (checkbox.checked = false));
                updateSelectAllCheckbox();
            } else {
                const errorData = await response.json();
                window.showToast(
                    `메뉴 복사 실패: ${errorData.message || "알 수 없는 오류"}`,
                    3000,
                    "error"
                );
            }
        } catch (error) {
            console.error("메뉴 복사 중 오류:", error);
            window.showToast("메뉴 복사 중 오류가 발생했습니다.", 3000, "error");
        }
    }
}
