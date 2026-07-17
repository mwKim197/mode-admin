import {apiGet, apiPost} from "../api/apiHelpers.ts";
import {getUserData} from "../common/auth.ts";
import {getStoredUser} from "../utils/userStorage.ts";

interface BillingConfig {
    franchiseId: string;
    apartmentName: string;
    billingType: "apartment" | "employee";
    defaultMonthlyLimit: number;
    resetDay: number;
    createdAt: string | null;
    updatedAt: string | null;
}

const API_PATH = "/model_billing_payment";
let currentFranchiseId = "";

export async function initBilling() {
    fillResetDayOptions();
    bindAmountInput();

    const admin = await getUserData();
    const user = getStoredUser();
    currentFranchiseId =
        admin?.franchiseId ||
        user?.franchiseId ||
        user?.userId ||
        admin?.userId ||
        "";

    const saveButton = document.getElementById("billingSaveBtn") as HTMLButtonElement | null;
    saveButton?.addEventListener("click", saveConfig);

    if (!currentFranchiseId) {
        setUnavailableState();
        return;
    }

    const context = document.getElementById("billingFranchiseLabel");
    if (context) context.textContent = currentFranchiseId;

    await loadConfig();
}

async function loadConfig() {
    const res = await apiGet(
        `${API_PATH}?func=getConfig&franchiseId=${encodeURIComponent(currentFranchiseId)}`
    );

    if (!res.ok) {
        window.showToast("후불결제 설정을 불러오지 못했습니다.", 2000, "error");
        return;
    }

    const data = await res.json() as {config: BillingConfig};
    renderConfig(data.config);
}

async function saveConfig() {
    const apartmentName = getInput("billingApartmentName").value.trim();
    const defaultMonthlyLimit = Number(
        getInput("billingDefaultLimit").value.replace(/[^0-9]/g, "")
    );
    const resetDay = Number(
        (document.getElementById("billingResetDay") as HTMLSelectElement).value
    );
    const billingType = getSelectedBillingType();

    if (!apartmentName) {
        window.showToast("아파트명을 입력해주세요.", 2000, "warning");
        return;
    }

    if (!Number.isSafeInteger(defaultMonthlyLimit) || defaultMonthlyLimit < 0) {
        window.showToast("기본 월 한도를 확인해주세요.", 2000, "warning");
        return;
    }

    const saveButton = document.getElementById("billingSaveBtn") as HTMLButtonElement;
    saveButton.disabled = true;

    try {
        const res = await apiPost(`${API_PATH}?func=saveConfig`, {
            franchiseId: currentFranchiseId,
            apartmentName,
            billingType,
            defaultMonthlyLimit,
            resetDay,
        });

        const data = await res.json();
        if (!res.ok || data.ok === false) {
            window.showToast(data.message || "설정 저장에 실패했습니다.", 2000, "error");
            return;
        }

        renderConfig(data.config as BillingConfig);
        window.showToast("후불결제 전체 설정을 저장했습니다.");
    } finally {
        saveButton.disabled = false;
    }
}

function renderConfig(config: BillingConfig) {
    getInput("billingApartmentName").value = config.apartmentName || "";
    getInput("billingDefaultLimit").value =
        formatNumber(config.defaultMonthlyLimit);
    const billingType = config.billingType || "apartment";
    const typeInput = document.querySelector<HTMLInputElement>(
        `input[name="billingType"][value="${billingType}"]`
    );
    if (typeInput) typeInput.checked = true;
    (document.getElementById("billingResetDay") as HTMLSelectElement).value =
        String(config.resetDay || 1);

    setText("billingTypeSummary", billingType === "employee" ? "사원증 방식" : "동호수 방식");
    setText("billingLimitSummary", `${formatNumber(config.defaultMonthlyLimit)}원`);
    setText("billingResetSummary", `매월 ${config.resetDay || 1}일`);
    setText(
        "billingUpdatedAt",
        config.updatedAt ? `최종 수정 ${formatDateTime(config.updatedAt)}` : ""
    );
}

function fillResetDayOptions() {
    const select = document.getElementById("billingResetDay") as HTMLSelectElement;
    select.replaceChildren();

    for (let day = 1; day <= 31; day += 1) {
        const option = document.createElement("option");
        option.value = String(day);
        option.textContent = String(day);
        select.appendChild(option);
    }
}

function bindAmountInput() {
    const input = getInput("billingDefaultLimit");
    input.addEventListener("input", () => {
        const digits = input.value.replace(/[^0-9]/g, "");
        input.value = digits ? formatNumber(Number(digits)) : "";
    });
}

function setUnavailableState() {
    const empty = document.getElementById("billingEmptyContext");
    const save = document.getElementById("billingSaveBtn") as HTMLButtonElement;
    if (empty) empty.hidden = false;
    save.disabled = true;
}

function getSelectedBillingType(): "apartment" | "employee" {
    const checked = document.querySelector<HTMLInputElement>(
        'input[name="billingType"]:checked'
    );
    return checked?.value === "employee" ? "employee" : "apartment";
}

function getInput(id: string) {
    return document.getElementById(id) as HTMLInputElement;
}

function setText(id: string, value: string) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function formatNumber(value: number) {
    return Number(value || 0).toLocaleString("ko-KR");
}

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}
