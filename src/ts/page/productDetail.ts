// productDetail.ts
import { renderProductForm } from "../form/renderProductForm.ts";
import {getStoredUser} from "../utils/userStorage.ts";
import {apiGet} from "../api/apiHelpers.ts";

export async function initProductDetail() {
  const menuId = getParamId("menuId");
  if (!menuId) return;

  const user = getStoredUser();

  if (!user) {
    alert("사용자 정보가 없습니다.");
    return;
  }

  const menuRes = await apiGet(`/model_admin_menu?userId=${user.userId}&menuId=${menuId}&func=get-menu-by-id`);
  const menu = await menuRes.json();

  await renderProductForm(menu); // 수정용 렌더링
}

// ✅ URL 파라미터 추출
function getParamId(key: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}