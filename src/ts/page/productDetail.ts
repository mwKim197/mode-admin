// productDetail.ts
import { renderProductForm } from "../form/renderProductForm.ts";
import { getStoredUser } from "../utils/userStorage.ts";
import { apiGet, apiPost, apiPut } from "../api/apiHelpers.ts";
import { MenuDetail, MenuItemIngredient, MenuState } from "../types/product.ts";
import { handleImageUpload } from "../utils/imageUploader.ts";
import {
  validateMenuDetail,
  validateMenuItemsByType,
} from "../utils/validation.ts";

// 이미지 파일정보
let uploadedImageBase64: string;
let uploadedFileName: string;

export async function initProductDetail() {
  const menuId = getParamId("menuId");
  if (!menuId) return;

  const user = getStoredUser();

  if (!user) {
    window.showToast("사용자 정보가 없습니다.", 3000, "warning");
    return;
  }

  const menuRes = await apiGet(
    `/model_admin_menu?userId=${user.userId}&menuId=${menuId}&func=get-menu-by-id`
  );
  const menu = await menuRes.json();

  await renderProductForm(menu); // 수정용 렌더링

  const logoUpload = document.getElementById("logoUpload") as HTMLInputElement;

  logoUpload.addEventListener("change", async (e) => {
    await setImage(e);
  });

  // 저장버튼
  const saveBtn = document.getElementById("saveDtlBtn") as HTMLInputElement;

  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const updatedPayload = collectMenuDetail(user.userId);

      const validateChk = validateMenuDetail(updatedPayload);

      if (validateChk) {
        window.showToast(validateChk, 3000, "warning");
        return;
      }

      const itemsValidate = validateMenuItemsByType(updatedPayload);

      if (itemsValidate) {
        window.showToast(itemsValidate, 3000, "warning");
        return;
      }

      // 이미지 추가의 경우
      const payload = {
        ...updatedPayload,
        ...(uploadedImageBase64 &&
          uploadedFileName && {
            originalFileName: uploadedFileName,
            imageBase64: uploadedImageBase64,
          }),
      };

      if (confirm("수정사항을 저장하시겠습니까?")) {
        const putData = {
          userId: user.userId,
          updatedData: payload,
        };
        try {
          const res = await apiPut(
            `/model_admin_menu?func=put-update-menu`,
            putData
          );

          if (!res.ok) {
            window.showToast(`수정사항 저장에 실패하였습니다.`, 3000, "error");
            return;
          } else {
            window.showToast(`수정사항 저장완료.`);
            // 저장 성공 후 product 페이지로 이동
            setTimeout(() => {
              window.location.href = "/html/product.html";
            }, 1000);
          }
        } catch (e) {}
      }
    });
  }

  // 플라스틱 컵 배출
  const btnPlastic = document.getElementById("btnPlasticCup");
  if (btnPlastic) {
    btnPlastic.addEventListener("click", () => {
      if (confirm("플라스틱 컵을 배출하시겠습니까?")) {
        sendMachineCommand("pl");
      }
    });
  }

  // 종이컵 배출
  const btnPaper = document.getElementById("btnPaperCup");
  if (btnPaper) {
    btnPaper.addEventListener("click", () => {
      if (confirm("종이컵을 배출하시겠습니까?")) {
        sendMachineCommand("pa");
      }
    });
  }

  // 음료 투출
  const btnDrink = document.getElementById("btnDrinkOrder");
  if (btnDrink) {
    btnDrink.addEventListener("click", () => {
      if (confirm("현재 설정으로 음료를 투출하시겠습니까?")) {
        sendMachineCommand("drink", menu);
      }
    });
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
    ...(func === "order" ? { orderData: { recipe: data } } : {}),
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

// ✅ URL 파라미터 추출
function getParamId(key: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

// 이미지 설정
async function setImage(e: any) {
  const input = e.target as HTMLInputElement;
  const preview = document.getElementById("logoPreview") as HTMLImageElement;
  const fileNameEl = document.getElementById("fileName");

  if (!fileNameEl) {
    window.showToast(`에러발생`, 3000, "error");
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
    window.showToast(`이미지 업로드 실패: ${err}`, 3000, "warning");
    console.warn("이미지 업로드 실패:", err);
  }
}

// 저장 데이터
function collectMenuDetail(userId: string): MenuDetail {
  const menuId = Number(getParamId("menuId") || "0"); // 또는 기존값 사용
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
