import {apiGet, apiPost} from "../api/apiHelpers.ts";
import {getStoredUser} from "../utils/userStorage.ts";

type CouponType = "MENU" | "FIXED" | "PERCENT";
type IssuanceType = "QUANTITY" | "PERIOD";

const byId = <T extends HTMLElement>(id: string) =>
    document.getElementById(id) as T | null;

const valueOf = (id: string) =>
    (byId<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(id)?.value || "").trim();

export function initCouponDetail() {
    loadUserData();
    initDateInputs();
    initConditionalFields();

    byId<HTMLButtonElement>("back-to-list")?.addEventListener("click", () => {
        window.location.href = "/html/couponList.html";
    });

    byId<HTMLFormElement>("coupon-form")?.addEventListener("submit", submitCouponForm);
}

function initConditionalFields() {
    const couponType = byId<HTMLSelectElement>("coupon-type");
    const issuanceType = byId<HTMLSelectElement>("issuance-type");

    couponType?.addEventListener("change", updateCouponTypeFields);
    issuanceType?.addEventListener("change", updateIssuanceFields);
    updateCouponTypeFields();
    updateIssuanceFields();
}

function updateCouponTypeFields() {
    const type = valueOf("coupon-type") as CouponType;
    byId("menu-field")?.classList.toggle("is-hidden", type !== "MENU");
    byId("fixed-field")?.classList.toggle("is-hidden", type !== "FIXED");
    byId("percent-field")?.classList.toggle("is-hidden", type !== "PERCENT");
}

function updateIssuanceFields() {
    const type = valueOf("issuance-type") as IssuanceType;
    const issueCount = byId<HTMLInputElement>("issue-count");
    const totalLimit = byId<HTMLInputElement>("total-limit");
    const help = byId<HTMLParagraphElement>("issue-count-help");

    if (!issueCount || !totalLimit) return;
    const isPeriod = type === "PERIOD";
    issueCount.disabled = isPeriod;
    if (isPeriod) issueCount.value = "1";
    totalLimit.disabled = !isPeriod;
    if (!isPeriod) totalLimit.value = issueCount.value || "1";
    if (help) {
        help.textContent = isPeriod
            ? "기간형은 하나의 코드를 여러 고객이 한도 내에서 반복 사용합니다."
            : "수량형은 입력한 매수만큼 서로 다른 코드를 생성합니다.";
    }

    issueCount.oninput = () => {
        if (valueOf("issuance-type") === "QUANTITY") {
            totalLimit.value = issueCount.value;
        }
    };
}

async function submitCouponForm(event: SubmitEvent) {
    event.preventDefault();

    const user = getStoredUser();
    if (!user) {
        window.showToast("사용자 정보가 없습니다.", 2000, "error");
        return;
    }

    const couponType = valueOf("coupon-type") as CouponType;
    const issuanceType = valueOf("issuance-type") as IssuanceType;
    const name = valueOf("coupon-name");
    const startsAt = valueOf("start-date");
    const expiresAt = valueOf("end-date");
    const issueCount = issuanceType === "PERIOD" ? 1 : Number(valueOf("issue-count"));
    const totalLimit = issuanceType === "QUANTITY"
        ? issueCount
        : Number(valueOf("total-limit"));
    const dailyLimitText = valueOf("daily-limit");
    const dailyLimit = dailyLimitText ? Number(dailyLimitText) : null;
    const menuId = valueOf("sample");
    const fixedAmount = Number(valueOf("fixed-amount"));
    const percentRate = Number(valueOf("percent-rate"));
    const maxDiscountText = valueOf("max-discount");
    const maxDiscountAmount = maxDiscountText ? Number(maxDiscountText) : null;

    if (!name) return showWarning("쿠폰명을 입력해주세요.");
    if (!validateDateRange(startsAt, expiresAt)) return;
    if (!Number.isInteger(issueCount) || issueCount < 1 || issueCount > 99) {
        return showWarning("발행매수는 1~99개 사이로 입력해주세요.");
    }
    if (!Number.isInteger(totalLimit) || totalLimit < 1) {
        return showWarning("총 사용 한도는 1회 이상 입력해주세요.");
    }
    if (dailyLimit !== null && (!Number.isInteger(dailyLimit) || dailyLimit < 1)) {
        return showWarning("일일 한도는 미입력하거나 1회 이상 입력해주세요.");
    }
    if (couponType === "MENU" && !menuId) return showWarning("적용 메뉴를 선택해주세요.");
    if (couponType === "FIXED" && (fixedAmount < 100 || fixedAmount > 10000)) {
        return showWarning("정액 할인금액은 100~10,000원으로 입력해주세요.");
    }
    if (couponType === "PERCENT" && (percentRate < 1 || percentRate > 100)) {
        return showWarning("정률 할인율은 1~100%로 입력해주세요.");
    }
    if (maxDiscountAmount !== null && maxDiscountAmount < 0) {
        return showWarning("최대 할인액을 확인해주세요.");
    }

    const selectedMenuName = byId<HTMLSelectElement>("sample")
        ?.selectedOptions[0]?.textContent?.trim();
    const discountValue = couponType === "FIXED"
        ? fixedAmount
        : couponType === "PERCENT" ? percentRate : 0;
    const summary = couponType === "MENU"
        ? `${selectedMenuName || "선택 메뉴"} 무료`
        : couponType === "FIXED"
            ? `${fixedAmount.toLocaleString()}원 할인`
            : `${percentRate}% 할인`;

    if (!confirm(`${name}\n${summary}\n쿠폰을 발행하시겠습니까?`)) return;

    const submitButton = byId<HTMLButtonElement>("coupon-form")
        ?.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
        const response = await apiPost("/model_coupon?func=createCampaign", {
            userId: user.userId,
            name,
            discountType: couponType,
            discountValue,
            maxDiscountAmount: couponType === "PERCENT" ? maxDiscountAmount : null,
            menuId: couponType === "MENU" ? menuId : null,
            issuanceType,
            startsAt,
            expiresAt,
            issueCount,
            totalLimit,
            dailyLimit,
            memo: valueOf("memo") || null,
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(result.message || "쿠폰 발행에 실패했습니다.");
        }

        window.showToast(`${result.coupons?.length || issueCount}개 쿠폰 발행이 완료되었습니다.`, 3000, "success");
        setTimeout(() => {
            window.location.href = "/html/couponList.html";
        }, 1000);
    } catch (error) {
        const message = error instanceof Error ? error.message : "쿠폰 발행 중 오류가 발생했습니다.";
        window.showToast(message, 3000, "error");
    } finally {
        if (submitButton) submitButton.disabled = false;
    }
}

function showWarning(message: string) {
    window.showToast(message, 2500, "warning");
}

function validateDateRange(startDate: string, endDate: string): boolean {
    if (!startDate || !endDate) {
        showWarning("시작일과 종료일을 모두 선택해주세요.");
        return false;
    }

    const today = formatLocalDate(new Date());
    if (startDate < today) {
        showWarning("시작날짜는 오늘 이후로 설정해주세요.");
        return false;
    }
    if (startDate > endDate) {
        showWarning("시작일은 종료일보다 클 수 없습니다.");
        return false;
    }

    const maxEndDate = new Date(`${startDate}T00:00:00`);
    maxEndDate.setDate(maxEndDate.getDate() + 365);
    if (endDate > formatLocalDate(maxEndDate)) {
        showWarning("종료날짜는 시작날짜로부터 1년 이내로 설정해주세요.");
        return false;
    }
    return true;
}

async function loadUserData() {
    try {
        const user = getStoredUser();
        if (!user) return;

        const response = await apiGet(`/model_user_setting?func=get-user&userId=${user.userId}`);
        const data = await response.json();
        const storeName = data.user?.storeName || "";

        const franchise = byId<HTMLInputElement>("franchise-input");
        const store = byId<HTMLInputElement>("store-input");
        const device = byId<HTMLInputElement>("device-input");
        if (franchise) franchise.value = storeName;
        if (store) store.value = storeName;
        if (device) device.value = user.userId;

        await loadMenuOptions(user.userId);
    } catch (error) {
        console.error("사용자 데이터 로드 실패:", error);
        window.showToast("매장 정보를 불러오지 못했습니다.", 3000, "error");
    }
}

async function loadMenuOptions(userId: string) {
    try {
        const response = await apiGet(`/model_admin_menu?userId=${userId}&func=get-all-menu`);
        const data = await response.json();
        const select = byId<HTMLSelectElement>("sample");
        if (!select) return;

        select.innerHTML = '<option value="">메뉴를 선택해주세요</option>';
        (data.items || []).forEach((item: any) => {
            if (!item.menuId || !item.name) return;
            const option = document.createElement("option");
            option.value = String(item.menuId);
            option.textContent = item.name;
            select.appendChild(option);
        });

        new window.Choices(select, {
            shouldSort: false,
            searchEnabled: true,
            position: "auto",
            classNames: {
                containerOuter: "custom-select",
                containerInner: "custom-select-inner",
                input: "custom-select-input",
                itemChoice: "custom-select-item",
                listDropdown: "custom-select-dropdown",
                placeholder: "custom-select-placeholder",
            },
        });
    } catch (error) {
        console.error("메뉴 데이터 로드 실패:", error);
    }
}

function initDateInputs() {
    const start = byId<HTMLInputElement>("start-date");
    const end = byId<HTMLInputElement>("end-date");
    if (!start || !end) return;

    const today = formatLocalDate(new Date());
    start.min = today;
    start.value = today;
    end.min = today;
    end.value = today;

    start.addEventListener("change", () => {
        if (!start.value) return;
        const maximum = new Date(`${start.value}T00:00:00`);
        maximum.setDate(maximum.getDate() + 365);
        end.min = start.value;
        end.max = formatLocalDate(maximum);
        if (end.value < start.value) end.value = start.value;
        if (end.value > end.max) end.value = end.max;
    });
}

function formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
