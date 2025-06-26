import {apiGet} from "../api/apiHelpers.ts";
import {getStoredUser} from "../utils/userStorage.ts";
import {showToast} from "../../main.ts";
import {fetchWithoutLoading} from "../api/api.ts";

type WashItem =
    | { type: "coffee" }
    | { type: "garucha"; value1: string }
    | { type: "syrup"; value1: string };

type WashData = {
    data: WashItem[];
};

export function initDeviceManage() {
    const userInfo = getStoredUser();
    if (!userInfo) {
        alert("사용자 정보가 없습니다.");
        return;
    }

    const userId = userInfo.userId;

    // html의 data-func 값을이용해서 머신요청을보낸다
    document.querySelectorAll('a[data-func]').forEach((el) => {
        el.addEventListener("click", async (e) => {
            e.preventDefault();

            const func = (el as HTMLElement).dataset.func!;
            const msg = (el as HTMLElement).dataset.msg || "명령이 전송되었습니다";

            // 커피 세척일 경우만 washData 지정
            const washData: WashData | undefined =
                el.id === "coffeeWash" ? { data: [{ type: "coffee" }] }
                    : el.id === "wash"
                        ? {
                            data: [
                                { type: "coffee" },
                                { type: "garucha", value1: "1" },
                                { type: "garucha", value1: "2" },
                                { type: "garucha", value1: "3" },
                                { type: "garucha", value1: "4" },
                                { type: "garucha", value1: "5" },
                                { type: "garucha", value1: "6" },
                                { type: "syrup", value1: "1" },
                                { type: "syrup", value1: "2" },
                                { type: "syrup", value1: "3" },
                                { type: "syrup", value1: "5" },
                                { type: "syrup", value1: "6" },
                            ],
                        }
                        : undefined;

            await sendMachineCommand(
                userId,
                washData ? { func, washData } : { func },
                msg
            );
        });
    });

    // 부분세척 init
    initPartialWash(userId);
}

// 부분 세척
export function initPartialWash(userId: string) {

    document.querySelectorAll<HTMLAnchorElement>('a[data-type][data-value]').forEach(el => {
        el.addEventListener("click", async (e) => {
            e.preventDefault();

            const type = el.dataset.type as "garucha" | "syrup";
            const value1 = el.dataset.value;
            const typeNm = type === "garucha" ? "가루차" : "시럽";

            if (!type || !value1) return;

            const washData: WashData = {
                data: [{ type, value1 }]
            };

            await sendMachineCommand(userId, {
                func: "wash",
                washData,
            }, `부분 세척 - ${typeNm} ${value1}번`);
        });
    });
}

// 기기관리 공통
export async function sendMachineCommand(
    userId: string,
    command: { func: string; [key: string]: any },
    successMessage: string
) {
    const res = await apiGet(`/model_machine_registry?func=get-machine-status&userId=${userId}`);
    const { availableUrl, isOnline } = await res.json();

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