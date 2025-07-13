import { ModelUser } from "../types/user";
import {apiGet} from "../api/apiHelpers.ts";

export async function fetchUserInfo(userId: string): Promise<ModelUser | null> {
    const res = await apiGet(`/model_user_setting?func=get-user&userId=${userId}`);

    if (!res.ok) {
        const errorBody = await res.json(); // JSON이 아닐 수 있으므로 text
        console.error("🔴 응답 본문:", errorBody);

        alert("❌ 사용자 정보를 불러오지 못했습니다.");
        return null;
    }

    const { user } = await res.json();

    return user;
}