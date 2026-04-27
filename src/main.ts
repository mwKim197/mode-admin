import "./css/common.css"; // 또는 상대 경로 맞게 수정
import {checkUserAccess, getUserData, getUserInfo} from "./ts/common/auth.ts";
import "./ts/page/login.ts";
import {loadPartials} from "./ts/utils/layoutLoader.ts";
import {ToastType} from "./ts/types/common.ts";
import {getStoredUser} from "./ts/utils/userStorage.ts";
import {sendMachineCommand} from "./ts/page/deviceManage.ts";
import Choices from "choices.js";
import "choices.js/public/assets/styles/choices.min.css";
import {initMenuMerge} from "./ts/page/menuMerge.ts";
import {apiGet} from "./ts/api/apiHelpers.ts";

// 글로벌 등록
declare global {
    interface Window {
        showLoading: () => void;
        hideLoading: () => void;
        showToast: (msg: string, duration?: number, type?: ToastType) => void;
        sendMachineCommand: typeof import("./ts/page/deviceManage").sendMachineCommand;
        Choices: typeof Choices;
    }
}
// ------- 머신조작전역등록 --------//
window.sendMachineCommand = sendMachineCommand;
// ------- 머신조작전역등록 --------//
// ------- Choices 전역등록 --------//
window.Choices = Choices;
// ------- Choices 전역등록 --------//

// ------- 로딩 딤 --------//

function showLoading() {
    const loader = document.getElementById("global-loading");
    if (loader) loader.style.display = "flex";
}

function hideLoading() {
    const loader = document.getElementById("global-loading");
    if (loader) loader.style.display = "none";
}

window.showLoading = showLoading;
window.hideLoading = hideLoading;
// ------- 로딩 딤 --------//

// ------- 토스트 메세지 --------//

export function showToast(
    message: string,
    duration = 3000,
    type: ToastType = "success"
) {
    const containerId = "toast-container";
    let container = document.getElementById(containerId);

    if (!container) {
        container = document.createElement("div");
        container.id = containerId;
        container.style.cssText = `
          position: fixed;
          top: 1rem;
          right: 2rem; /* ✅ 오른쪽 여백은 고정 */
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center; /* ✅ 오른쪽 정렬 */
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.textContent = message;

    // ✅ 스타일 분기
    const styleMap = {
        success: {
            background: "#e6fbe6",
            border: "2px solid #4CAF50",
            color: "#2e7d32",
        },
        error: {
            background: "#fde8e8",
            border: "2px solid #f44336",
            color: "#b71c1c",
        },
        warning: {
            background: "#fff8e1",
            border: "2px solid #ffb300",
            color: "#795548",
        },
    };

    const style = styleMap[type];

    toast.style.cssText = `
        background: ${style.background};
        color: ${style.color};
        border: ${style.border};
        padding: 0.8rem 1.2rem;
        margin-top: 0.5rem;
        border-radius: 0.5rem;
        font-size: 1.2rem;
        max-width: 320px;                /* ✅ 최대 너비 제한 */
        white-space: normal;             /* ✅ 줄바꿈 허용 */
        word-break: break-word;          /* ✅ 단어 길어도 줄바꿈 */
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(-10px);
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    });

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-10px)";
        setTimeout(() => container?.removeChild(toast), 300);
    }, duration);
}

window.showToast = showToast;
// ------- 토스트 메세지 --------//

// ===============================
// 🔥 Impersonation Token 처리
// ===============================
(function applyImpersonationToken() {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("impersonate_token");

    if (token) {
        // 매장 계정 세션은 sessionStorage에 저장해야 함
        sessionStorage.setItem("accessToken", token);
        sessionStorage.setItem("impersonationMode", "true");

        url.searchParams.delete("impersonate_token");
        window.location.replace(url.toString());

    }
})();

// 📌 main.ts (불필요한 코드 로딩 방지)
document.addEventListener("DOMContentLoaded", async () => {
    console.log("✅ main.ts 실행됨");

    const path = window.location.pathname;
    const impersonationMode = sessionStorage.getItem("impersonationMode") === "true";

    // 1) 로그인 처리
    if (!impersonationMode && path !== "/html/log.html" && path !== "/html/dashboard.html") {
        if (!localStorage.getItem("authToken")) {
            await tryAutoLogin();
        }
    }

    // 2) 공통 처리 (단 한 번만 실행!)
    if (path !== "/html/log.html" && path !== "/html/dashboard.html") {
        await checkUserAccess();
        await loadPartials();
        bindGlobalDeviceEvents();
    }

    // 3) 유저정보 불러오기
    const userInfo = await getUserData();

    if (userInfo?.userId) {
        await getUserInfo(userInfo.userId);
    }

    // logo home 경로 변경
    if (userInfo?.grade === 3) {
        const logoLink = document.querySelector("header a[href='/html/home.html']");
        if (logoLink) {
            logoLink.setAttribute("href", "/html/franchiseHome.html");
        }
    }

    // logo home 경로 변경
    if (userInfo?.grade === 1 || userInfo?.grade === 2) {
        const logoLink = document.querySelector("header a[href='/html/home.html']");
        if (logoLink) {
            logoLink.setAttribute("href", "/html/adminHome.html");
        }
    }

    if (userInfo) {
        const userNameEl = document.getElementById("user-name");
        const userGradeEl = document.getElementById("user-grade");

        if (userNameEl) {
            userNameEl.textContent = `${userInfo.adminId} 님`;
        }

        if (userGradeEl) {
            const gradeText =
                {
                    1: "총괄관리자",
                    2: "운영관리자",
                    3: "프랜차이즈",
                    4: "일반회원",
                }[userInfo.grade] || "일반회원";

            userGradeEl.innerHTML = `<span>${gradeText}</span>`;
            userGradeEl.classList.remove("manager", "franchise", "store"); // 필요 시
            if (userInfo.grade === 1) userGradeEl.classList.add("manager");
            if (userInfo.grade === 3) userGradeEl.classList.add("franchise");
            if (userInfo.grade === 4) userGradeEl.classList.add("store");
        }
    }

    let shoppingMallOption = true;

    if (userInfo && userInfo.grade === 4) {
        const franchiseId = userInfo.franchiseId;

        if (franchiseId) {
            const res = await apiGet(`/model_admin_franchise?func=get-franchise&franchiseId=${franchiseId}`);
            const data = await res.json();

            const franchise = data.franchise;
            shoppingMallOption = franchise.options?.shoppingMall ?? true; // 기본값 true

        }
    }

    // 일반 유저 정보
    const user = getStoredUser();
    const menuWrap = document.querySelector(".user-menuWrap") as HTMLElement;
    // 일반 유저정보 있을경우에만 빠른조작화면 노출
    if (menuWrap) {

        if (user) {
            menuWrap.style.display = "block"; // ✅ 보이게
        } else {
            menuWrap.style.display = "none"; // ✅ 숨기기
        }
    }

    interface MenuItem {
        href: string;
        label: string;
        target?: '_blank' | '_self' | '_parent' | '_top';
        rel?: string;
    }

// 1) 공통(일반) 메뉴
    let generalMenus: MenuItem[] = [
        {href: "/html/home.html", label: "Home"},
        {href: "/html/noticeList.html", label: "공지사항"},
        {href: "/html/product.html", label: "상품"},
        {href: "/html/sales.html", label: "매출"},
        {href: "/html/deviceManage.html", label: "기기관리"},
        {href: "http://pf.kakao.com/_mIxiYG/chat", label: "A/S접수", target: "_blank", rel: "noopener noreferrer"},
        {href: "/html/normalSet.html", label: "일반설정"},
        {href: "/html/log.html", label: "로그아웃"},
    ];

    if (shoppingMallOption) {

        generalMenus = upsertMenuItem(generalMenus, {
            href: "http://modelzero.shop/",
            label: "쇼핑몰",
            target: "_blank",
            rel: "noopener noreferrer"
        }, {insertAfterLabel: "매출"});
    }

// 2) 관리자 전용 메뉴
    const adminMenus: MenuItem[] = [
        {href: "/html/adminHome.html", label: "Home"},
        {href: "/html/noticeList.html", label: "공지사항"},
        {href: "/html/user-register.html", label: "매장계정생성"},
        {href: "/html/menuMerge.html", label: "레시피복사"},
        {href: "/html/notice.html?type=admin", label: "관리자 공지사항"},
        {href: "/html/notice.html?type=notice", label: "홈페이지 공지사항"},
        {href: "/html/notice.html?type=store", label: "설치매장"},
        {href: "/html/notice.html?type=news", label: "언론보도"},
        {href: "/html/notice.html?type=machine", label: "머신사용설명"},
        {href: "/html/adminLog.html", label: "로그조회"},
        {href: "/html/empowerment.html", label: "일반 매장관리"},
        {href: "/html/adminEmpowerment.html", label: "관리자 권한설정"},
        {href: "/html/register.html", label: "관리자 계정생성"},
        {href: "/html/franchise.html", label: "프랜차이즈 관리"},
        {href: "/html/normalSet.html", label: "일반설정"},
        {href: "/html/log.html", label: "로그아웃"},
    ];

    // 3) 프랜차이즈관리자 메뉴
    const franchiseMenus: MenuItem[] = [
        {href: "/html/franchiseHome.html", label: "Home"},
        {href: "/html/noticeList.html", label: "공지사항"},
        {href: "/html/menuMerge.html", label: "레시피복사"},
        {href: "/html/log.html", label: "로그아웃"},
    ];

    // ✅ 포인트 메뉴 정의
    const pointMenu: MenuItem = {href: "/html/point.html", label: "포인트"};

    // ✅ 쿠폰 메뉴 정의
    const couponMenu: MenuItem = {href: "/html/couponList.html", label: "쿠폰"};

    // 3) 메뉴 렌더 함수
    function renderMenu(containerSelector: string, items: MenuItem[]): void {
        const menuList = document.querySelector<HTMLUListElement>(containerSelector);
        if (!menuList) return;

        menuList.replaceChildren(); // 기존 항목 비우기

        items.forEach((item) => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            const p = document.createElement("p");

            a.href = item.href;
            if (item.target) a.target = item.target;
            if (item.rel) a.rel = item.rel;

            p.textContent = item.label;
            a.appendChild(p);
            li.appendChild(a);
            menuList.appendChild(li);
        });

    }

    // 🔧 유틸: 특정 항목 존재 여부 + 원하는 위치에 삽입
    function upsertMenuItem(
        items: MenuItem[],
        item: MenuItem,
        opts: { insertAfterHref?: string; insertAfterLabel?: string } = {}
    ): MenuItem[] {
        const exists = items.some(
            (it) => it.href === item.href || it.label === item.label
        );
        if (exists) return items;

        let insertIndex = items.length;
        if (opts.insertAfterHref) {
            const i = items.findIndex((it) => it.href === opts.insertAfterHref);
            if (i >= 0) insertIndex = i + 1;
        } else if (opts.insertAfterLabel) {
            const i = items.findIndex((it) => it.label === opts.insertAfterLabel);
            if (i >= 0) insertIndex = i + 1;
        }

        const next = items.slice();
        next.splice(insertIndex, 0, item);
        return next;
    }

    // 4) 사용자 등급에 따라 구성
    (function initSideMenu(): void {
        let menus: MenuItem[];

        const grade = Number(userInfo?.grade);

        if (grade <= 2) {
            // 1~2 : 관리자 메뉴
            menus = adminMenus;
        } else if (grade === 3) {
            // 3 : 프랜차이즈 메뉴
            menus = franchiseMenus;
        } else {
            // 4 : 일반 매장
            menus = generalMenus;
        }

        // 옵션 메뉴 추가 (포인트/쿠폰)
        if (user?.payType === false) {
            menus = upsertMenuItem(menus, pointMenu, {insertAfterLabel: "매출"});
        }

        if (user?.coupon === false) {
            menus = upsertMenuItem(menus, couponMenu, {insertAfterLabel: "일반설정"});
        }

        // 렌더링
        renderMenu(".sidemenu .menu", menus);
        highlightActiveMenu(".sidemenu .menu");
    })();

    // (선택) 현재 경로와 링크가 같으면 active 클래스 추가
    function highlightActiveMenu(containerSelector: string): void {
        const container = document.querySelector<HTMLUListElement>(containerSelector);
        if (!container) return;

        const here = location.pathname + location.search;

        container.querySelectorAll<HTMLAnchorElement>("a").forEach((a) => {
            try {
                const url = new URL(a.href, location.origin);
                const isSame =
                    a.target !== "_blank" &&
                    (url.pathname + url.search === here);
                if (isSame) a.classList.add("active");
            } catch {
                // malformed href 등 무시
            }
        });
    }

    if (path === "/index.html" || path === "/") {
        console.log("index 페이지");
    } else if (path === "/html/log.html") {
        console.log("📌 로그인 페이지 - login.ts 로드");
        import("./ts/page/login.ts").then((module) => {
            module.initLogin(); // login.ts의 함수 실행
        });
    } else if (path === "/html/home.html") {
        console.log("📌 홈 페이지 - home.ts 로드");
        import("./ts/page/home.ts").then((module) => {
            module.initHome();
        });
    } else if (path === "/html/point.html") {
        console.log("📌 포인트 - point.ts 로드");
        import("./ts/page/point.ts").then((module) => {
            module.initPoint();
        });
    } else if (path === "/html/product.html") {
        console.log("📌 상품 - product.ts 로드");
        import("./ts/page/product.ts").then((module) => {
            module.initProduct();
        });
    } else if (path === "/html/product-detail.html") {
        console.log("📌 상품상세 - productDetail.ts 로드");
        import("./ts/page/productDetail.ts").then((module) => {
            module.initProductDetail();
        });
    } else if (path === "/html/product-add.html") {
        console.log("📌 상품등록 - productAdd.ts 로드");
        import("./ts/page/productAdd.ts").then((module) => {
            module.initProductAdd();
        });
    } else if (path === "/html/register.html") {
        console.log("📌 회원가입 페이지 - register.ts 로드");
        import("./ts/page/register.ts").then((module) => {
            module.initRegister();
        });
    } else if (path === "/html/notice.html") {
        console.log("📌 관리자 공지사항등록 - notice.ts 로드");
        import("./ts/page/notice.ts").then((module) => {
            module.initNotice();
        });
    } else if (path === "/html/franchise.html") {
        console.log("🏘️ 프랜차이즈 - franchise.ts 로드");
        import("./ts/page/franchise.ts").then((module) => {
            module.franchiseEdit();
        });
    } else if (path === "/html/store_dashboard.html") {
        console.log("📌 데쉬보드 - store_dashboard.ts 로드");
        import("./ts/page/store.ts").then((module) => {
            module.storeEdit();
        });
    } else if (path === "/html/deviceManage.html") {
        console.log("📌 머신관리 - deviceManage.ts 로드");
        import("./ts/page/deviceManage.ts").then((module) => {
            module.initDeviceManage();
        });
    } else if (path === "/html/sales.html") {
        console.log("📌 매출 - sales.ts 로드");
        import("./ts/page/sales.ts").then((module) => {
            module.initSales();
        });
    } else if (path === "/html/normalSet.html") {
        console.log("📌 일반설정 - normalSet.ts 로드");
        import("./ts/page/normalSet.ts").then((module) => {
            module.initNormalSet();
        });
    } else if (path === "/html/couponList.html") {
        console.log("📌 쿠폰목록 - couponList.ts 로드");
        import("./ts/page/couponList.ts").then((module) => {
            module.initCouponList();
        });
    } else if (path === "/html/couponDetail.html") {
        console.log("📌 쿠폰발행 - couponDetail.ts 로드");
        import("./ts/page/couponDetail.ts").then((module) => {
            module.initCouponDetail();
        });
    } else if (path === "/html/noticeList.html") {
        console.log("📌 공지사항목록 - noticeList.ts 로드");
        import("./ts/page/noticeList.ts").then((module) => {
            module.initNoticeList();
        });
    } else if (path === "/html/noticeDetail.html") {
        console.log("📌 공지사항상세 - noticeDetail.ts 로드");
        import("./ts/page/noticeDetail.ts").then((module) => {
            module.initNoticeDetail();
        });
    } else if (path === "/html/adminEmpowerment.html") {
        console.log("📌 관리자 권한설정 - adminEmpowerment.ts 로드");
        import("./ts/page/adminEmpowerment.ts").then((module) => {
            module.adminEmpowermentDetail();
        });
    } else if (path === "/html/empowerment.html") {
        console.log("📌 권한설정 - empowerment.ts 로드");
        import("./ts/page/empowerment.ts").then((module) => {
            module.empowermentStore();
        });
    } else if (path === "/html/menuMerge.html") {
        initMenuMerge();
    } else if (path === "/html/categoryAndMenuMerge.html" || path === "/categoryAndMenuMerge.html") {
        import("./ts/page/categoryAndMenuMerge.ts").then(m => m.initCategoryAndMenuMerge());
    } else if (path === "/html/user-register.html") {
        console.log("📌 사용자 등록 - user-register.ts 로드");
        import("./ts/page/user-register.ts").then((module) => {
            module.initUserRegister();
        });
    } else if (path === "/html/franchiseHome.html") {
        console.log("📌 프렌차이즈 관리자 - franchiseHome.ts 로드");
        import("./ts/page/franchiseHome.ts").then((module) => {
            module.initFranchiseHome();
        });
    } else if (path === "/html/adminHome.html") {
        console.log("📌 관리자 HOME - adminHome.ts 로드");
        import("./ts/page/adminHome.ts").then((module) => {
            module.initAdminHome();
        });
    } else if (path === "/html/adminLog.html") {
        console.log("📌 관리자 LOG - adminLog.ts 로드");
        import("./ts/page/adminLog.ts").then((module) => {
            module.initAdmionLog();
        });
    } else if (path === "/html/adminLogDetail.html") {
        console.log("📌 관리자 LOG DEATAIL - adminLogDetail.ts 로드");
        import("./ts/page/adminLogDetail.ts").then((module) => {
            module.initAdmionDetailLog();
        });
    } else {
        console.log("📌 기본 페이지");
    }

    // === 톱니바퀴(메뉴) 팝업 바깥 클릭 시 닫기 기능 추가 ===
    const userMenuWrap = document.querySelector(".user-menuWrap");
    const userSetBox = document.querySelector(".user-setBox");
    const menuBtn = userMenuWrap?.querySelector(".ani-1");

    if (userMenuWrap && userSetBox && menuBtn) {
        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (userSetBox.classList.contains("hidden")) {
                userSetBox.classList.remove("hidden");
            }
        });

        // 팝업 내부 클릭 시 이벤트 전파 막기
        userSetBox.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        // 팝업 바깥 클릭 시 팝업 닫기
        document.addEventListener(
            "click",
            (e) => {
                if (!userSetBox.classList.contains("hidden")) {
                    if (
                        !userSetBox.contains(e.target as Node) &&
                        !(e.target as HTMLElement).closest(".ani-1")
                    ) {
                        userSetBox.classList.add("hidden");
                    }
                }
            },
            false
        );
    }
});

window.addEventListener("load", () => {
    document.body.style.visibility = "visible";
});


// 머신 조작 전역등록 api - deviceManage.ts 호출
function bindGlobalDeviceEvents() {
    const userInfo = getStoredUser();
    if (!userInfo) {
        console.warn("❌ 사용자 정보 없음");
        return;
    }
    const userId = userInfo.userId;

    // [data-func] 있는 모든 버튼 및 a 태그 처리
    document
        .querySelectorAll<HTMLAnchorElement | HTMLButtonElement>(
            "a[data-func], button[data-func]"
        )
        .forEach((el) => {
            el.addEventListener("click", (e) => {
                e.preventDefault();
                const func = el.dataset.func!;
                const msg = el.dataset.msg || "명령이 전송되었습니다";

                // ✅ 확인창이 필요한 기능
                if (
                    func === "wash" ||
                    func === "pl" ||
                    func === "pa" ||
                    func === "restart" ||
                    func === "shutdown"
                ) {
                    let confirmMsg = "";
                    if (func === "wash") confirmMsg = "기기세척을 진행하시겠습니까?";
                    if (func === "pl") confirmMsg = "플라스틱컵을 배출하시겠습니까?";
                    if (func === "pa") confirmMsg = "종이컵을 배출하시겠습니까?";
                    if (func === "restart") confirmMsg = "프로그램을 재시작하시겠습니까?";
                    if (func === "shutdown") confirmMsg = "프로그램을 종료하시겠습니까?";
                    if (!confirm(confirmMsg)) return;
                }

                // 커피 세척 및 전체 세척 구분
                const washData =
                    el.id === "coffeeWash"
                        ? {data: [{type: "coffee"}]}
                        : el.id === "wash"
                            ? {
                                data: [
                                    {type: "coffee"},
                                    {type: "garucha", value1: "1"},
                                    {type: "garucha", value1: "2"},
                                    {type: "garucha", value1: "3"},
                                    {type: "garucha", value1: "4"},
                                    {type: "garucha", value1: "5"},
                                    {type: "garucha", value1: "6"},
                                    {type: "syrup", value1: "1"},
                                    {type: "syrup", value1: "2"},
                                    {type: "syrup", value1: "3"},
                                    {type: "syrup", value1: "5"},
                                    {type: "syrup", value1: "6"},
                                ],
                            }
                            : undefined;

                window.sendMachineCommand(
                    userId,
                    washData ? {func, washData} : {func},
                    msg
                );
            });
        });

    // [data-type][data-value] 있는 모든 버튼 및 a 태그 처리 (부분세척)
    document
        .querySelectorAll<HTMLAnchorElement | HTMLButtonElement>(
            "a[data-type][data-value], button[data-type][data-value]"
        )
        .forEach((el) => {
            el.addEventListener("click", (e) => {
                e.preventDefault();

                const type = el.dataset.type as "garucha" | "syrup";
                const value1 = el.dataset.value!;
                let number = value1;
                if (type === "syrup") {
                    if (parseFloat(value1) === 5) {
                        number = String(4);
                    } else if (parseFloat(value1) === 6) {
                        number = String(5);
                    }
                }

                const msg = `${
                    type === "garucha" ? "가루차" : "시럽"
                } ${number}번 세척`;

                const washData = {data: [{type, value1}]};

                window.sendMachineCommand(userId, {func: "wash", washData}, msg);
            });
        });
}

// 자동로그인
async function tryAutoLogin() {
    const API_URL = "https://api.narrowroad-model.com"; // ✅ 전역 충돌 방지
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
        console.log("🔒 자동로그인 스킵: refreshToken 없음");
        return;
    }

    console.log("🔄 자동로그인 시도 중...");

    try {
        const res = await fetch(`${API_URL}/model_admin_login?func=refresh`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({refreshToken}),
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("accessToken", data.accessToken);
            console.log("✅ 자동로그인 성공");
        } else {
            console.warn("❌ 자동로그인 실패:", data.message || "Unknown error");
            localStorage.removeItem("refreshToken");
            redirectToLogin();
        }
    } catch (err) {
        console.error("❌ 자동로그인 요청 오류:", err);
        redirectToLogin();
    }
}

// 로그인페이지 이동
function redirectToLogin() {
    console.log("➡️ 로그인 페이지로 이동");
    window.location.href = "/html/log.html";
}

