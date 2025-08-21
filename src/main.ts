import "./css/common.css"; // 또는 상대 경로 맞게 수정
import { checkUserAccess, getUserData } from "./ts/common/auth.ts";
import "./ts/page/login.ts";
import { loadPartials } from "./ts/utils/layoutLoader.ts";
import { ToastType } from "./ts/types/common.ts";
import { getStoredUser } from "./ts/utils/userStorage.ts";
import { sendMachineCommand } from "./ts/page/deviceManage.ts";
import Choices from "choices.js";
import "choices.js/public/assets/styles/choices.min.css";
import { initMenuMerge } from "./ts/page/menuMerge.ts";

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

// 📌 main.ts (불필요한 코드 로딩 방지)
document.addEventListener("DOMContentLoaded", async () => {
  console.log("✅ main.ts 실행됨");

  // 📌 현재 페이지 URL 확인
  const path = window.location.pathname;

  if (path != "/html/log.html" && path != "/html/dashboard.html") {
    // ✅ 자동로그인 시도 (세션 토큰 없을 때만)
    if (!localStorage.getItem("authToken")) {
      console.log("🔄 자동로그인 시도");
      await tryAutoLogin(); // ✅ 토큰 저장까지 기다림
    } else {
      console.log("✅ 기존 세션 토큰 사용");
    }

    await checkUserAccess();
    await loadPartials(); // ✅ head, layout, header 로딩도 제외
    bindGlobalDeviceEvents();
  }

  const adminUserInfo = await getUserData();

  if (adminUserInfo) {
    const userNameEl = document.getElementById("user-name");
    const userGradeEl = document.getElementById("user-grade");

    if (userNameEl) {
      userNameEl.textContent = `${adminUserInfo.adminId} 님`;
    }

    if (userGradeEl) {
      const gradeText =
        {
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

  // 일반 유저 정보
  const user = getStoredUser();

  // 일반 유저정보 있을경우에만 빠른조작화면 노출
  if (user) {
    const menuWrap = document.querySelector(".user-menuWrap") as HTMLElement;
    if (menuWrap) {
      menuWrap.style.display = "block"; // ✅ 보이게
    }
  } else {
    const menuWrap = document.querySelector(".user-menuWrap") as HTMLElement;
    if (menuWrap) {
      menuWrap.style.display = "none"; // ✅ 숨기기
    }
  }

  // 포인트메뉴
  if (!user?.payType) {
    const menuList = document.querySelector(".sidemenu .menu");
    const pointMene = [{ href: "/html/point.html", label: "포인트" }];
    pointMene.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${item.href}"><p>${item.label}</p></a>`;
      menuList?.appendChild(li);
    });
  }

  // 로그아웃
  const menuList = document.querySelector(".sidemenu .menu");
  const logoutLi = document.createElement("li");
  logoutLi.innerHTML = `<a href="/html/log.html"><p>로그아웃</p></a>`;
  menuList?.appendChild(logoutLi);

  if (adminUserInfo && adminUserInfo.grade <= 2) {
    const menuList = document.querySelector(".sidemenu .menu");

    const adminMenus = [
      { href: "/html/notice.html?type=admin", label: "관리자 공지사항" },
      { href: "/html/notice.html?type=notice", label: "홈페이지 공지사항" },
      { href: "/html/notice.html?type=store", label: "설치매장" },
      { href: "/html/notice.html?type=news", label: "언론보도" },
      { href: "/html/notice.html?type=machine", label: "머신사용설명" },
      { href: "/html/empowerment.html", label: "권한 관리" },
    ];

    adminMenus.forEach((item) => {
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
  } else if (path === "/html/menuMerge.html") {
    initMenuMerge();
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
            ? { data: [{ type: "coffee" }] }
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

        window.sendMachineCommand(
          userId,
          washData ? { func, washData } : { func },
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

        const washData = { data: [{ type, value1 }] };

        window.sendMachineCommand(userId, { func: "wash", washData }, msg);
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();
    console.log(data);
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
