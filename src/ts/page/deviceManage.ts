import {apiGet} from "../api/apiHelpers.ts";
import {showToast} from "../../main.ts";
import {fetchWithoutLoading} from "../api/api.ts";
import {ModelUser} from "../types/user.ts";
import {InventoryData, InventoryResponse} from "../types/inventory.ts";

export function initDeviceManage() {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const userId = userInfo.userId;
    console.log("📌 initDeviceManage 호출됨");
    loadStoreInfo();
    loadInventoryRuntime(userId); // 인벤토리 데이터 lambda 조회
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

// 인벤토리 정보조회
async function loadInventoryRuntime(userId: string) {
    try {
        const res = await apiGet(
            `/model_inventory_calculate?func=get-runtime&userId=${userId}`
        );
        const runtime = await res.json();

        if (runtime?.ok && runtime.inventory && runtime.spec) {
            inventoryChanged(runtime);
            console.log(runtime);
        } else {
            console.warn("⚠️ inventory runtime 없음");
        }
    } catch (e) {
        console.warn("⚠️ inventory 조회 실패", e);
    }
}

/*function inventoryChanged() {
    // inventoryProgress.ts

// ===== 타입 유틸 =====
    type ProgressFill = HTMLDivElement;
    type RefreshButton = HTMLButtonElement;

// ===== DOM 조회 =====
    const fills = Array.from(
        document.querySelectorAll<ProgressFill>(".progress-fill")
    );

    const buttons = Array.from(
        document.querySelectorAll<RefreshButton>(".refresh-btn")
    );

// progress 개수만큼 초기값 50%
    const values: number[] = Array.from(
        {length: fills.length},
        () => 50
    );

// ===== 프로그래스 애니메이션 =====
    function animateProgress(
        index: number,
        value: number,
        changeColor: boolean = false
    ): void {
        const fill = fills[index];
        if (!fill) return;

        // 초기화
        fill.style.transition = "none";
        fill.style.width = "0%";
        fill.textContent = "0%";
        fill.style.backgroundColor = "";

        // 강제 리렌더링
        void fill.offsetWidth;

        // 애니메이션 시작
        fill.style.transition = "width 1s ease";
        fill.style.width = `${value}%`;

        setTimeout(() => {
            fill.textContent = `${value}%`;

            if (changeColor) {
                fill.style.backgroundColor = "#2B7FE8";
            }
        }, 1000);
    }

// ===== 다시 채우기 =====
    function replayAnimation(index: number): void {
        animateProgress(index, 100, true);
    }

// ===== 초기 바인딩 =====
    window.addEventListener("DOMContentLoaded", () => {
        // 초기 렌더링 (50%)
        values.forEach((value, index) => {
            animateProgress(index, value);
        });

        // 버튼 이벤트 연결
        buttons.forEach((button, index) => {
            button.addEventListener("click", () => {
                replayAnimation(index);
            });
        });
    });

}*/

// 잔량 계산기 단위 %
function calcPercent(current: number, max: number): number {
    if (!max || max <= 0) return 0;
    const percent = Math.round((current / max) * 100);
    return Math.min(Math.max(percent, 0), 100);
}

interface InventoryRenderItem {
    type: keyof InventoryData;
    key: string;
}

// 화면 순번 중요
const INVENTORY_RENDER_ORDER: InventoryRenderItem[] = [
    {type: "cup", key: "plastic"},
    {type: "cup", key: "paper"},

    {type: "coffee", key: "1"},
    {type: "coffee", key: "2"},

    {type: "garucha", key: "1"},
    {type: "garucha", key: "2"},
    {type: "garucha", key: "3"},
    {type: "garucha", key: "4"},
    {type: "garucha", key: "5"},
    {type: "garucha", key: "6"},

    {type: "syrup", key: "1"},
    {type: "syrup", key: "2"},
    {type: "syrup", key: "3"},
    {type: "syrup", key: "5"},
    {type: "syrup", key: "6"},


];

function buildInventoryPercents(inventory: InventoryData): number[] {
    return INVENTORY_RENDER_ORDER.map(({type, key}) => {
        const item = inventory?.[type]?.[key];
        if (!item) return 0;

        return calcPercent(item.current, item.max);
    });
}

//inventoryChanged 전체
function inventoryChanged(data: InventoryResponse): void {
    const fills = Array.from(
        document.querySelectorAll<HTMLDivElement>(".progress-fill")
    );

    const buttons = Array.from(
        document.querySelectorAll<HTMLButtonElement>(".refresh-btn")
    );

    if (!data?.inventory) return;

    // ✅ inventory 기반 퍼센트 계산
    const values: number[] = buildInventoryPercents(data.inventory);

    function animateProgress(
        index: number,
        value: number,
        changeColor: boolean = false
    ): void {
        const fill = fills[index];
        if (!fill) return;

        // 초기화
        fill.style.transition = "none";
        fill.style.width = "0%";
        fill.textContent = "0%";
        fill.style.backgroundColor = "";

        // 강제 리렌더
        void fill.offsetWidth;

        // 애니메이션 시작
        fill.style.transition = "width 1s ease";
        fill.style.width = `${value}%`;

        setTimeout(() => {
            fill.textContent = `${value}%`;
            if (changeColor) {
                fill.style.backgroundColor = "#2B7FE8";
            }
        }, 1000);
    }

    function replayAnimation(index: number): void {
        animateProgress(index, 100, true);
    }

    // 최초 렌더
    values.forEach((value, index) => {
        animateProgress(index, value);
    });

    // 버튼 이벤트
    buttons.forEach((button, index) => {
        button.addEventListener("click", () => {
            replayAnimation(index);
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