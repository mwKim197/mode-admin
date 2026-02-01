import {apiGet} from "../api/apiHelpers.ts";
import {showToast} from "../../main.ts";
import {fetchWithoutLoading} from "../api/api.ts";
import {ModelUser} from "../types/user.ts";

export function initDeviceManage() {
    console.log("📌 initDeviceManage 호출됨");
    loadStoreInfo();
}

// 전역 변수로 원래 데이터 저장
let originalUserData: ModelUser | null = null;

// 매장 정보 로드 함수
async function loadStoreInfo() {
    try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const userId = userInfo.userId;

        if (!userId) {
            return;
        }

        const response = await apiGet(
            `/model_user_setting?func=get-user&userId=${userId}`
        );
        const data = await response.json();

        if (data && data.user) {
            // 원래 데이터 저장 (나중에 비교용)
            originalUserData = data.user as ModelUser;

            const allowInventoryUsers = ["model0000", "zero16"];

            if (!allowInventoryUsers.includes(originalUserData.userId)) {
                const inventory = document.querySelector("#inventory") as HTMLInputElement;
                inventory.style.display = "none";

            }
        }
    } catch (error) {
        window.showToast("매장 정보 로드에 실패했습니다.", 3000, "error");
    }
}

// 기기관리 공통
export async function sendMachineCommand(
    userId: string,
    command: { func: string; [key: string]: any },
    successMessage: string
) {
    const res = await apiGet(`/model_machine_registry?func=get-machine-status&userId=${userId}`);
    const {availableUrl, isOnline} = await res.json();

    if (isOnline && availableUrl) {
        showToast("✅ " + successMessage);
        fetchWithoutLoading("/model_machine_controll", {
            method: "POST",
            body: JSON.stringify({
                ...command,
                userId,
            }),
        }).then((res) => {
            if (!res.ok) {
                console.warn("❌ 머신 명령 실패", res.status);
            }
        }).catch((err) => {
            console.error("❌ 머신 통신 오류", err);
        });
    } else {
        showToast("❌ 머신이 오프라인입니다.", 4000, "error");
    }
}