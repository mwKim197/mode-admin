import {apiGet} from "../api/apiHelpers.ts";
import {showToast} from "../../main.ts";
import {fetchWithoutLoading} from "../api/api.ts";
import {ModelUser} from "../types/user.ts";
import {InventoryData, InventoryResponse, RefillItem} from "../types/inventory.ts";

/* ===============================
   전역 상태
================================= */

let originalUserData: ModelUser | null = null;
let selectedItems: RefillItem[] = [];

/* ===============================
   초기화
================================= */

export function initDeviceManage() {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const userId = userInfo.userId;

    console.log("📌 initDeviceManage 호출됨");
    bindRefreshButtons();
    bindRefillButtons();

    loadStoreInfo();
    if (userId) {

        loadInventoryRuntime(userId);
    }
}

/* ===============================
   매장 정보 로드
================================= */

async function loadStoreInfo() {
    try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const userId = userInfo.userId;
        if (!userId) return;

        const response = await apiGet(
            `/model_user_setting?func=get-user&userId=${userId}`
        );

        const data = await response.json();

        if (data?.user) {
            originalUserData = data.user as ModelUser;

            const allowInventoryUsers = ["model0000", "zero16"];
            const inventory = document.querySelector("#inventory") as HTMLElement;
            if (!allowInventoryUsers.includes(originalUserData.userId)) {

                if (inventory) inventory.style.display = "none";
            }

            // 인벤토리 비활성화시 미노출
            if (!data.user.inventoryCheckEnabled) {
                inventory.style.display = "none";
            }

        }
    } catch (error) {
        showToast("매장 정보 로드 실패", 3000, "error");
    }
}

/* ===============================
   인벤토리 조회
================================= */

async function loadInventoryRuntime(userId: string) {
    try {
        const res = await apiGet(
            `/model_inventory_calculate?func=get-runtime&userId=${userId}`
        );

        const runtime = await res.json();

        if (runtime?.ok && runtime.inventory) {
            inventoryChanged(runtime);
        } else {
            console.warn("⚠️ inventory runtime 없음");
        }
    } catch (e) {
        console.warn("⚠️ inventory 조회 실패", e);
    }
}

/* ===============================
   퍼센트 계산
================================= */

function calcPercent(current: number, max: number): number {
    if (!max || max <= 0) return 0;
    const percent = Math.round((current / max) * 100);
    return Math.min(Math.max(percent, 0), 100);
}

interface InventoryRenderItem {
    type: keyof InventoryData;
    key: string;
}

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

/* ===============================
   인벤토리 렌더링
================================= */
function inventoryChanged(data: InventoryResponse): void {

    const fills = Array.from(
        document.querySelectorAll<HTMLDivElement>(".progress-fill")
    );

    if (!data?.inventory) return;

    const values = buildInventoryPercents(data.inventory);

    function animateProgress(index: number, value: number) {
        const fill = fills[index];
        if (!fill) return;
        fill.style.transition = "none";
        fill.style.width = "0%";
        fill.textContent = "0%";
        fill.style.backgroundColor = "";

        void fill.offsetWidth;

        fill.style.transition = "width 1s ease";
        fill.style.width = `${value}%`;

        setTimeout(() => {
            fill.textContent = `${value}%`;
        }, 1000);
    }

    values.forEach((value, index) => {
        animateProgress(index, value);
    });

}

/* ===============================
   리프레시 버튼
================================= */
function bindRefreshButtons() {

    const inventoryWrap = document.querySelector(".inventory-Wrap");

    if (!inventoryWrap) {
        console.log("inventoryWrap 없음");
        return;
    }

    inventoryWrap.addEventListener("click", (e) => {

        const target = e.target as HTMLElement;
        const button = target.closest(".refresh-btn") as HTMLButtonElement | null;

        if (!button) return;

        const type = button.dataset.type;
        const slot = button.dataset.slot;

        if (!type || !slot) return;

        const container = button.closest(".progress-container");
        const fill = container?.querySelector(".progress-fill") as HTMLDivElement | null;

        const exists = selectedItems.find(
            item => item.type === type && item.slot === slot
        );

        if (!exists) {
            selectedItems.push({type, slot});
            button.classList.add("selected");

            // 🔥 즉시 100% 채우기
            if (fill) {
                fill.style.transition = "width 0.5s ease";
                fill.style.width = "100%";
                fill.textContent = "100%";
            }
        } else {
            selectedItems = selectedItems.filter(
                item => !(item.type === type && item.slot === slot)
            );
            button.classList.remove("selected");
        }

    });
}


/* ===============================
   버튼 바인딩
================================= */
function bindRefillButtons() {

    const refillBtn = document.getElementById("refill-submit");
    const refillAllBtn = document.getElementById("refill-all");

    refillBtn?.addEventListener("click", async () => {

        if (selectedItems.length === 0) {
            showToast("충전할 항목을 선택하세요.", 3000, "error");
            return;
        }

        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const userId = userInfo.userId;

        await sendRefillInventory(userId, selectedItems);

        selectedItems = [];
        document.querySelectorAll(".refresh-btn.selected")
            .forEach(btn => btn.classList.remove("selected"));
    });

    refillAllBtn?.addEventListener("click", async () => {

        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const userId = userInfo.userId;

        const items = INVENTORY_RENDER_ORDER.map(({type, key}) => ({
            type,
            slot: key
        }));

        await sendRefillInventory(userId, items);
    });
}


/* ===============================
   머신 공통 명령
================================= */
export async function sendMachineCommand(
    userId: string,
    command: { func: string; [key: string]: any },
    successMessage: string
) {
    const res = await apiGet(
        `/model_machine_registry?func=get-machine-status&userId=${userId}`
    );

    const {availableUrl, isOnline} = await res.json();

    if (isOnline && availableUrl) {

        showToast("✅ " + successMessage);

        fetchWithoutLoading("/model_machine_controll", {
            method: "POST",
            body: JSON.stringify({
                ...command,
                userId,
            }),
        }).catch((err) => {
            console.error("❌ 머신 통신 오류", err);
        });

    } else {
        showToast("❌ 머신이 오프라인입니다.", 4000, "error");
    }
}

/* ===============================
   재고 충전
================================= */

export async function sendRefillInventory(
    userId: string,
    items: RefillItem[]
) {
    try {

        const statusRes = await apiGet(
            `/model_machine_registry?func=get-machine-status&userId=${userId}`
        );

        const {availableUrl, isOnline} = await statusRes.json();

        if (!isOnline || !availableUrl) {
            showToast("❌ 머신이 오프라인입니다.", 4000, "error");
            return;
        }

        const res = await fetchWithoutLoading(
            "/model_inventory_calculate?func=refill-inventory",
            {
                method: "POST",
                body: JSON.stringify({
                    userId,
                    items,
                }),
            }
        );

        if (!res.ok) {
            showToast("❌ 재고 충전 실패", 4000, "error");
            return;
        }

        showToast("✅ 재고 충전 완료");

        await loadInventoryRuntime(userId);

    } catch (err) {
        console.error("❌ 재고 충전 오류", err);
        showToast("❌ 서버 통신 오류", 4000, "error");
    }
}
