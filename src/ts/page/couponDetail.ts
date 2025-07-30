import { apiGet, apiPost } from "../api/apiHelpers.ts";
import { getStoredUser } from "../utils/userStorage.ts";
// ❌ 바코드 import 제거
// import { renderBarcodeToCanvas } from "../utils/barcode.ts";

export function initCouponDetail() {
  console.log("쿠폰 발행 페이지 초기화");

  // ❌ 바코드 생성 함수 호출 제거
  // getBarcode();

  // API에서 사용자 정보 가져와서 가맹점/지점에 넣기
  loadUserData();

  // 목록으로 버튼 클릭 시 couponList 페이지로 이동
  const backToListBtn = document.getElementById("back-to-list");

  if (backToListBtn) {
    backToListBtn.addEventListener("click", function () {
      window.location.href = "/html/couponList.html";
    });
  }

  // 폼 제출 이벤트
  const couponForm = document.getElementById("coupon-form") as HTMLFormElement;

  if (couponForm) {
    couponForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // 필드 값 가져오기
      const franchise = (
        document.getElementById("franchise-input") as HTMLInputElement
      )?.value.trim();
      const store = (
        document.getElementById("store-input") as HTMLInputElement
      )?.value.trim();
      const device = (
        document.getElementById("device-input") as HTMLInputElement
      )?.value.trim();
      const startDate = (
        document.getElementById("start-date") as HTMLInputElement
      )?.value.trim();
      const endDate = (
        document.getElementById("end-date") as HTMLInputElement
      )?.value.trim();
      const issueCount = (
        document.getElementById("issue-count") as HTMLInputElement
      )?.value.trim();
      const coupon = (
        document.getElementById("sample") as HTMLSelectElement
      )?.value.trim();
      /*const memo = (
        document.getElementById("myTextarea") as HTMLTextAreaElement
      )?.value.trim();*/

      // 유효성 검사
      if (!franchise) {
        window.showToast("가맹점을 입력해 주세요", 2000, "warning");
        return;
      }
      if (!store) {
        window.showToast("지점을 입력해 주세요", 2000, "warning");
        return;
      }
      if (!device) {
        window.showToast("기기번호를 입력해 주세요", 2000, "warning");
        return;
      }
      if (!startDate) {
        window.showToast("사용기한(시작일)을 입력해 주세요", 2000, "warning");
        return;
      }
      if (!endDate) {
        window.showToast("사용기한(종료일)을 입력해 주세요", 2000, "warning");
        return;
      }
      if (!issueCount) {
        window.showToast("발행매수를 입력해 주세요", 2000, "warning");
        return;
      }
      if (!coupon) {
        window.showToast("쿠폰을 선택해 주세요", 2000, "warning");
        return;
      }

      // ✅ 발행매수 유효성 검사 추가
      const issueCountNum = parseInt(issueCount);
      if (isNaN(issueCountNum) || issueCountNum < 1 || issueCountNum > 99) {
        window.showToast(
          "발행매수는 1~99개 사이로 입력해주세요",
          2000,
          "warning"
        );
        return;
      }

      // ✅ 날짜 범위 유효성 검사 추가
      if (!validateDateRange(startDate, endDate)) {
        return;
      }

      // 선택된 쿠폰의 이름 가져오기
      const selectElement = document.getElementById(
        "sample"
      ) as HTMLSelectElement;
      const selectedOption =
        selectElement?.options[selectElement.selectedIndex];
      const selectedMenuName = selectedOption?.textContent || "";

      // ✅ 확인창 표시
      const confirmMessage = "쿠폰을 발행하시겠습니까?";

      if (!confirm(confirmMessage)) {
        return; // 사용자가 취소를 선택한 경우
      }

      try {
        const user = getStoredUser();
        if (!user) {
          window.showToast("사용자 정보가 없습니다.", 2000, "error");
          return;
        }

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < issueCountNum; i++) {
          try {
            const payload = {
              userId: user.userId,
              title: `${selectedMenuName} 무료`,
              menuId: coupon,
              count: 1,
              startsAt: startDate,
              expiresAt: endDate,
            };

            // 쿠폰 발급 API 호출
            const response = await apiPost(
              "/model_coupon?func=setCoupon",
              payload
            );

            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
              const errorData = await response.json();
              console.error(
                `쿠폰 발급 실패 (${i + 1}/${issueCountNum}):`,
                errorData.message
              );
            }
          } catch (error) {
            errorCount++;
            console.error(
              `쿠폰 발급 중 오류 발생 (${i + 1}/${issueCountNum}):`,
              error
            );
          }
        }

        // 결과 메시지 표시
        if (successCount === issueCountNum) {
          window.showToast("쿠폰 발행이 완료되었습니다.", 3000, "success");
        } else if (successCount > 0) {
          window.showToast(
            `${successCount}개 발급 성공, ${errorCount}개 발급 실패`,
            3000,
            "warning"
          );
        } else {
          window.showToast("쿠폰 발급에 실패했습니다.", 3000, "error");
          return;
        }

        // 성공 시 목록 페이지로 이동
        setTimeout(() => {
          window.location.href = "/html/couponList.html";
        }, 1000);
      } catch (error) {
        window.showToast("쿠폰 발급 중 오류가 발생했습니다.", 3000, "error");
      }
    });
  }
}

function validateDateRange(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) {
    window.showToast("시작일과 종료일을 모두 선택해주세요.", 3000, "warning");
    return false;
  }

  if (startDate > endDate) {
    window.showToast("시작일은 종료일보다 클 수 없습니다.", 3000, "error");
    return false;
  }

  return true;
}

async function loadUserData() {
  try {
    const user = getStoredUser();
    if (!user) return;

    const response = await apiGet(
      `/model_user_setting?func=get-user&userId=${user.userId}`
    );
    const data = await response.json();

    const storeName = data.user.storeName;

    // 가맹점과 지점에 storeName 값 설정
    const franchiseInput = document.getElementById(
      "franchise-input"
    ) as HTMLInputElement;
    const storeInput = document.getElementById(
      "store-input"
    ) as HTMLInputElement;
    const deviceInput = document.getElementById(
      "device-input"
    ) as HTMLInputElement;

    if (franchiseInput) franchiseInput.value = storeName;
    if (storeInput) storeInput.value = storeName;
    if (deviceInput) deviceInput.value = user.userId;

    await sampleSelect(user.userId);
  } catch (error) {
    console.error("사용자 데이터 로드 실패:", error);
  }
}

async function sampleSelect(userId: string) {
  try {
    const response = await apiGet(
      `/model_admin_menu?userId=${userId}&func=get-all-menu`
    );
    const data = await response.json();

    const selectElement = document.getElementById(
      "sample"
    ) as HTMLSelectElement;

    if (selectElement && data.items) {
      selectElement.innerHTML = '<option value="">쿠폰을 선택해주세요</option>';

      data.items.forEach((item: any) => {
        if (!item.menuId || !item.name) return;
        const option = document.createElement("option");
        option.value = item.menuId;
        option.textContent = item.name;
        selectElement.appendChild(option);
      });

      new window.Choices(selectElement, {
        shouldSort: false,
        searchEnabled: false,
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
  } catch (error) {
    console.error("메뉴 데이터 로드 실패:", error);
  }
}
