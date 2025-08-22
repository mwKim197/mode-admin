import { getStoredUser } from "../utils/userStorage.ts";
import { apiGet } from "../api/apiHelpers.ts";
import { createItemBlock } from "../components/ItemBlock.ts";

const logoPreview = document.getElementById("logoPreview") as HTMLImageElement;
const BASE_URL = "/img/"; // 예: "/img/new1.png"

// 상태별 업데이트 함수
function updateOverlay(
  selectEl: HTMLSelectElement,
  overlayEl: HTMLImageElement
) {
  const val = selectEl.value;
  if (val) {
    overlayEl.src = `${BASE_URL}${val}.png`;
    overlayEl.style.display = "block";
  } else {
    overlayEl.style.display = "none";
  }
}

function attachStateChangeHandler(
  stateEl: HTMLSelectElement,
  overlayEl: HTMLImageElement
) {
  stateEl.addEventListener("change", () => {
    const src = logoPreview?.src || "";
    const isImageSelected =
      src.startsWith("blob:") ||
      src.startsWith("data:") ||
      src.includes("s3.ap-northeast-2.amazonaws.com");

    if (!isImageSelected) {
      alert("이미지를 선택해주세요.");
      stateEl.value = ""; // 선택 초기화 (선택사항)
      return;
    }
    updateOverlay(stateEl, overlayEl);
  });
}

const stateNew = document.getElementById("state-new") as HTMLSelectElement;
const stateEvent = document.getElementById("state-event") as HTMLSelectElement;
const stateBest = document.getElementById("state-best") as HTMLSelectElement;

const overlayNew = document.getElementById("overlay-new") as HTMLImageElement;
const overlayEvent = document.getElementById(
  "overlay-event"
) as HTMLImageElement;
const overlayBest = document.getElementById("overlay-best") as HTMLImageElement;

// 핸들러 연결
attachStateChangeHandler(stateNew, overlayNew);
attachStateChangeHandler(stateEvent, overlayEvent);
attachStateChangeHandler(stateBest, overlayBest);

// ✅ 초기화 함수
export async function renderProductForm(menu?: any) {
  const user = getStoredUser();

  if (!user) {
    alert("사용자 정보가 없습니다.");
    return;
  }

  const userRes = await apiGet(
    `/model_user_setting?func=get-user&userId=${user.userId}`
  );
  const { user: userData } = await userRes.json();

  setCategoryOptions(userData.category);

  if (menu) {
    applyMenuData(menu); // 수정일 때만 데이터 채우기
  }
}

// ✅ 카테고리 select 옵션 렌더링
function setCategoryOptions(categories: { name: string; item: string }[]) {
  const select = document.getElementById("menu-category") as HTMLSelectElement;
  if (!select) return;

  select.innerHTML = `<option value="">선택</option>`;
  categories.forEach(({ name, item }) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = name;
    select.appendChild(option);
  });
}

// ✅ 메뉴 데이터 값 세팅
function applyMenuData(menu: any) {
  // 이미지
  const imageFile = menu.image?.split("\\").pop();
  const encodedFileName = encodeURIComponent(imageFile ?? "");
  const imageUrl = `https://model-narrow-road.s3.ap-northeast-2.amazonaws.com/model/${menu.userId}/${encodedFileName}`;
  const preview = document.getElementById("logoPreview") as HTMLImageElement;
  if (preview) {
    preview.src = imageUrl;
    preview.style.display = "block";
  }

  const fileName = document.getElementById("fileName");
  if (fileName) fileName.textContent = imageFile;

  // 기본 정보 입력
  (document.getElementById("menu-no") as HTMLInputElement).value = String(
    menu.no
  );
  (document.getElementById("menu-name") as HTMLInputElement).value = menu.name;
  (document.getElementById("menu-price") as HTMLInputElement).value =
    menu.price;
  (document.getElementById("ice-time") as HTMLInputElement).value =
    menu.iceTime;
  (document.getElementById("water-time") as HTMLInputElement).value =
    menu.waterTime;
  const barcodeInput = document.getElementById(
    "barcode-input"
  ) as HTMLInputElement;
  if (barcodeInput && menu.barcode) {
    barcodeInput.value = menu.barcode;
  }

  // 카테고리 설정
  const categorySelect = document.getElementById(
    "menu-category"
  ) as HTMLSelectElement;
  if (categorySelect) categorySelect.value = menu.category;

  // 컵
  document
    .querySelectorAll<HTMLInputElement>('input[name="cup"]')
    .forEach((radio) => (radio.checked = radio.value === menu.cup));

  // 얼음 여부
  document
    .querySelectorAll<HTMLInputElement>('input[name="iceYn"]')
    .forEach((radio) => (radio.checked = radio.value === menu.iceYn));

  // 일반상품 여부
  document
    .querySelectorAll<HTMLInputElement>('input[name="cupYn"]')
    .forEach((radio) => (radio.checked = radio.value === menu.cupYn));

  // 품절 여부
  document
    .querySelectorAll<HTMLInputElement>('input[name="empty"]')
    .forEach((radio) => (radio.checked = radio.value === menu.empty));

  // 상태
  (document.getElementById("state-new") as HTMLSelectElement).value =
    menu.state?.new || "";
  (document.getElementById("state-event") as HTMLSelectElement).value =
    menu.state?.event || "";
  (document.getElementById("state-best") as HTMLSelectElement).value =
    menu.state?.best || "";

  // ✅ 데이터 적용 후 상태 업데이트 함수들 호출
  setTimeout(() => {
    // toggleDrinkRelatedElements 함수 호출
    const event = new Event("change");
    const cupYnRadio = document.querySelector(
      'input[name="cupYn"]:checked'
    ) as HTMLInputElement;
    if (cupYnRadio) {
      cupYnRadio.dispatchEvent(event);
    }

    // toggleTimeInputs 함수 호출
    const iceYnRadio = document.querySelector(
      'input[name="iceYn"]:checked'
    ) as HTMLInputElement;
    if (iceYnRadio) {
      iceYnRadio.dispatchEvent(event);
    }
  }, 100);

  renderItems(menu.items);

  // ✅ 데이터 설정 후 필터링 실행
  requestAnimationFrame(() => {
    const timeInputBox = document.getElementById(
      "ice-water-time-box"
    ) as HTMLElement;
    const selectedValue = (
      document.querySelector('input[name="iceYn"]:checked') as HTMLInputElement
    )?.value;

    if (timeInputBox) {
      timeInputBox.style.display = selectedValue === "no" ? "none" : "block";
    }
  });
}

export function renderItems(items: any[]) {
  const container = document.getElementById("items-container")!;
  container.innerHTML = "";

  items.forEach((item, index) => {
    const block = createItemBlock(index, item);
    container.appendChild(block);
  });
}

// 새 항목 추가
document.getElementById("addItemBtn")?.addEventListener("click", () => {
  const container = document.getElementById("items-container")!;
  const index = container.children.length;
  const block = createItemBlock(index); // 빈 상태로 추가
  container.appendChild(block);
});
