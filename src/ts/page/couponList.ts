import {apiGet, apiPost} from "../api/apiHelpers.ts";
import {getStoredUser} from "../utils/userStorage.ts";
import {renderBarcodeToCanvas} from "../utils/barcode.ts";
import html2canvas from "html2canvas";
import { IMAGE_BASE_URL } from "../config/apiConfig.ts";

let allCoupons: any[] = [];
let searchTimeout: NodeJS.Timeout | null = null;
let userInfo: any = null;

let pageKeys: any[] = [];
let totalItems = 0;
let currentPage = 1;
const pageLimit = 20;
const NEW_COUPON_ENABLED_USER_IDS = new Set(["zero189", "zero223", "model001"]);
let enhancedCouponUiEnabled = false;
let currentStatusFilter = "ACTIVE";
const campaignStatusById = new Map<string, string>();

type CouponVisualType = "MENU" | "FIXED" | "PERCENT";

const COUPON_OVERLAY_IMAGE_BY_TYPE: Partial<Record<CouponVisualType, string>> = {
    FIXED: "/img/coupon-fixed-01.png",
    PERCENT: "/img/coupon-percent-01.png",
};

function getCouponVisualType(couponData: any): CouponVisualType {
    const rawType = String(
        couponData?.discountType
        ?? couponData?.discount_type
        ?? couponData?.couponType
        ?? couponData?.coupon_type
        ?? couponData?.type
        ?? couponData?.campaign?.discountType
        ?? couponData?.campaign?.discount_type
        ?? ""
    ).toUpperCase();

    if (["FIXED", "AMOUNT", "FIXED_AMOUNT", "DISCOUNT_AMOUNT"].includes(rawType)) return "FIXED";
    if (["PERCENT", "PERCENTAGE", "RATE", "DISCOUNT_RATE"].includes(rawType)) return "PERCENT";

    const title = String(couponData?.title ?? couponData?.name ?? "");
    if (/금액권|정액/.test(title)) return "FIXED";
    if (/할인율|할인률|정률|\d+\s*%/.test(title)) return "PERCENT";
    if (couponData?.discountRate != null || couponData?.discount_rate != null) return "PERCENT";
    if (couponData?.discountAmount != null || couponData?.discount_amount != null) return "FIXED";
    return "MENU";
}

function updateCouponBackground(couponData: any) {
    const couponImage = document.getElementById("coupon-image") as HTMLImageElement | null;
    if (!couponImage) return;
    const couponType = getCouponVisualType(couponData);
    couponImage.src = "/img/coupon.svg";
    couponImage.alt = couponType === "FIXED"
        ? "정액 할인쿠폰"
        : couponType === "PERCENT" ? "정률 할인쿠폰" : "메뉴 무료쿠폰";
}

function setDiscountCouponImage(couponData: any, title: string): boolean {
    const imageUrl = COUPON_OVERLAY_IMAGE_BY_TYPE[getCouponVisualType(couponData)];
    if (!imageUrl) return false;
    const couponContentImage = document.querySelector(".coupon-menu-image") as HTMLImageElement | null;
    if (couponContentImage) {
        couponContentImage.src = imageUrl;
        couponContentImage.alt = title;
    }
    return true;
}

function getCouponDiscountValue(couponData: any): number {
    const rawValues = [
        couponData?.discountValue, couponData?.discount_value,
        couponData?.discountAmount, couponData?.discount_amount,
        couponData?.discountRate, couponData?.discount_rate,
        couponData?.amount, couponData?.rate, couponData?.value,
        couponData?.campaign?.discountValue, couponData?.campaign?.discount_value,
        couponData?.campaign?.discountAmount, couponData?.campaign?.discountRate,
        couponData?.campaign?.amount, couponData?.campaign?.rate,
    ];
    for (const rawValue of rawValues) {
        const value = Number(rawValue);
        if (rawValue != null && Number.isFinite(value) && value > 0) return value;
    }
    const title = String(couponData?.title ?? couponData?.name ?? "");
    const match = getCouponVisualType(couponData) === "PERCENT"
        ? title.match(/([\d,.]+)\s*%/)
        : title.match(/([\d,.]+)\s*원/);
    if (!match) return 0;
    const titleValue = Number(match[1].replace(/,/g, ""));
    return Number.isFinite(titleValue) ? titleValue : 0;
}

function getCouponBenefitText(couponData: any): string {
    const couponType = getCouponVisualType(couponData);
    const discountValue = getCouponDiscountValue(couponData);
    if (couponType === "FIXED") {
        return discountValue > 0 ? `${discountValue.toLocaleString("ko-KR")}원 할인` : "정액 할인";
    }
    if (couponType === "PERCENT") return discountValue > 0 ? `${discountValue}% 할인` : "정률 할인";
    return "1잔 무료";
}

export function initCoupon() {
    console.log("✅ coupon.ts 로드됨");

    // localstorage에 저장된 user 정보를 불러옴
    const user = getStoredUser();

    if (!user) {
        window.showToast(`❌ 사용자 정보가 없습니다.`, 3000, "error");
        return;
    }
}

export function initCouponList() {
    console.log("쿠폰 목록 페이지 초기화");

    // 사용자 정보 및 쿠폰 목록 로드
    loadUserInfoAndCoupons();

    // 지정된 운영 계정에만 신형 쿠폰 발행·관리 화면을 노출한다.
    const openCouponDetailBtn = document.getElementById("open-coupon-detail");
    const currentUserId = String(getStoredUser()?.userId ?? "").trim().toLowerCase();
    enhancedCouponUiEnabled = NEW_COUPON_ENABLED_USER_IDS.has(currentUserId);

    if (enhancedCouponUiEnabled) {
        document.body.classList.add("new-coupon-ui-enabled");
        const deleteButton = document.getElementById("delete-selected-coupons");
        const statusFilterWrap = document.getElementById("coupon-status-filter-wrap");
        if (deleteButton) deleteButton.hidden = false;
        if (statusFilterWrap) statusFilterWrap.hidden = false;
        deleteButton?.addEventListener("click", deleteSelectedCouponCampaigns);
        const statusFilter = document.getElementById("coupon-status-filter") as HTMLSelectElement | null;
        statusFilter?.addEventListener("change", () => {
            currentStatusFilter = statusFilter.value;
            renderCouponTable(getStatusFilteredCoupons(allCoupons));
        });
    }

    if (openCouponDetailBtn) {
        openCouponDetailBtn.addEventListener("click", function () {
            const userId = String(getStoredUser()?.userId ?? "").trim().toLowerCase();
            window.location.href = NEW_COUPON_ENABLED_USER_IDS.has(userId)
                ? "/html/couponDetail2.html"
                : "/html/couponDetail.html";
        });
    }

    // 이미지 저장 버튼 이벤트 리스너 추가
    const saveSelectedCouponsBtn = document.getElementById(
        "save-selected-coupons"
    );
    if (saveSelectedCouponsBtn) {
        saveSelectedCouponsBtn.addEventListener(
            "click",
            saveSelectedCouponsAsImages
        );
    }

    // 전체 선택 체크박스 이벤트 리스너 추가
    initSelectAllCheckbox();

    // 검색 기능 초기화
    initSearchFunction();
}

// 사용자 정보와 쿠폰 목록을 동시에 로드 (페이지네이션 적용)
async function loadUserInfoAndCoupons() {
    const user = getStoredUser();
    if (!user) {
        window.showToast("사용자 정보가 없습니다.", 2000, "error");
        return;
    }

    try {
        const [userResponse] = await Promise.all([
            apiGet(`/model_user_setting?func=get-user&userId=${user.userId}`),
        ]);

        if (userResponse.ok) {
            const userData = await userResponse.json();
            userInfo = userData.user;
            console.log("사용자 정보 로드 완료:", userInfo);
        } else {
            console.error("사용자 정보 로드 실패");
        }

        const normalizedUserId = String(user.userId).trim().toLowerCase();
        if (NEW_COUPON_ENABLED_USER_IDS.has(normalizedUserId)) {
            await loadCampaignStatuses(user.userId);
        }
        await getCouponList(user.userId);
    } catch (error) {
        console.error("API 호출 오류:", error);
        window.showToast("데이터를 불러오는데 실패했습니다.", 3000, "error");
    }
}

async function getCouponList(userId: string) {
    try {
        let firstApiUrl = `/model_coupon?func=coupon&userId=${userId}`;
        if (searchTerm) {
            firstApiUrl += `&search=${encodeURIComponent(searchTerm)}`;
        }

        if (currentPage > 1 && pageKeys.length > 0) {
            const keyIndex = (currentPage - 1) * 2 - 1;
            if (pageKeys[keyIndex]) {
                firstApiUrl += `&pageKey=${JSON.stringify(pageKeys[keyIndex])}`;
            }
        }

        const firstResponse = await apiGet(firstApiUrl);
        const firstData = await firstResponse.json();

        // 첫 페이지에서만 pageKeys 수집
        if (currentPage === 1) {
            pageKeys = [];
            totalItems = firstData.total || 0;

            // pageKeys 파싱
            if (firstData.pageKeys) {
                try {
                    pageKeys = JSON.parse(firstData.pageKeys);
                    console.log("📋 pageKeys 파싱 결과:", pageKeys);
                } catch (e) {
                    console.error("pageKeys 파싱 실패:", e);
                }
            }
        }

        let secondApiUrl = `/model_coupon?func=coupon&userId=${userId}`;
        if (searchTerm) {
            secondApiUrl += `&search=${encodeURIComponent(searchTerm)}`;
        }

        let needSecondRequest = false;

        if (currentPage === 1) {
            if (pageKeys[0]) {
                secondApiUrl += `&pageKey=${JSON.stringify(pageKeys[0])}`;
                needSecondRequest = true;
            }
        } else {
            const keyIndex = (currentPage - 1) * 2;
            if (pageKeys[keyIndex]) {
                secondApiUrl += `&pageKey=${JSON.stringify(pageKeys[keyIndex])}`;
                needSecondRequest = true;
            }
        }

        if (needSecondRequest) {
            console.log(" 두 번째 API 요청 URL:", secondApiUrl);
            const secondResponse = await apiGet(secondApiUrl);
            if (secondResponse.ok) {
                const secondData = await secondResponse.json();

                const combinedItems = [
                    ...(firstData.items || []),
                    ...(secondData.items || []),
                ];
                allCoupons = combinedItems.map(withCampaignStatus);
            } else {
                allCoupons = (firstData.items || []).map(withCampaignStatus);
            }
        } else {
            // 두 번째 요청이 불필요한 경우
            allCoupons = (firstData.items || []).map(withCampaignStatus);
        }

        renderCouponTable(getStatusFilteredCoupons(allCoupons));
        renderPagination();
    } catch (error) {
        console.error("쿠폰 목록 로드 실패:", error);
        window.showToast("쿠폰 목록을 불러오는데 실패했습니다.", 3000, "error");
    }
}

function renderPagination() {
    const totalPages = Math.ceil(totalItems / pageLimit);

    let paginationContainer = document.getElementById("pagination-container");
    if (!paginationContainer) {
        paginationContainer = document.createElement("div");
        paginationContainer.id = "pagination-container";
        paginationContainer.className = "pagination";

        const tableArea = document.querySelector(".tableArea");
        if (tableArea && tableArea.parentNode) {
            tableArea.parentNode.insertBefore(
                paginationContainer,
                tableArea.nextSibling
            );
        }
    }

    if (totalPages <= 1) {
        paginationContainer.style.display = "none";
        return;
    }

    paginationContainer.style.display = "flex";
    paginationContainer.innerHTML = "";

    const firstBtn = document.createElement("button");
    firstBtn.textContent = "<<";
    firstBtn.className = `pagination-btn ${currentPage === 1 ? "disabled" : ""}`;
    firstBtn.addEventListener("click", () => {
        if (currentPage !== 1) {
            currentPage = 1;
            getCouponList(getStoredUser()?.userId || "");
        }
    });
    paginationContainer.appendChild(firstBtn);

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "<";
    prevBtn.className = `pagination-btn ${currentPage === 1 ? "disabled" : ""}`;
    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            getCouponList(getStoredUser()?.userId || "");
        }
    });
    paginationContainer.appendChild(prevBtn);

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.textContent = i.toString();

        pageBtn.className = `pagination-btn ${i === currentPage ? "active" : ""}`;
        pageBtn.addEventListener("click", () => {
            currentPage = i;
            getCouponList(getStoredUser()?.userId || "");
        });
        paginationContainer.appendChild(pageBtn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.textContent = ">";
    nextBtn.className = `pagination-btn ${
        currentPage === totalPages ? "disabled" : ""
    }`;
    nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            getCouponList(getStoredUser()?.userId || "");
        }
    });
    paginationContainer.appendChild(nextBtn);

    const lastBtn = document.createElement("button");
    lastBtn.textContent = ">>";
    lastBtn.className = `pagination-btn ${
        currentPage === totalPages ? "disabled" : ""
    }`;
    lastBtn.addEventListener("click", () => {
        if (currentPage !== totalPages) {
            currentPage = totalPages;
            getCouponList(getStoredUser()?.userId || "");
        }
    });
    paginationContainer.appendChild(lastBtn);
}

let searchTerm = "";

function initSearchFunction() {
    const searchInput = document.getElementById(
        "searchCoupon"
    ) as HTMLInputElement;
    const resetBtn = document.getElementById("searchReset") as HTMLButtonElement;

    if (!searchInput || !resetBtn) {
        return;
    }

    // ✅ 검색 버튼 이벤트 리스너 제거

    // 리셋 버튼 클릭 이벤트
    resetBtn.addEventListener("click", () => {
        searchInput.value = "";
        // 실시간 검색으로 전체 데이터 표시
        renderCouponTable(getStatusFilteredCoupons(allCoupons), false);
        renderPagination();
    });

    // Enter 키 이벤트
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            // Enter 키도 실시간 검색과 동일하게 처리
            const searchValue = searchInput.value.trim();
            performRealTimeSearch(searchValue);
        }
    });

    // 실시간 검색
    searchInput.addEventListener("input", function () {
        const searchValue = searchInput.value.trim();

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        searchTimeout = setTimeout(() => {
            performRealTimeSearch(searchValue);
        }, 300);
    });
}

//  실시간 검색 실행
async function performRealTimeSearch(searchValue: string) {
    if (!searchValue.trim()) {
        renderCouponTable(getStatusFilteredCoupons(allCoupons));
        renderPagination();
        return;
    }

    const koreanConsonants = /^[ㄱ-ㅎ]+$/;
    if (koreanConsonants.test(searchValue)) {
        renderCouponTable(getStatusFilteredCoupons(allCoupons));
        renderPagination();
        return;
    }

    if (searchValue.length < 1) {
        renderCouponTable(getStatusFilteredCoupons(allCoupons));
        renderPagination();
        return;
    }

    try {
        const user = getStoredUser();
        if (!user) return;

        const isKorean = /[가-힣]/.test(searchValue);
        const isNumber = /^\d+$/.test(searchValue);

        let apiUrl = `/model_coupon?func=couponDetail&userId=${user.userId}`;

        if (isKorean) {
            apiUrl += `&title=${encodeURIComponent(searchValue)}`;
        } else if (isNumber) {
            apiUrl += `&couponCode=${searchValue}`;
        }

        const response = await apiGet(apiUrl);
        if (response.ok) {
            const data = await response.json();
            const searchResults = (data.items || []).map(withCampaignStatus);

            renderCouponTable(getStatusFilteredCoupons(searchResults), true);

            // ✅ 검색 중에는 페이지네이션 숨기기
            const paginationContainer = document.getElementById(
                "pagination-container"
            );
            if (paginationContainer) {
                paginationContainer.style.display = "none";
            }
        } else {
            renderCouponTable(getStatusFilteredCoupons(allCoupons), false);
            renderPagination();
        }
    } catch (error) {
        renderCouponTable(getStatusFilteredCoupons(allCoupons));
        renderPagination();
    }
}

// 검색 실행 (수정)
/*
function performSearch(searchValue: string) {
  console.log("검색 실행:", searchValue);

  searchTerm = searchValue;
  currentPage = 1;

  const user = getStoredUser();
  if (user) {
    getCouponList(user.userId);
  }
}
*/

// 전체 선택 체크박스 초기화
function initSelectAllCheckbox() {
    const selectAllCheckbox = document.querySelector(
        'thead input[type="checkbox"]'
    ) as HTMLInputElement;

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", function () {
            const isChecked = this.checked;
            const dataCheckboxes = document.querySelectorAll(
                'tbody input[type="checkbox"]'
            ) as NodeListOf<HTMLInputElement>;

            dataCheckboxes.forEach((checkbox) => {
                checkbox.checked = isChecked;
            });
        });
    }
}

// 개별 체크박스 상태에 따른 전체 선택 체크박스 상태 업데이트
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.querySelector(
        'thead input[type="checkbox"]'
    ) as HTMLInputElement;
    const dataCheckboxes = document.querySelectorAll(
        'tbody input[type="checkbox"]'
    ) as NodeListOf<HTMLInputElement>;

    if (selectAllCheckbox && dataCheckboxes.length > 0) {
        const checkedCount = Array.from(dataCheckboxes).filter(
            (checkbox) => checkbox.checked
        ).length;

        if (checkedCount === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (checkedCount === dataCheckboxes.length) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    }
}

// 쿠폰 테이블 렌더링
function renderCouponTable(coupons: any[], isSearchResult: boolean = false) {
    const tbody = document.getElementById("coupon-table-body");

    if (!tbody) {
        return;
    }

    tbody.innerHTML = "";

    if (!coupons || coupons.length === 0) {
        const emptyRow = document.createElement("tr");
        emptyRow.innerHTML = `
      <td colspan="6" class="text-center">발급된 쿠폰이 없습니다.</td>
    `;
        tbody.appendChild(emptyRow);
        return;
    }

    console.log("coupons :", coupons);

    coupons.forEach((coupon, index) => {
        const row = document.createElement("tr");
        row.classList.add("coupon-row");
        row.setAttribute("data-coupon-id", String(coupon.couponId || ""));

        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            const year = String(date.getFullYear()).slice(-2);
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}.${month}.${day}`;
        };

        const expiresAt = formatDate(coupon.expiresAt);
        const displayTitle = coupon.title.replace(" 무료", "");

        const useYn = enhancedCouponUiEnabled && coupon.campaignStatus === "DELETED"
            ? "삭제"
            : coupon.count === 0 ? "사용" : "미사용";
        // ✅ 검색 결과인지에 따라 번호 계산 방식 변경
        const itemNumber = isSearchResult
            ? index + 1
            : (currentPage - 1) * pageLimit + index + 1;

        row.innerHTML = `
      <td><input type="checkbox" /></td>
      <td>${itemNumber}</td>
      <td>${displayTitle}</td>
      <td>~${expiresAt}</td>
      <td>${coupon.couponCode}</td>
      <td>${useYn}</td>
    `;

        tbody.appendChild(row);

        // 개별 체크박스 이벤트 리스너 추가
        const checkbox = row.querySelector(
            'input[type="checkbox"]'
        ) as HTMLInputElement;
        if (checkbox) {
            if (enhancedCouponUiEnabled) {
                checkbox.dataset.campaignId = String(coupon.campaignId || "");
                checkbox.dataset.couponId = String(coupon.couponId || "");
            }
            checkbox.addEventListener("change", updateSelectAllCheckbox);
            // 체크박스 클릭 시 이벤트 전파 방지
            checkbox.addEventListener("click", (e) => {
                e.stopPropagation();
            });
        }

        row.addEventListener("click", () => {
            showCouponPopup(coupon);
        });
    });

    // 테이블 렌더링 후 전체 선택 체크박스 상태 초기화
    updateSelectAllCheckbox();

    // 팝업 닫기 이벤트 리스너 추가
    initCouponPopupEvents();
}

function showCouponPopup(couponData: any) {
    const popup = document.getElementById("coupon-popup") as HTMLElement;

    if (popup) {
        updateCouponOverlay(couponData);
        popup.style.display = "flex";
    }
}

// 메뉴 이미지 로드 함수
function isValidMenuId(menuId: unknown): boolean {
    if (menuId === null || menuId === undefined || menuId === "") return false;
    return Number.isFinite(Number(menuId));
}

async function loadCampaignStatuses(userId: string) {
    try {
        const response = await apiGet(
            `/model_coupon?func=getCampaigns&userId=${encodeURIComponent(userId)}`
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "신규 쿠폰 목록을 불러오지 못했습니다.");
        campaignStatusById.clear();
        (Array.isArray(data.items) ? data.items : []).forEach((campaign: any) => {
            if (campaign?.campaignId) {
                campaignStatusById.set(String(campaign.campaignId), String(campaign.status || "ACTIVE"));
            }
        });
    } catch (error) {
        console.error("신규 쿠폰 캠페인 목록 로드 실패:", error);
        campaignStatusById.clear();
    }
}

function withCampaignStatus(coupon: any) {
    if (!enhancedCouponUiEnabled) return coupon;
    const campaignId = String(coupon?.campaignId || "");
    return {
        ...coupon,
        campaignStatus: campaignId
            ? campaignStatusById.get(campaignId) || "ACTIVE"
            : "ACTIVE",
    };
}

function getStatusFilteredCoupons(coupons: any[]) {
    if (!enhancedCouponUiEnabled || currentStatusFilter === "ALL") return coupons;
    return coupons.filter((coupon) => {
        if (currentStatusFilter === "DELETED") return coupon.campaignStatus === "DELETED";
        if (coupon.campaignStatus === "DELETED") return false;
        if (currentStatusFilter === "USED") return Number(coupon.count) === 0;
        if (currentStatusFilter === "UNUSED") return Number(coupon.count) !== 0;
        return true;
    });
}

async function deleteSelectedCouponCampaigns() {
    if (!enhancedCouponUiEnabled) return;
    const checked = Array.from(document.querySelectorAll<HTMLInputElement>(
        '#coupon-table-body input[type="checkbox"]:checked'
    ));
    const campaignIds = [...new Set(
        checked
            .map((checkbox) => checkbox.dataset.campaignId || "")
            .filter((campaignId) => campaignId && campaignStatusById.get(campaignId) !== "DELETED")
    )];

    if (campaignIds.length === 0) {
        window.showToast("삭제 가능한 신규 쿠폰을 선택해주세요.", 3000, "warning");
        return;
    }
    if (!confirm(`선택한 신규 쿠폰 ${campaignIds.length}건을 삭제하시겠습니까?\n삭제 후 발급된 쿠폰은 사용할 수 없습니다.`)) return;

    const userId = String(getStoredUser()?.userId || "");
    const button = document.getElementById("delete-selected-coupons") as HTMLButtonElement | null;
    if (button) button.disabled = true;
    try {
        for (const campaignId of campaignIds) {
            const response = await apiPost("/model_coupon?func=deleteCampaign", { userId, campaignId });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.message || "쿠폰 삭제에 실패했습니다.");
        }
        window.showToast(`${campaignIds.length}건의 쿠폰이 삭제되었습니다.`, 2500, "success");
        await loadCampaignStatuses(userId);
        await getCouponList(userId);
    } catch (error) {
        const message = error instanceof Error ? error.message : "쿠폰 삭제 중 오류가 발생했습니다.";
        window.showToast(message, 3000, "error");
    } finally {
        if (button) button.disabled = false;
    }
}

function getPublicMenuImageUrl(data: any): string {
    const imageFile = String(data?.image ?? "")
        .split("\\").pop()
        ?.split("/").pop() ?? "";
    const userId = String(data?.userId ?? getStoredUser()?.userId ?? "").trim();
    if (!userId || !imageFile) return "";
    return `${IMAGE_BASE_URL}/model/${encodeURIComponent(userId)}/${encodeURIComponent(imageFile)}`;
}

function loadImageElement(image: HTMLImageElement, imageUrl: string, title: string): Promise<boolean> {
    return new Promise((resolve) => {
        let completed = false;
        const finish = (loaded: boolean) => {
            if (completed) return;
            completed = true;
            window.clearTimeout(timeoutId);
            image.onload = null;
            image.onerror = null;
            resolve(loaded);
        };
        const timeoutId = window.setTimeout(() => finish(false), 10_000);

        image.crossOrigin = "anonymous";
        image.alt = title;
        image.onload = () => finish(true);
        image.onerror = () => finish(false);
        image.src = imageUrl;
        if (image.complete && image.naturalWidth > 0) finish(true);
    });
}

async function loadMenuImage(menuId: string, title: string) {
    try {
        if (!isValidMenuId(menuId)) {
            console.warn("메뉴 이미지 조회 생략: 유효한 menuId가 없습니다.", menuId);
            return;
        }
        const user = getStoredUser();
        if (!user) return;

        const response = await apiGet(
            `/model_admin_menu?userId=${user.userId}&menuId=${menuId}&func=get-menu-by-id`
        );

        if (response.ok) {
            const data = await response.json();

            if (data.image) {
                const imageUrl = getPublicMenuImageUrl(data);

                const menuImage = document.querySelector(
                    ".coupon-menu-image"
                ) as HTMLImageElement;
                if (menuImage && imageUrl) {
                    await loadImageElement(menuImage, imageUrl, title);
                    console.log("메뉴 이미지 로드 완료:", imageUrl);
                }
            }
        }
    } catch (error) {
        console.error("메뉴 이미지 로드 실패:", error);
    }
}

function updateCouponOverlay(couponData: any) {
    updateCouponBackground(couponData);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
        const weekday = weekdays[date.getDay()];
        return `${year}-${month}-${day}(${weekday})`;
    };

    const title = couponData.title.replace(" 무료", "");
    const endDate = formatDate(couponData.expiresAt);
    const period = `${endDate}까지`;
    const storeName = userInfo?.storeName || "전체 지점";
    const titleLength = title.length;
    const titleClass = titleLength >= 10 ? "coupon-title small" : "coupon-title";
    const freeClass = titleLength >= 10 ? "coupon-free small" : "coupon-free";
    const benefitText = getCouponBenefitText(couponData);

    const couponOverlay = document.querySelector(
        ".coupon-overlay"
    ) as HTMLElement;
    if (couponOverlay) {
        couponOverlay.innerHTML = ` 
      <div class="coupon-period" style="transform: translateY(-7px);">${period}</div>
      <img class="coupon-menu-image" src="" alt="${title}" style="transform: translateY(-7px);" />
      <div class="${titleClass}" style="transform: translateY(-7px);">${title}</div>
      <div class="${freeClass}" style="transform: translateY(-7px);">${benefitText}</div>
      <div class="coupon-store" style="transform: translateY(-7px);">${storeName}</div>
      <div class="coupon-id" style="transform: translateY(-7px);">${couponData.couponId}</div>
      <canvas id="coupon-barcode" style="transform: translateY(-7px);"></canvas>  
    `;

        // ✅ 메뉴 이미지 로드
        if (!setDiscountCouponImage(couponData, title)) {
            loadMenuImage(couponData.menuId, title);
        }
    }

    setTimeout(() => {
        const barcodeCanvas = document.getElementById(
            "coupon-barcode"
        ) as HTMLCanvasElement;
        if (barcodeCanvas) {
            try {
                renderBarcodeToCanvas(couponData.couponCode, barcodeCanvas);
                console.log("바코드 생성 완료:", couponData.couponCode);
            } catch (error) {
                console.error("바코드 생성 실패:", error);
            }
        }
    }, 100);
}

// 이미지 다운로드 함수 (선택된 쿠폰 저장용으로만 유지)
function downloadURI(uri: string, name: string) {
    const link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function isIOSDevice(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
        || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

async function dataUrlToFile(image: { uri: string; name: string }): Promise<File> {
    const blob = await (await fetch(image.uri)).blob();
    return new File([blob], image.name, { type: "image/png" });
}

function showIOSShareSheetButton(images: Array<{ uri: string; name: string }>) {
    document.getElementById("ios-coupon-share-sheet")?.remove();

    const overlay = document.createElement("div");
    overlay.id = "ios-coupon-share-sheet";
    Object.assign(overlay.style, {
        position: "fixed", inset: "0", zIndex: "100000", display: "flex",
        alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.65)", padding: "20px",
    });

    const panel = document.createElement("div");
    Object.assign(panel.style, {
        width: "100%", maxWidth: "380px", borderRadius: "16px", background: "#fff",
        padding: "24px", textAlign: "center", whiteSpace: "normal",
        wordBreak: "keep-all", overflowWrap: "anywhere",
    });
    panel.innerHTML = `<div style="font-size:18px;font-weight:700;margin-bottom:8px">쿠폰 이미지 생성 완료</div>
        <div style="font-size:14px;color:#555;line-height:1.5;margin-bottom:20px">선택한 ${images.length}개 이미지를 사진첩에 저장하려면 아래 버튼을 누른 뒤 공유 시트에서 ‘이미지 저장’을 선택하세요.</div>`;

    const shareButton = document.createElement("button");
    shareButton.id = "ios-coupon-open-share-sheet";
    shareButton.type = "button";
    shareButton.textContent = `${images.length}개 사진첩에 저장`;
    Object.assign(shareButton.style, {
        width: "100%", border: "0", borderRadius: "10px", padding: "14px",
        background: "#246bfd", color: "#fff", fontSize: "16px", fontWeight: "700",
        whiteSpace: "normal", wordBreak: "keep-all", overflowWrap: "anywhere", lineHeight: "1.4",
    });
    shareButton.addEventListener("click", async () => {
        try {
            const files = await Promise.all(images.map(dataUrlToFile));
            const shareNavigator = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
            if (!navigator.share || (shareNavigator.canShare && !shareNavigator.canShare({ files }))) {
                throw new Error("이 브라우저는 이미지 파일 공유를 지원하지 않습니다.");
            }
            await navigator.share({ files, title: "쿠폰 이미지" });
            overlay.remove();
        } catch (error) {
            if ((error as DOMException)?.name === "AbortError") return;
            console.error("쿠폰 이미지 공유 실패:", error);
            window.showToast("공유 시트를 열 수 없습니다. Safari에서 다시 시도해 주세요.", 4000, "error");
        }
    });

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "닫기";
    Object.assign(closeButton.style, {
        width: "100%", border: "0", padding: "12px", marginTop: "8px", background: "transparent", color: "#555",
    });
    closeButton.addEventListener("click", () => overlay.remove());

    panel.appendChild(shareButton);
    panel.appendChild(closeButton);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
}

// 쿠폰 팝업 닫기
function hideCouponPopup() {
    const popup = document.getElementById("coupon-popup") as HTMLElement;
    if (popup) {
        popup.style.display = "none";
    }
}

// 팝업 이벤트 초기화
let popupEventsInitialized = false;

function initCouponPopupEvents() {
    if (popupEventsInitialized) return;

    const closeBtn = document.querySelector(
        "#coupon-popup .close-btn"
    ) as HTMLElement;
    const popupOverlay = document.getElementById("coupon-popup") as HTMLElement;

    // 닫기 버튼 클릭
    if (closeBtn) {
        closeBtn.addEventListener("click", hideCouponPopup);
    }

    // 오버레이 클릭 시 닫기
    if (popupOverlay) {
        popupOverlay.addEventListener("click", (e) => {
            if (e.target === popupOverlay) {
                hideCouponPopup();
            }
        });
    }

    popupEventsInitialized = true;
}

async function saveSelectedCouponsAsImages() {
    const checkedCheckboxes = document.querySelectorAll(
        'tbody input[type="checkbox"]:checked'
    ) as NodeListOf<HTMLInputElement>;

    if (checkedCheckboxes.length === 0) {
        window.showToast("저장할 쿠폰을 선택해주세요.", 3000, "warning");
        return;
    }

    console.log(`${checkedCheckboxes.length}개의 쿠폰 이미지 저장 시작`);

    // 로딩 표시
    const saveBtn = document.getElementById(
        "save-selected-coupons"
    ) as HTMLButtonElement;
    const originalText = saveBtn.textContent;
    saveBtn.textContent = "저장 중...";
    saveBtn.disabled = true;

    try {
        const selectedCouponIds: string[] = [];
        checkedCheckboxes.forEach((checkbox) => {
            const row = checkbox.closest("tr") as HTMLElement;
            selectedCouponIds.push(row.getAttribute("data-coupon-id") || "");
        });

        const selectedCoupons = selectedCouponIds
            .map((couponId) => allCoupons.find((coupon) => String(coupon.couponId) === couponId))
            .filter(Boolean);

        const iosDevice = isIOSDevice();
        const iosImages: Array<{ uri: string; name: string }> = [];

        // 각 쿠폰에 대해 이미지 생성 및 저장
        for (let i = 0; i < selectedCoupons.length; i++) {
            const coupon = selectedCoupons[i];
            console.log(
                `${i + 1}/${selectedCoupons.length} 쿠폰 처리 중: ${coupon.title}`
            );

            // 쿠폰 팝업을 숨겨진 상태로 생성
            const generatedImage = await generateCouponImage(coupon, !iosDevice);
            if (iosDevice) iosImages.push(generatedImage);
        }

        if (iosDevice) showIOSShareSheetButton(iosImages);

        window.showToast(
            `${selectedCoupons.length}개의 쿠폰 이미지가 저장되었습니다.`,
            3000,
            "success"
        );

        /*setTimeout(() => {
          window.location.reload();
        }, 1000);*/
    } catch (error) {
        console.error("이미지 저장 실패:", error);
        window.showToast("이미지 저장에 실패했습니다.", 3000, "error");
    } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }
}

// 개별 쿠폰 이미지 생성 함수 수정
async function generateCouponImage(
    couponData: any,
    shouldDownload = true,
): Promise<{ uri: string; name: string }> {
    return new Promise<{ uri: string; name: string }>(async (resolve, reject) => {
        try {
            const popup = document.getElementById("coupon-popup") as HTMLElement;
            const couponContainer = popup.querySelector(".coupon-container") as HTMLElement;

            // 1️⃣ popup을 완전히 렌더링 가능한 위치에 둠 (숨기지 말고, 화면밖으로만 이동)
            Object.assign(popup.style, {
                display: "flex",
                position: "fixed",
                top: "0", // ❗ 꼭 0
                left: "0",
                transform: "translateY(150%)", // 화면 아래쪽으로 밀기 (렌더링됨)
                opacity: "0", // 안보이게
                zIndex: "9999",
                pointerEvents: "none",
            });

            // 2️⃣ html2canvas는 DOM paint 이후 실행해야 함
            await updateCouponOverlayForCapture(couponData);
            await new Promise((r) => setTimeout(r, 400)); // DOM 업데이트 기다림

            // 3️⃣ 웹폰트가 있다면 반드시 대기
            if (document.fonts && document.fonts.ready) {
                await document.fonts.ready;
            }

            // 4️⃣ 바코드 렌더링
            const barcodeCanvas = document.getElementById("coupon-barcode") as HTMLCanvasElement;
            if (barcodeCanvas) {
                renderBarcodeToCanvas(couponData.couponCode, barcodeCanvas);
            }

            // 5️⃣ 캡처 실행
            const canvas = await html2canvas(couponContainer, {
                useCORS: true,
                allowTaint: false,
                scale: Math.min(window.devicePixelRatio, 1.5),
                backgroundColor: "#ffffff", // iOS용 흰색 배경 필수
                logging: false,
                onclone: (doc) => {
                    // 복제된 DOM에 스타일 보존
                    const clonedPopup = doc.getElementById("coupon-popup");
                    if (clonedPopup) {
                        clonedPopup.style.transform = "none";
                        clonedPopup.style.opacity = "1";
                    }
                },
            });

            // 6️⃣ 둥근 모서리 적용
            const roundedCanvas = document.createElement("canvas");
            const ctx = roundedCanvas.getContext("2d");
            roundedCanvas.width = canvas.width;
            roundedCanvas.height = canvas.height;
            if (ctx) {
                ctx.beginPath();
                ctx.roundRect(0, 0, canvas.width, canvas.height, 12);
                ctx.clip();
                ctx.drawImage(canvas, 0, 0);
            }

            const safeTitle = couponData.title.replace(/[^\w\s가-힣]/g, "").replace(/\s+/g, "_");
            const fileName = `${safeTitle}_${couponData.couponCode}.png`;

            // 7️⃣ 이미지 저장
            const imageUri = roundedCanvas.toDataURL("image/png");
            if (shouldDownload) downloadURI(imageUri, fileName);

            // 8️⃣ popup 복원
            popup.style.transform = "";
            popup.style.opacity = "1";
            popup.style.display = "none";

            resolve({ uri: imageUri, name: fileName });
        } catch (error) {
            reject(error);
        }
    });
}


// 캡처용 오버레이 업데이트 함수
async function updateCouponOverlayForCapture(couponData: any): Promise<void> {
    updateCouponBackground(couponData);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
        const weekday = weekdays[date.getDay()];
        return `${year}-${month}-${day}(${weekday})`;
    };

    const title = couponData.title.replace(" 무료", "");
    const endDate = formatDate(couponData.expiresAt);
    const period = `${endDate}까지`;
    const storeName = userInfo?.storeName || "전체 지점";
    const titleLength = title.length;
    const titleClass = titleLength >= 10 ? "coupon-title small" : "coupon-title";
    const freeClass = titleLength >= 10 ? "coupon-free small" : "coupon-free";
    const benefitText = getCouponBenefitText(couponData);

    const couponOverlay = document.querySelector(
        ".coupon-overlay"
    ) as HTMLElement;
    if (couponOverlay) {
        couponOverlay.innerHTML = ` 
      <div class="coupon-period" style="transform: translateY(-15px);">${period}</div>
      <img class="coupon-menu-image" src="" alt="${title}" style="transform: translateY(-7px);" />
      <div class="${titleClass}" style="transform: translateY(-7px);">${title}</div>
      <div class="${freeClass}" style="transform: translateY(-7px);">${benefitText}</div>
      <div class="coupon-store" style="transform: translateY(-7px);">${storeName}</div>
      <div class="coupon-id" style="transform: translateY(-7px);">${couponData.couponId}</div>
      <canvas id="coupon-barcode" style="transform: translateY(-7px);"></canvas>  
    `;

        if (!setDiscountCouponImage(couponData, title)) {
            await loadMenuImageForCapture(couponData.menuId, title);
        }
    }
}

// 캡처용 메뉴 이미지 로드 함수
async function loadMenuImageForCapture(
    menuId: string,
    title: string
): Promise<void> {
    return new Promise((resolve) => {
        try {
            if (!isValidMenuId(menuId)) {
                console.warn("캡처용 메뉴 이미지 조회 생략: 유효한 menuId가 없습니다.", menuId);
                resolve();
                return;
            }
            const user = getStoredUser();
            if (!user) {
                console.log("❌ 사용자 정보 없음");
                resolve();
                return;
            }

            console.log("🔍 이미지 로드 시작:", menuId, title);

            apiGet(
                `/model_admin_menu?userId=${user.userId}&menuId=${menuId}&func=get-menu-by-id`
            )
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error("API 응답 실패");
                })
                .then(async (data) => {
                    console.log(" API 응답 데이터:", data);

                    if (data.image) {
                        const imageUrl = getPublicMenuImageUrl(data);

                        console.log("🖼️ 이미지 URL:", imageUrl);

                        // ✅ 단순히 이미지 src 설정 (Base64 변환 제거)
                        const menuImage = document.querySelector(
                            ".coupon-menu-image"
                        ) as HTMLImageElement;
                        if (menuImage && imageUrl) {
                            const loaded = await loadImageElement(menuImage, imageUrl, title);
                            console.log(loaded ? "✅ 이미지 로드 완료" : "❌ 이미지 로드 실패");
                        } else {
                            console.log("❌ 이미지 요소를 찾을 수 없음");
                        }
                    } else {
                        console.log("❌ 이미지 데이터 없음");
                    }
                    resolve();
                })
                .catch((error) => {
                    console.error("❌ API 호출 실패:", error);
                    resolve();
                });
        } catch (error) {
            console.error("❌ 함수 실행 실패:", error);
            resolve();
        }
    });
}
