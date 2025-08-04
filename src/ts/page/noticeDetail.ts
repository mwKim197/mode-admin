export function initNoticeDetail() {
  console.log("공지사항 상세 페이지 초기화");

  // URL에서 noticeId 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  const noticeId = urlParams.get("id");
}
