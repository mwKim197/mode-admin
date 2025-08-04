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

  const sortedNotices = notices.sort((a, b) => {
    const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
    const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
    return dateB - dateA; // 내림차순 (최신이 위쪽)
  });

  tbody.innerHTML = sortedNotices
    .map((notice, index) => {
      const tagInfo = getTagInfo(notice.noticeType);
      const formattedDate = formatDateRange(notice.startDate, notice.endDate);

      return `
      <tr data-content-id="${notice.contentId}">
        <td>${index + 1}</td>
        <td><span class="tag ${tagInfo.color}">${tagInfo.label}</span></td>
        <td>${notice.title}</td>
        <td>${formattedDate}</td>
      </tr>
    `;
    })
    .join("");

  addTableRowListeners();
}

function addTableRowListeners() {
  const rows = document.querySelectorAll(
    "#notice-table-body tr[data-content-id]"
  );

  rows.forEach((row) => {
    row.addEventListener("click", () => {
      const contentId = row.getAttribute("data-content-id");
      if (contentId) {
        window.location.href = `./noticeDetail.html?id=${contentId}`;
      }
    });
  });
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

function formatDateRange(startDate: string, endDate: string): string {
  const start = startDate ? formatDate(startDate) : "";
  const end = endDate ? formatDate(endDate) : "";

  if (start && end) {
    return `${start} ~ ${end}`;
  } else if (start) {
    return start;
  } else if (end) {
    return end;
  } else {
    return "날짜 정보 없음";
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
