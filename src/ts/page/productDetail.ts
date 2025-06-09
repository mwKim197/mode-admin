import { getStoredUser } from "../utils/userStorage.ts";
import { apiGet } from "../api/apiHelpers.ts";

const stateNew = document.getElementById("state-new") as HTMLSelectElement;
const stateEvent = document.getElementById("state-event") as HTMLSelectElement;
const stateBest = document.getElementById("state-best") as HTMLSelectElement;

const overlayNew = document.getElementById("overlay-new") as HTMLImageElement;
const overlayEvent = document.getElementById("overlay-event") as HTMLImageElement;
const overlayBest = document.getElementById("overlay-best") as HTMLImageElement;

const BASE_URL = "/img/"; // 예: "/img/new1.png"

// 상태별 업데이트 함수
function updateOverlay(selectEl: HTMLSelectElement, overlayEl: HTMLImageElement) {
  const val = selectEl.value;
  if (val) {
    overlayEl.src = `${BASE_URL}${val}.png`;
    overlayEl.style.display = "block";
  } else {
    overlayEl.style.display = "none";
  }
}

// 이벤트 바인딩
stateNew.addEventListener("change", () => updateOverlay(stateNew, overlayNew));
stateEvent.addEventListener("change", () => updateOverlay(stateEvent, overlayEvent));
stateBest.addEventListener("change", () => updateOverlay(stateBest, overlayBest));

// ✅ 초기화 함수
export async function initProductDetail() {
  const user = getStoredUser();
  if (!user) {
    alert("사용자 정보가 없습니다.");
    return;
  }

  const menuId = getParamId("menuId");
  if (!menuId) {
    alert("menuId가 누락되었습니다.");
    return;
  }

  try {
    // ✅ 사용자 정보 조회 → 카테고리 select 세팅
    const userInfoRes = await apiGet(`/model_user_setting?func=get-user&userId=${user.userId}`);
    const { user: userData } = await userInfoRes.json();

    setCategoryOptions(userData.category);

    // ✅ 메뉴 상세 정보 조회
    const menuRes = await apiGet(`/model_admin_menu?userId=${user.userId}&menuId=${menuId}&func=get-menu-by-id`);
    const menu = await menuRes.json();

    applyMenuData(menu);

    console.log("✅ 상세 데이터 적용 완료", menu);
  } catch (err) {
    console.error("❌ 메뉴 상세 로딩 실패:", err);
    alert("메뉴 정보를 불러오는 데 실패했습니다.");
  }
}

// ✅ URL 파라미터 추출
function getParamId(key: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
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
  const imageUrl = `https://model-narrow-road.s3.ap-northeast-2.amazonaws.com/model/${menu.userId}/${imageFile}`;
  const preview = document.getElementById("logoPreview") as HTMLImageElement;
  if (preview) {
    preview.src = imageUrl;
    preview.style.display = "block";
  }

  const fileName = document.getElementById("fileName");
  if (fileName) fileName.textContent = imageFile;

  // 기본 정보 입력
  (document.getElementById("menu-no") as HTMLInputElement).value = String(menu.no);
  (document.getElementById("menu-name") as HTMLInputElement).value = menu.name;
  (document.getElementById("menu-price") as HTMLInputElement).value = menu.price;
  (document.getElementById("ice-time") as HTMLInputElement).value = menu.iceTime;
  (document.getElementById("water-time") as HTMLInputElement).value = menu.waterTime;

  // 카테고리 설정
  const categorySelect = document.getElementById("menu-category") as HTMLSelectElement;
  if (categorySelect) categorySelect.value = menu.category;

  // 컵
  document.querySelectorAll<HTMLInputElement>('input[name="cup"]')
      .forEach(radio => radio.checked = radio.value === menu.cup);

  // 얼음 여부
  document.querySelectorAll<HTMLInputElement>('input[name="iceYn"]')
      .forEach(radio => radio.checked = radio.value === menu.iceYn);

  // 품절 여부
  document.querySelectorAll<HTMLInputElement>('input[name="empty"]')
      .forEach(radio => radio.checked = radio.value === menu.empty);

  // 상태
  (document.getElementById("state-new") as HTMLSelectElement).value = menu.state?.new || "";
  (document.getElementById("state-event") as HTMLSelectElement).value = menu.state?.event || "";
  (document.getElementById("state-best") as HTMLSelectElement).value = menu.state?.best || "";

  // ✅ 상태 이미지 갱신
  updateOverlay(stateNew, overlayNew);
  updateOverlay(stateEvent, overlayEvent);
  updateOverlay(stateBest, overlayBest);
}
