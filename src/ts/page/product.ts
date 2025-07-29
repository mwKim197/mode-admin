import {getStoredUser} from "../utils/userStorage.ts";
import {apiGet, apiPost} from "../api/apiHelpers.ts";
import {MenuItem} from "../types/product.ts";

const changeList: { menuId: number; empty?: string; delete?: boolean }[] = [];
let allMenuItems: MenuItem[] = [];

export function initProduct() {
    // localstorage에 저장된 user 정보를 불러옴
    const user = getStoredUser();

    if (!user) {
        window.showToast(`❌ 사용자 정보가 없습니다.`, 3000, "error");
        return;
    }

  initSearchFunction();

  async function fetchMenuList() {
    const res = await apiGet(
      `/model_admin_menu?userId=${user?.userId}&func=get-all-menu`
    );
    const data = await res.json();

        return data.items as MenuItem[];
    }

  async function init() {
    try {
      const menuItems = await fetchMenuList();
      allMenuItems = menuItems;
      renderMenuTable(menuItems);
      changeList.length = 0;
    } catch (err) {
      console.error("❌ 메뉴 목록 불러오기 실패", err);
    }
  }

  // ✅ 검색 기능 초기화 함수 수정
  function initSearchFunction() {
    const searchInput = document.getElementById(
      "searchProduct"
    ) as HTMLInputElement;
    const searchButton = document.getElementById("searchButton");
    const resetButton = document.getElementById("searchReset");

    if (searchButton) {
      searchButton.addEventListener("click", function () {
        const searchTerm = searchInput?.value.trim() || "";
        if (!searchTerm) {
          return;
        }
        searchProducts(searchTerm);
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        // 검색어 초기화
        if (searchInput) {
          searchInput.value = "";
        }
        // 전체 상품 데이터 다시 로드
        renderMenuTable(allMenuItems);
      });
    }

    // Enter 키로 검색
    if (searchInput) {
      searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          const searchTerm = searchInput.value.trim();
          searchProducts(searchTerm);
        }
      });
    }
  }

  function searchProducts(searchTerm: string) {
    let filtered;

    if (searchTerm.length > 0) {
      filtered = allMenuItems.filter((item) =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      filtered = allMenuItems;
    }

    renderMenuTable(filtered);

    if (filtered.length === 0) {
      window.showToast(
        `"${searchTerm}"에 대한 검색 결과가 없습니다.`,
        3000,
        "warning"
      );
    }
  }

  function renderMenuTable(items: MenuItem[]) {
    const tbody = document.getElementById("menu-table-body");
    if (!tbody) return;

    tbody.innerHTML = items
      .map((item) => {
        const imageFile = item.image?.split("\\").pop() ?? "";
        const encodedFile = encodeURIComponent(imageFile);
        const imageUrl = `https://model-narrow-road.s3.ap-northeast-2.amazonaws.com/model/${item.userId}/${encodedFile}`;

        return `
      <tr>
        <td >${item.no}</td>
        <td style="text-align: center;"><img src="${imageUrl}" alt="상품 이미지" style="width:36px;height:46px; object-fit:cover;display: inline-block;"></td>
        <td class="product-name" onclick="window.location.href='./product-detail.html?menuId=${
          item.menuId
        }'">
          ${item.name}
        </td>
        <td>${Number(item.price).toLocaleString()}</td>
        <td>
          <label class="toggle-switch">
            <input
              type="checkbox"
              ${item.empty === "no" ? "checked" : ""}
              onchange="onToggleChange(${item.menuId}, this.checked)">
            <span class="slider"></span>
          </label>
        </td>
        <td>
          ${
            item.cupYn === "yes"
              ? '<span class="tag gray disabled">제조</span>'
              : `<span class="tag blue" data-menu='${encodeURIComponent(
                  JSON.stringify(item)
                )}' onclick="onAdminOder(this)">제조</span>`
          }
          <span class="tag red" onclick="onDeleteClick(${
            item.menuId
          }, event)">삭제</span>
        </td>
      </tr>
    `;
      })
      .join("");
  }

  // ✅ 페이지 로드 시 초기화
  init();
}

const saveBtn = document.getElementById("saveBtn") as HTMLInputElement;

if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    if (changeList.length === 0) {
      window.showToast(`변경된 내용이 없습니다.`, 3000, "warning");
      return;
    }

    if (confirm("수정사항을 저장하시겠습니까?")) {
      saveChanges().catch(() => {
        window.showToast(`❌ 수정에 실패했습니다.`, 3000, "error");
      });
    }
  });
}

// 토글 버튼
function onToggleChange(menuId: number, isChecked: boolean) {
  const emptyValue = isChecked ? "no" : "yes";
  updateChangeList(menuId, { empty: emptyValue });
}

// 삭제 버튼
function onDeleteClick(menuId: number, event: any) {
  updateChangeList(menuId, { delete: true });
  const row = event.target.closest("tr");
  if (row) row.classList.add("tr-disabled");
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
          count: 1, // ✅ 주문 개수로 사용
        },
      ],
    },
  };
}

// 수정 목록 업데이트
function updateChangeList(
  menuId: number,
  updates: { empty?: string; delete?: boolean }
) {
  const index = changeList.findIndex((item) => item.menuId === menuId);
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
        items: changeList,
    };

    try {
        const res = await apiPost(
            `/model_admin_menu?func=bulk-update-or-delete`,
            body
        );

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
        ...(func === "order" ? {orderData: data.orderData} : {}),
        ...(func === "drink" ? {orderData: {recipe: data}} : {}),
        ...(func === "ice"
            ? {
                orderData: {
                    recipe: {
                        iceTime: data.iceTime,
                        waterTime: data.waterTime,
                        name: data.name,
                    },
                },
            }
            : {}),
    };

    // ✅ 요청만 보내고 응답 기다리지 않음
    apiPost("/model_machine_controll", payload)
        .then(() => {
            window.showToast(`${func} 명령 전송 완료`);
        })
        .catch((err) => {
            console.error(`❌ ${func} 명령 전송 실패:`, err);
            window.showToast(`❌ ${func} 명령 전송 실패: ${err} `, 3000, "error");
        });

    // ✅ 바로 UI 알림
    window.showToast(`${func} 명령 전송`);
}

// 맨 아래에 추가하세요
(window as any).onToggleChange = onToggleChange;
(window as any).onDeleteClick = onDeleteClick;
(window as any).onAdminOder = onAdminOder;

// 선택된 아이템 저장용 전역 변수 - menu로 변경
let menu: any = null;

// 어드민 주문 - 팝업 열기로 변경
function onAdminOder(el: HTMLElement) {
    const itemStr = decodeURIComponent(el.dataset.menu || "{}");
    const item = JSON.parse(itemStr);
    menu = item; // menu로 통일

    // 팝업 열기
    const popup = document.getElementById("adminActionPopup");
    if (popup) {
        popup.style.display = "block";
    }
}

// 팝업 닫기 공통 함수
function closeAdminPopup() {
    const popup = document.getElementById("adminActionPopup");
    if (popup) {
        popup.style.display = "none";
    }
}

// 전체주문
const btnPopupTotalOrder = document.getElementById("btnPopupTotalOrder");
if (btnPopupTotalOrder) {
    btnPopupTotalOrder.addEventListener("click", () => {
        if (menu) {
            if (!confirm("원격 명령을 전송하시겠습니까?")) {
                return;
            }
            const data = transformToOrderData(menu);
            sendMachineCommand("order", data);
            closeAdminPopup(); // 공통 함수 호출
        }
    });
}

// 컵 배출
const btnCupDispense = document.getElementById("btnCupDispense");
if (btnCupDispense) {
    btnCupDispense.addEventListener("click", () => {
        if (menu) {
            const cupType = menu.cup;
            if (cupType === "plastic") {
                if (confirm("원격 명령을 전송하시겠습니까?")) {
                    sendMachineCommand("pl");
                    closeAdminPopup(); // 공통 함수 호출
                }
            } else if (cupType === "paper") {
                if (confirm("원격 명령을 전송하시겠습니까?")) {
                    sendMachineCommand("pa");
                    closeAdminPopup(); // 공통 함수 호출
                }
            }
        }
    });
}

// 얼음/물 배출
const btnIceWaterDispense = document.getElementById("btnIceWaterDispense");
if (btnIceWaterDispense) {
    btnIceWaterDispense.addEventListener("click", () => {
        if (menu) {
            if (confirm("원격 명령을 전송하시겠습니까?")) {
                sendMachineCommand("ice", menu);
                closeAdminPopup(); // 공통 함수 호출
            }
        }
    });
}

// 음료 투출
const btnPopupDrinkOrder = document.getElementById("btnPopupDrinkOrder");
if (btnPopupDrinkOrder) {
    btnPopupDrinkOrder.addEventListener("click", () => {
        if (confirm("원격 명령을 전송하시겠습니까?")) {
            if (menu) {
                sendMachineCommand("drink", menu);
                closeAdminPopup(); // 공통 함수 호출
            }
        }
    });
}

// 팝업 바깥 클릭 시 닫기
const popup = document.getElementById("adminActionPopup");
if (popup) {
    popup.addEventListener("click", (e) => {
        if (e.target === popup) {
            popup.style.display = "none";
        }
    });
}

(window as any).closeAdminPopup = closeAdminPopup;
