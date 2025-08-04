import { apiGet } from "../api/apiHelpers.ts";
import { getStoredUser } from "../utils/userStorage.ts";

interface NoticeDetail {
  contentId: number;
  title: string;
  content: string;
  images: string[];
  noticeType: string;
  timestamp: string;
  adminId: string;
  view: number;
  startDate: string;
  endDate: string;
}

export function initNoticeDetail() {
  console.log("공지사항 상세 페이지 초기화");

  // localstorage에 저장된 user 정보를 불러옴
  const user = getStoredUser();

  if (!user) {
    window.showToast(`❌ 사용자 정보가 없습니다.`, 3000, "error");
    return;
  }

  addBackButtonListener();

  const urlParams = new URLSearchParams(window.location.search);
  const contentId = urlParams.get("id");

  if (contentId) {
    loadNoticeDetail(contentId);
  } else {
    window.showToast("공지사항 ID가 없습니다.", 3000, "error");
  }
}

async function loadNoticeDetail(contentId: string) {
  try {
    const response = await apiGet("/model_admin_notice?func=get-posts");
    if (response.ok) {
      const data = await response.json();
      const notice = data.find(
        (item: NoticeDetail) => item.contentId === parseInt(contentId)
      );

      if (notice) {
        renderNoticeDetail(notice);
      } else {
        window.showToast("공지사항을 찾을 수 없습니다.", 3000, "error");
      }
    } else {
      window.showToast("공지사항을 불러오는데 실패했습니다.", 3000, "error");
    }
  } catch (error) {
    console.error("공지사항 상세 로드 실패:", error);
    window.showToast("공지사항을 불러오는데 실패했습니다.", 3000, "error");
  }
}

function renderNoticeDetail(notice: NoticeDetail) {
  const titleEl = document.getElementById("notice-title");
  if (titleEl) {
    titleEl.textContent = notice.title;
  }

  const dateEl = document.getElementById("notice-date");
  if (dateEl) {
    const startDate = formatDate(notice.startDate);
    const endDate = notice.endDate ? formatDate(notice.endDate) : "";

    if (endDate) {
      dateEl.textContent = `${startDate} ~ ${endDate}`;
    } else {
      dateEl.textContent = startDate;
    }
  }

  const imagesContainer = document.getElementById("notice-images");
  if (imagesContainer && notice.images && notice.images.length > 0) {
    imagesContainer.innerHTML = notice.images
      .map(
        (imageUrl) => `
      <div class="notice-image-wrapper">
        <img src="${imageUrl}" alt="공지사항 이미지" class="notice-image" />
      </div>
    `
      )
      .join("");
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function addBackButtonListener() {
  const backButton = document.getElementById("back-button");
  if (backButton) {
    backButton.addEventListener("click", () => {
      history.back();
    });
  }
}
