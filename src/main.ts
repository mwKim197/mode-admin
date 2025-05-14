import {checkUserAccess, getUserData} from "./ts/common/auth.ts";
import "./ts/page/login.ts";
import {loadPartials} from "./ts/utils/layoutLoader.ts";

// 📌 main.ts (불필요한 코드 로딩 방지)
document.addEventListener("DOMContentLoaded", async () => {
    console.log("✅ main.ts 실행됨");

    // 📌 현재 페이지 URL 확인
    const path = window.location.pathname;

    if (path != "/html/log.html" && path != "/html/dashboard.html") {
        await checkUserAccess();
        await loadPartials();    // ✅ head, layout, header 로딩도 제외
    }

    const userInfo = await getUserData();

    if (userInfo) {
        const userNameEl = document.getElementById("user-name");
        const userGradeEl = document.getElementById("user-grade");

        if (userNameEl) {
            userNameEl.textContent = `${userInfo.adminId} 님`;
        }

        if (userGradeEl) {
            const gradeText = {
                1: "총괄관리자",
                2: "운영관리자",
                3: "프랜차이즈",
                4: "스토어",
            }[userInfo.grade] || "일반";

            userGradeEl.innerHTML = `<span>${gradeText}</span>`;
            userGradeEl.classList.remove("manager", "franchise", "store"); // 필요 시
            if (userInfo.grade === 1) userGradeEl.classList.add("manager");
            if (userInfo.grade === 3) userGradeEl.classList.add("franchise");
            if (userInfo.grade === 4) userGradeEl.classList.add("store");
        }
    }

    if (userInfo && userInfo.grade <= 2) {
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
    } else if (path === "/html/register.html") {
        console.log("📌 회원가입 페이지 - register.ts 로드");
        import("./ts/page/register.ts").then((module) => {
            module.initRegister();
        });
    } else if (path === "/html/01.notice.html") {
        console.log("📌 공지사항 - 01.notice.ts 로드");
        import("./ts/page/01.notice.ts").then((module) => {
            module.initNotice();
        });
    } else if (path === "/html/01.notice-edit.html") {
        console.log("📌 공지사항등록 - 01.notice-edit.ts 로드");
        import("./ts/page/01.notice-edit.ts").then((module) => {
            module.initNoticeEdit();
        });
    } else if (path === "/html/notice.html") {
        console.log("📌 관리자 공지사항등록 - admin-01.notice.ts 로드");
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
    }  else {
        console.log("📌 기본 페이지");

    }


});

window.addEventListener("load", () => {
    document.body.style.visibility = "visible";
});

