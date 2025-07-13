import {apiGet} from "../api/apiHelpers.ts";
import {showToast} from "../../main.ts";
import {fetchWithoutLoading} from "../api/api.ts";

export function initDeviceManage() {
    console.log("📌 initDeviceManage 호출됨");
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