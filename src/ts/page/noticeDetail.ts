import { apiGet } from "../api/apiHelpers.ts";

export function initNoticeDetail() {
  console.log("공지사항 상세 페이지 초기화");

  // URL에서 noticeId 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  const noticeId = urlParams.get("id");

  if (noticeId) {
    loadNoticeDetail(noticeId);
  }
}

async function loadNoticeDetail(noticeId: string) {
  try {
    const response = await apiGet(
      `/model_notice?func=get-notice-detail&id=${noticeId}`
    );
    if (response.ok) {
      const data = await response.json();
      renderNoticeDetail(data);
    }
  } catch (error) {
    console.error("공지사항 상세 로드 실패:", error);
  }
}

function renderNoticeDetail(notice: any) {
  const titleEl = document.getElementById("notice-title");
  const contentEl = document.getElementById("notice-content");
  const dateEl = document.getElementById("notice-date");

  if (titleEl) titleEl.textContent = notice.title;
  if (contentEl) contentEl.innerHTML = notice.content;
  if (dateEl) dateEl.textContent = notice.createdAt;
}
