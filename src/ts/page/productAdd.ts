import {getStoredUser} from "../utils/userStorage.ts";

export function initProductAdd() {
  // localstorage에 저장된 user 정보를 불러옴
  const user = getStoredUser();

  if (!user) {
    alert("사용자 정보가 없습니다.");
    return;
  }

}

