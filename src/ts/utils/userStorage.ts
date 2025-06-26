import { ModelUser } from "../types/user";

const USER_KEY = "userInfo";

// 사용자 정보 저장
export function setStoredUser(user: ModelUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// 사용자 정보 가져오기
export function getStoredUser(): ModelUser | null {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) as ModelUser : null;
}

// 사용자 정보 삭제
export function clearStoredUser() {
    localStorage.removeItem(USER_KEY);
}
