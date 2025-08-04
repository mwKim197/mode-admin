import { apiGet } from "../api/apiHelpers.ts";
import { getStoredUser } from "../utils/userStorage.ts";

export function initNoticeList() {
  console.log("공지사항 목록 페이지 초기화");

  // localstorage에 저장된 user 정보를 불러옴
  const user = getStoredUser();

  if (!user) {
    window.showToast(`❌ 사용자 정보가 없습니다.`, 3000, "error");
    return;
  }

  // 여기에 공지사항 관련 기능 추가 예정
  console.log("사용자 정보:", user);
}
