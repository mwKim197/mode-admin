import { getStoredUser } from "../utils/userStorage.ts";
import { apiGet } from "../api/apiHelpers.ts";

export function initHome() {
  console.log("✅ franchise.ts 로드됨");

  // localstorage에 저장된 user 정보를 불러옴
  const user = getStoredUser();

  if (user) {
    loadSalesSummary(user);
  } else {
    const noticeBox = document.getElementById("noticeBox") as HTMLDivElement;
    noticeBox.style.display = "none";
  }

  // 공지사항 목록조회
  loadNotices();

  // 공지사항 팝업
  openPopup();
}

//[start] 매출 통계
async function loadSalesSummary(user: any) {
  try {
    const res = await apiGet(
      `/model_payment?func=get-sales-summary&userId=${user.userId}`
    );
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    // DOM 요소 매핑
    const todayEl = document.getElementById("today");
    const yesterdayEl = document.getElementById("yesterday");
    const monthEl = document.getElementById("month");
    const highestEl = document.getElementById("highest");

    // 매출 데이터 세팅
    todayEl?.setAttribute("data-target", data.todaySales || 0);
    yesterdayEl?.setAttribute("data-target", data.yesterdaySales || 0);
    monthEl?.setAttribute("data-target", data.monthSales || 0);
    highestEl?.setAttribute("data-target", data.highestSale || 0);

    // 카운트 업 실행
    startCounting();
  } catch (err) {
    console.error("❌ 매출 요약 불러오기 실패:", err);
  }
}

// 매출 카운트업 이벤트
function startCounting() {
  const counters = document.querySelectorAll(".countbox h4");

  counters.forEach((counter) => {
    const dataTarget =
      counter.getAttribute("data-target")?.replace(/,/g, "") || "0";
    const target = +dataTarget;

    const numberSpan = counter.querySelector(".number") as HTMLElement;

    const totalDigits = target.toLocaleString().replace(/,/g, "").length;

    const updateCount = () => {
      if (!numberSpan) return; // null이면 스킵
      let current = +numberSpan.innerText.replace(/[^0-9]/g, "") || 0;

      const increment = Math.ceil(target / 100);

      if (current < target) {
        current += increment;
        if (current > target) current = target;

        numberSpan.innerText = formatWithPadding(current, totalDigits);
        setTimeout(updateCount, 10); // 10ms 간격으로 카운트 업
      } else {
        numberSpan.innerText = formatWithPadding(target, totalDigits);
      }
    };

    const formatWithPadding = (num: number, width: number) => {
      const plainNum = num.toString().padStart(width, "0");
      return plainNum.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    updateCount();
  });
}
//[end] 매출 통계
//[start] 공지사항
async function loadNotices() {
  try {
    const res = await apiGet("/model_admin_notice?func=get-posts");
    const notices = await res.json();

    if (!res.ok) throw new Error(notices.message);

    // 최신순 정렬 (timestamp 기준)
    notices.sort(
      (a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // DOM에 렌더링
    const noticeFlex = document.querySelector(".notice-flex");
    if (!noticeFlex) return;

    // 기존 내용 비우기
    noticeFlex.innerHTML = "";

    notices.forEach((notice: any, index: any) => {
      const tagInfo = getTagInfo(notice.noticeType);

      const html = `
                <div class="box notice-item" data-content-id="${
                  notice.contentId
                }">
                  <div class="num">${index + 1}</div>
                  <label class="tag ${tagInfo.color}">${tagInfo.label}</label>
                  <div class="textBox">
                    <h4>${notice.title}</h4>
                    <span>${formatKST(notice.timestamp)}</span>
                  </div>
                </div>
              `;
      noticeFlex.insertAdjacentHTML("beforeend", html);
    });

    // ✅ 클릭 이벤트 추가 (공지사항 박스 클릭 시 팝업)
    document.querySelectorAll(".notice-item").forEach((item) => {
      item.addEventListener("click", () => {
        const contentId = item.getAttribute("data-content-id");
        const clickedNotice = notices.find(
          (n: any) => n.contentId == contentId
        );
        if (clickedNotice) {
          const popup = showPopup(clickedNotice);
          document.getElementById("popupArea")?.appendChild(popup);
        }
      });
    });

    const slider = document.getElementById("noticeSlider");
    if (!slider) return;

    // 기존 내용 비우기
    slider.innerHTML = "";

    notices.forEach((notice: any) => {
      const tagInfo = getTagInfo(notice.noticeType);

      const html = `
                    <div class="notice-item box flex gap-1 mb20" data-content-id="${
                      notice.contentId
                    }">
                      <img src="/img/notice_icon.svg" alt="" />
                      <label class="tag ${tagInfo.color} none-bg">${
        tagInfo.label
      }</label>
                      <p>${formatDateKST(
                        notice.timestamp
                      )} / <br class="br-s" />${notice.title}</p>
                    </div>
                    `;
      slider.insertAdjacentHTML("beforeend", html);
    });

    // ✅ 슬라이더에서도 클릭 이벤트 추가
    slider.querySelectorAll(".notice-item").forEach((item) => {
      item.addEventListener("click", () => {
        const contentId = item.getAttribute("data-content-id");
        const clickedNotice = notices.find(
          (n: any) => n.contentId == contentId
        );
        if (clickedNotice) {
          const popup = showPopup(clickedNotice);
          document.getElementById("popupArea")?.appendChild(popup);
        }
      });
    });
  } catch (err) {
    console.error("❌ 공지사항 불러오기 실패:", err);
  }

  // 슬라이더 추가
  initSwiper();
}

function getTagInfo(type: string) {
  switch (type) {
    case "emergency":
      return { label: "긴급", color: "red" };
    case "patch":
      return { label: "패치", color: "blue" };
    case "event":
      return { label: "이벤트", color: "org" };
    default:
      return { label: "안내", color: "" };
  }
}

function formatKST(isoString: string) {
  const date = new Date(isoString);
  const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const yyyy = kstDate.getFullYear();
  const mm = String(kstDate.getMonth() + 1).padStart(2, "0");
  const dd = String(kstDate.getDate()).padStart(2, "0");
  const hh = String(kstDate.getHours()).padStart(2, "0");
  const min = String(kstDate.getMinutes()).padStart(2, "0");
  const ss = String(kstDate.getSeconds()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd} ${hh}:${min}:${ss}`;
}

function formatDateKST(isoString: string) {
  const date = new Date(isoString);
  const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const mm = String(kstDate.getMonth() + 1).padStart(2, "0");
  const dd = String(kstDate.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

function initSwiper() {
  const slider = document.getElementById("noticeSlider");
  if (!slider) return; // slider 없으면 함수 종료

  const items = slider.children;
  const totalItems = items.length;

  if (totalItems === 0) return;

  let index = 0;

  // 무한루프용 클론
  const firstClone = items[0].cloneNode(true);
  slider.appendChild(firstClone);

  function slideNext() {
    index++;
    if (!slider) return; // slider 없으면 종료
    slider.style.transition = "transform 0.5s ease-in-out";
    slider.style.transform = `translateX(-${index * 100}%)`;

    if (index === totalItems) {
      setTimeout(() => {
        slider.style.transition = "none";
        slider.style.transform = "translateX(0)";
        index = 0;
      }, 600);
    }
  }

  setInterval(slideNext, 5000);
}
//[end] 공지사항
//[start] 공지사항 팝업
async function openPopup() {
  const popupArea = document.getElementById("popupArea") as HTMLDivElement;

  try {
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);

    const startDate = today.toISOString().split("T")[0];
    const endDate = sevenDaysLater.toISOString().split("T")[0];

    // 🔥 공지사항 API 호출
    const res = await apiGet(
      `/model_admin_notice?func=get-posts&startDate=${startDate}&endDate=${endDate}`
    );
    const result = await res.json();

    if (!res.ok || result.length === 0) {
      console.log("❌ 표시할 팝업이 없습니다.");
      return;
    }

    let hasPopup = false;
    result.forEach((notice: any) => {
      if (!getCookie(`popup_${notice.contentId}`)) {
        const popup = showPopup(notice);
        popupArea.appendChild(popup);
        hasPopup = true;
      }
    });

    if (hasPopup) {
      popupArea.classList.remove("hidden");
    } else {
      popupArea.classList.add("hidden");
    }
  } catch (error) {
    console.error("❌ 팝업 로드 오류:", error);
  }
}

function showPopup(notice: any): HTMLDivElement {
  const popupArea = document.getElementById("popupArea");

  if (popupArea) {
    popupArea.classList.remove("hidden"); // ✅ hidden 제거
    popupArea.style.display = "flex"; // ✅ 혹시 hidden 안먹으면 강제 표시
  }

  const popup = document.createElement("div");
  popup.id = `popup_${notice.contentId}`;
  popup.className = "popup_module";

  // 팝업 전체 스타일
  Object.assign(popup.style, {
    position: "fixed",
    top: "45%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#000",
    color: "#fff",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)",
    border: "2px solid #888",
    maxWidth: "360px",
    width: "70%",
    zIndex: "9999",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "220px",
  });

  document.getElementById("popupArea")!.style.backgroundColor =
    "rgba(0, 0, 0, 0.6)";
  document.getElementById("popupArea")!.style.position = "fixed";
  document.getElementById("popupArea")!.style.top = "0";
  document.getElementById("popupArea")!.style.left = "0";
  document.getElementById("popupArea")!.style.width = "100%";
  document.getElementById("popupArea")!.style.height = "100%";
  document.getElementById("popupArea")!.style.zIndex = "9998";

  popup.innerHTML = `
        <div class="popup_module_wrap" style="flex: 1; display: flex; flex-direction: column;">
            <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem; border-bottom: 1px solid #555; padding-bottom: 0.5rem;">공지사항</h2>
            <h3 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; border-bottom: 1px solid #555; ">제목: ${notice.title}</h3>
            <div class="popup_module_content" style="flex: 1; margin-bottom: 1rem; overflow-y: auto; padding-bottom: 0.5rem;">
                ${notice.content}
            </div>
            <div class="popup_module_footer" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 1rem;
                padding-top: 0.5rem;
                border-top: 1px solid #555;
            ">
                <label style="display: flex; align-items: center; font-size: 0.9rem; color: #ccc;">
                    <input type="checkbox" class="todayClose" data-popup-id="popup_${notice.contentId}" style="margin-right: 0.5rem;">
                    오늘 하루 이 창 보지 않음
                </label>
                <button class="__popupClose" data-popup-id="popup_${notice.contentId}" style="
                    color: #ff5353;
                    border: 1px solid #ff5353;
                    background: transparent;
                    border-radius: 4px;
                    padding: 0.3rem 0.8rem;
                    cursor: pointer;
                ">닫기</button>
            </div>
        </div>
    `;

  // 닫기 이벤트
  popup.querySelector(".__popupClose")?.addEventListener("click", () => {
    popup.remove();
    if (!document.querySelector(".popup_module")) {
      document.getElementById("popupArea")!.classList.add("hidden");
    }

    if (!document.querySelector(".popup_module")) {
      if (popupArea) {
        popupArea.classList.add("hidden");
        popupArea.style.display = "none";
      }
    }
  });

  // 오늘 하루 안 보기 이벤트
  popup.querySelector(".todayClose")?.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    if (target.checked) {
      setCookie(`popup_${notice.contentId}`, "hidden", 1);
      popup.remove();
      if (!document.querySelector(".popup_module")) {
        document.getElementById("popupArea")!.classList.add("hidden");
      }
    }

    if (!document.querySelector(".popup_module")) {
      if (popupArea) {
        popupArea.classList.add("hidden");
        popupArea.style.display = "none";
      }
    }
  });

  return popup;
}

function setCookie(name: string, value: string, days: number) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
}

function getCookie(name: string) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
