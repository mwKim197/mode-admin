import { apiGet } from "../api/apiHelpers.ts";
import { getStoredUser } from "../utils/userStorage.ts";

interface NoticeItem {
  contentId: number;
  title: string;
  noticeType: string;
  timestamp: string;
  contentType: string;
  adminId: string;
  view: number;
  startDate: string;
  endDate: string;
}

export function initNoticeList() {
  console.log("공지사항 목록 페이지 초기화");

  // localstorage에 저장된 user 정보를 불러옴
  const user = getStoredUser();

  if (!user) {
    window.showToast(`❌ 사용자 정보가 없습니다.`, 3000, "error");
    return;
  }

  // 공지사항 목록 로드
  loadNoticeList();
}

async function loadNoticeList() {
  try {
    // ✅ 전체 URL 대신 상대 경로 사용
    const response = await apiGet("/model_admin_notice?func=get-posts");
    if (response.ok) {
      const data = await response.json();
      renderNoticeTable(data);
    } else {
      window.showToast("공지사항을 불러오는데 실패했습니다.", 3000, "error");
    }
  } catch (error) {
    console.error("공지사항 목록 로드 실패:", error);
    window.showToast("공지사항을 불러오는데 실패했습니다.", 3000, "error");
  }
}

function renderNoticeTable(notices: NoticeItem[]) {
  const tbody = document.getElementById("notice-table-body");
  if (!tbody) return;

  if (!notices || notices.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">등록된 공지사항이 없습니다.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = notices
    .map((notice, index) => {
      const noticeTypeText = getNoticeTypeText(notice.noticeType);
      const formattedDate = formatDate(notice.timestamp);

      return `
      <tr onclick="window.location.href='./noticeDetail.html?id=${
        notice.contentId
      }'">
        <td>${index + 1}</td>
        <td>${noticeTypeText}</td>
        <td>${notice.title}</td>
        <td>${formattedDate}</td>
      </tr>
    `;
    })
    .join("");
}

function getNoticeTypeText(noticeType: string): string {
  const typeMap: { [key: string]: string } = {
    emergency: "긴급",
    patch: "패치",
    normal: "일반",
    event: "이벤트",
  };
  return typeMap[noticeType] || noticeType;
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}
