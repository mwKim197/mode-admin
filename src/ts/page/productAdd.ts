// productAdd.ts
import { renderProductForm } from "../form/renderProductForm.ts";
import { getStoredUser } from "../utils/userStorage.ts";
import { apiPost } from "../api/apiHelpers.ts";
import { MenuDetail, MenuItemIngredient, MenuState } from "../types/product.ts";
import { handleImageUpload } from "../utils/imageUploader.ts";

// 이미지 파일정보
let uploadedImageBase64: string;
let uploadedFileName: string;

export async function initProductAdd() {
  const user = getStoredUser();

  if (!user) {
    alert("사용자 정보가 없습니다.");
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
      const newMenuData = collectMenuDetail(user.userId);

      const payload = {
        ...newMenuData,
        ...(uploadedImageBase64 && uploadedFileName && {
          originalFileName: uploadedFileName,
          imageBase64: uploadedImageBase64
        })
      };

      if (confirm("신규 메뉴를 등록하시겠습니까?")) {
        const postData = {
          userId: user.userId,
          data: payload
        };
        console.log("postData: ", postData);

        try {
          const res = await apiPost(`/model_admin_menu?func=set-new-menu`, postData);

          if (!res.ok) {
            alert("신규 메뉴 등록에 실패하였습니다.");
            return;
          }

          alert("신규 메뉴가 등록되었습니다.");
        } catch (err) {
          console.error("등록 중 오류 발생:", err);
          alert("오류가 발생했습니다.");
        }
      }
    });
  }
}

async function setImage(e: any) {
  const input = e.target as HTMLInputElement;
  const preview = document.getElementById("logoPreview") as HTMLImageElement;
  const fileNameEl = document.getElementById("fileName");

  if (!fileNameEl) {
    alert("에러발생");
    return;
  }

  try {
    const { base64, fileName } = await handleImageUpload(input, preview, fileNameEl);
    uploadedImageBase64 = base64;
    uploadedFileName = fileName;
  } catch (err) {
    console.warn("이미지 업로드 실패:", err);
  }
}

// 📌 기존 collectMenuDetail 복사 사용
function collectMenuDetail(userId: string): MenuDetail {
  const menuId = 0; // 신규 등록 시 0 또는 undefined
  const no = Number((document.getElementById("menu-no") as HTMLInputElement).value);
  const name = (document.getElementById("menu-name") as HTMLInputElement).value;
  const price = (document.getElementById("menu-price") as HTMLInputElement).value;
  const category = (document.getElementById("menu-category") as HTMLSelectElement).value;
  const cupYn = (document.querySelector('input[name="cupYn"]:checked') as HTMLInputElement)?.value || "no";
  const cup = (document.querySelector('input[name="cup"]:checked') as HTMLInputElement)?.value || "";
  const iceYn = (document.querySelector('input[name="iceYn"]:checked') as HTMLInputElement)?.value || "";
  const empty = (document.querySelector('input[name="empty"]:checked') as HTMLInputElement)?.value || "";
  const iceTime = (document.getElementById("ice-time") as HTMLInputElement).value;
  const waterTime = (document.getElementById("water-time") as HTMLInputElement).value;

  const image = ""; // 이미지 경로는 별도 처리

  const state: MenuState = {
    best: (document.getElementById("state-best") as HTMLSelectElement).value,
    event: (document.getElementById("state-event") as HTMLSelectElement).value,
    new: (document.getElementById("state-new") as HTMLSelectElement).value
  };

  const items: MenuItemIngredient[] = Array.from(document.querySelectorAll(".item")).map((itemEl, index) => {
    const type = (itemEl.querySelector(".item-type-select") as HTMLSelectElement)?.value || "";
    const inputs = itemEl.querySelectorAll("input");

    const value1 = (inputs[0] as HTMLInputElement)?.value || "";
    const value2 = (inputs[1] as HTMLInputElement)?.value || "";
    const value3 = (inputs[2] as HTMLInputElement)?.value || "";

    const value4 = type === "garucha"
        ? "0"
        : (inputs[3] as HTMLInputElement)?.value || "";

    return {
      no: String(index + 1),
      type,
      value1,
      value2,
      value3,
      value4
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
    items
  };
}
