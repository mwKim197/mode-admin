import "./css/common.css"; // 또는 상대 경로 맞게 수정
import {checkUserAccess, getUserData} from "./ts/common/auth.ts";
import "./ts/page/login.ts";
import {loadPartials} from "./ts/utils/layoutLoader.ts";
import {ToastType} from "./ts/types/common.ts";

// 글로벌 등록
declare global {
    interface Window {
        showLoading: () => void;
        hideLoading: () => void;
        showToast: (msg: string, duration?: number, type?: ToastType ) => void;
    }
}

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

export function showToast(message: string, duration = 3000, type: ToastType = "success") {
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
            color: "#2e7d32"
        },
        error: {
            background: "#fde8e8",
            border: "2px solid #f44336",
            color: "#b71c1c"
        },
        warning: {
            background: "#fff8e1",
            border: "2px solid #ffb300",
            color: "#795548"
        }
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

// 📌 main.ts (불필요한 코드 로딩 방지)
document.addEventListener("DOMContentLoaded", async () => {
    console.log("✅ main.ts 실행됨");

    // 📌 현재 페이지 URL 확인
    const path = window.location.pathname;

    if (path != "/html/log.html" && path != "/html/dashboard.html") {
        await checkUserAccess();
        await loadPartials();    // ✅ head, layout, header 로딩도 제외
    }

    const adminUserInfo = await getUserData();

    if (adminUserInfo) {
        const userNameEl = document.getElementById("user-name");
        const userGradeEl = document.getElementById("user-grade");

        if (userNameEl) {
            userNameEl.textContent = `${adminUserInfo.adminId} 님`;
        }

        if (userGradeEl) {
            const gradeText = {
                1: "총괄관리자",
                2: "운영관리자",
                3: "프랜차이즈",
                4: "일반회원",
            }[adminUserInfo.grade] || "일반회원";

            userGradeEl.innerHTML = `<span>${gradeText}</span>`;
            userGradeEl.classList.remove("manager", "franchise", "store"); // 필요 시
            if (adminUserInfo.grade === 1) userGradeEl.classList.add("manager");
            if (adminUserInfo.grade === 3) userGradeEl.classList.add("franchise");
            if (adminUserInfo.grade === 4) userGradeEl.classList.add("store");
        }
    }

    if (adminUserInfo && adminUserInfo.grade <= 2) {
        const menuList = document.querySelector(".sidemenu .menu");
        const adminMenus = [
            { href: "/html/notice.html?type=admin", label: "관리자 공지사항" },
            { href: "/html/notice.html?type=notice", label: "홈페이지 공지사항" },
            { href: "/html/notice.html?type=store", label: "설치매장" },
            { href: "/html/notice.html?type=news", label: "언론보도" },
            { href: "/html/notice.html?type=machine", label: "머신사용설명" },
            { href: "/html/empowerment.html", label: "권한 관리" }
        ];

        adminMenus.forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `<a href="${item.href}"><p>${item.label}</p></a>`;
            menuList?.appendChild(li);
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
    } else if (path === "/html/franchise_dashboard.html") {
        console.log("🏘️ 프랜차이즈 - franchise.ts 로드");
        import("./ts/page/franchise.ts").then((module) => {
            module.franchiseEdit();
        });
    } else if (path === "/html/store_dashboard.html") {
        console.log("📌 데쉬보드 - store_dashboard.ts 로드");
        import("./ts/page/store.ts").then((module) => {
            module.storeEdit();
        });
    } else if (path === "/html/device_manage.html") {
        console.log("📌 머신관리 - deviceManage.ts 로드");
        import("./ts/page/deviceManage.ts").then((module) => {
            module.initDeviceManage();
        });
    } else {
        console.log("📌 기본 페이지");
    }

});

window.addEventListener("load", () => {
    document.body.style.visibility = "visible";
});
