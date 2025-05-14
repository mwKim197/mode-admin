// utils/userStorage.ts
import { ModelUser } from "../types/user";

export function getStoredUser(): ModelUser | null {
    const raw = localStorage.getItem("userInfo");
    if (!raw) return null;
    try {
        return JSON.parse(raw) as ModelUser;
    } catch {
        return null;
    }
}
