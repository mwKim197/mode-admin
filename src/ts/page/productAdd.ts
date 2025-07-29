// productAdd.ts
import { renderProductForm } from "../form/renderProductForm.ts";
import { getStoredUser } from "../utils/userStorage.ts";
import { apiPost } from "../api/apiHelpers.ts";
import { MenuDetail, MenuItemIngredient, MenuState } from "../types/product.ts";
import { handleImageUpload } from "../utils/imageUploader.ts";
import {
  validateMenuDetail,
  validateMenuItemsByType,
} from "../utils/validation.ts";

// 이미지 파일정보
let uploadedImageBase64: string;
let uploadedFileName: string;

export async function initProductAdd() {
  
  const backBox = document.querySelector('.back-box') as HTMLElement;
  if (backBox) {
    backBox.style.display = 'flex';
  }

  const user = getStoredUser();

  if (!user) {
    window.showToast("사용자 정보가 없습니다.", 3000, "error");
    return;
  }

  // 빈 폼 렌더링 (기존 데이터 없이)
  await renderProductForm(null);

  const logoUpload = document.getElementById("logoUpload") as HTMLInputElement;
  logoUpload.addEventListener("change", async (e) => {
    await setImage(e);
  });

  // 저장버튼
  const saveBtn = document.getElementById("saveDtlBtn") as HTMLInputElement;

  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const payload = collectMenuDetail(user.userId);

      if (!uploadedImageBase64 || !uploadedFileName) {
        window.showToast("이미지 등록은 필수입니다.", 3000, "warning");
        return;
      }

      const validateChk = validateMenuDetail(payload);

      if (validateChk) {
        window.showToast(validateChk, 3000, "warning");
        return;
      }

      const itemsValidate = validateMenuItemsByType(payload);

      if (itemsValidate) {
        window.showToast(itemsValidate, 3000, "warning");
        return;
      }

      if (confirm("신규 메뉴를 등록하시겠습니까?")) {
        const postData = {
          userId: user.userId,
          data: payload,
          ...(uploadedImageBase64 &&
            uploadedFileName && {
              originalFileName: uploadedFileName,
              imageBase64: uploadedImageBase64,
            }),
        };

        try {
          const res = await apiPost(
            `/model_admin_menu?func=set-new-menu`,
            postData
          );

          if (!res.ok) {
            window.showToast("신규 메뉴 등록에 실패하였습니다.", 3000, "error");
            return;
          }
          window.showToast("신규 메뉴가 등록되었습니다.");
          setTimeout(() => {
            window.location.href = "/html/product.html";
          }, 1000);
        } catch (err) {
          console.error("등록 중 오류 발생:", err);
          window.showToast("오류가 발생했습니다.", 3000, "error");
        }
      }
    });

    // 얼음 Yes/No 선택에 따른 시간 입력 박스 표시/숨김
    //const iceRadios = document.querySelectorAll('input[name="iceYn"]');
    const timeInputBox = document.getElementById(
      "ice-water-time-box"
    ) as HTMLElement;

    function toggleTimeInputs() {
      const selectedValue = (
        document.querySelector(
          'input[name="iceYn"]:checked'
        ) as HTMLInputElement
      )?.value;

      if (timeInputBox) {
        timeInputBox.style.display = selectedValue === "no" ? "none" : "block";
      }
    }

    // 라디오 버튼 변경 시 이벤트 리스너
    /*iceRadios.forEach((radio) => {
      radio.addEventListener("change", toggleTimeInputs);
    });
*/
    // 페이지 로드 시 초기 상태 설정
    toggleTimeInputs();

    // 일반상품/음료상품 선택에 따른 관련 요소들 표시/숨김
    const cupRadios = document.querySelectorAll('input[name="cupYn"]');
    const itemsContainer = document.getElementById(
      "items-container"
    ) as HTMLElement;
    const cupIceSelectionBox = document.getElementById(
      "cup-ice-selection-box"
    ) as HTMLElement;
    const iceWaterTimeBox = document.getElementById(
      "ice-water-time-box"
    ) as HTMLElement;

    function toggleDrinkRelatedElements() {
      const selectedValue = (
        document.querySelector(
          'input[name="cupYn"]:checked'
        ) as HTMLInputElement
      )?.value;

      const shouldHide = selectedValue === "yes"; // 일반상품일 때 숨김

      if (itemsContainer) {
        itemsContainer.style.display = shouldHide ? "none" : "block";
      }
      if (cupIceSelectionBox) {
        cupIceSelectionBox.style.display = shouldHide ? "none" : "block";
      }
      if (iceWaterTimeBox) {
        iceWaterTimeBox.style.display = shouldHide ? "none" : "block";
      }
    }

    // 라디오 버튼 변경 시 이벤트 리스너
    cupRadios.forEach((radio) => {
      radio.addEventListener("change", toggleDrinkRelatedElements);
    });

    // 페이지 로드 시 초기 상태 설정
    toggleDrinkRelatedElements();
  }
}

async function setImage(e: any) {
  const input = e.target as HTMLInputElement;
  const preview = document.getElementById("logoPreview") as HTMLImageElement;
  const fileNameEl = document.getElementById("fileName");

  if (!fileNameEl) {
    window.showToast("에러발생", 3000, "error");
    return;
  }

  try {
    const { base64, fileName } = await handleImageUpload(
      input,
      preview,
      fileNameEl
    );
    uploadedImageBase64 = base64;
    uploadedFileName = fileName;
  } catch (err) {
    window.showToast("이미지 업로드 실패", 3000, "error");
    console.warn("이미지 업로드 실패:", err);
  }
}

// 📌 기존 collectMenuDetail 복사 사용
function collectMenuDetail(userId: string): MenuDetail {
  const menuId = 0; // 신규 등록 시 0 또는 undefined
  const no = Number(
    (document.getElementById("menu-no") as HTMLInputElement).value
  );
  const name = (document.getElementById("menu-name") as HTMLInputElement).value;
  const price = (
    document.getElementById("menu-price") as HTMLInputElement
  ).value.trim();
  const category = (
    document.getElementById("menu-category") as HTMLSelectElement
  ).value;
  const cupYn =
    (document.querySelector('input[name="cupYn"]:checked') as HTMLInputElement)
      ?.value || "no";
  const cup =
    (document.querySelector('input[name="cup"]:checked') as HTMLInputElement)
      ?.value || "";
  const iceYn =
    (document.querySelector('input[name="iceYn"]:checked') as HTMLInputElement)
      ?.value || "";
  const empty =
    (document.querySelector('input[name="empty"]:checked') as HTMLInputElement)
      ?.value || "";
  const iceTime = (
    document.getElementById("ice-time") as HTMLInputElement
  ).value.trim();
  const waterTime = (
    document.getElementById("water-time") as HTMLInputElement
  ).value.trim();

  const image = ""; // 이미지 경로는 별도 처리

  const state: MenuState = {
    best: (document.getElementById("state-best") as HTMLSelectElement).value,
    event: (document.getElementById("state-event") as HTMLSelectElement).value,
    new: (document.getElementById("state-new") as HTMLSelectElement).value,
  };

  const items: MenuItemIngredient[] = Array.from(
    document.querySelectorAll(".item")
  ).map((itemEl, index) => {
    const type =
      (itemEl.querySelector(".item-type-select") as HTMLSelectElement)?.value ||
      "";
    const inputs = itemEl.querySelectorAll("input");

    const value1 = String(
      parseFloat((inputs[0] as HTMLInputElement)?.value || "0")
    );
    const value2 = String(
      parseFloat((inputs[1] as HTMLInputElement)?.value || "0")
    );
    const value3 = String(
      parseFloat((inputs[2] as HTMLInputElement)?.value || "0")
    );

    const value4 =
      type === "garucha"
        ? "0"
        : String(parseFloat((inputs[3] as HTMLInputElement)?.value || "0"));

    return {
      no: String(index + 1),
      type,
      value1,
      value2,
      value3,
      value4,
    };
  });

  return {
    userId,
    menuId,
    no,
    name,
    price,
    category,
    cupYn,
    cup,
    empty,
    iceYn,
    iceTime,
    waterTime,
    image,
    state,
    items,
  };
}

