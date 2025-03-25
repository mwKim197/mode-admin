export function initNotice() {
  console.log("✅ notice.ts 로드됨");

  //데쉬보드로 이동
  document.getElementById("dashboard-button")?.addEventListener("click", () => {
    location.href = "/html/dashboard.html"; // 데쉬보드로 이동
  });
  const listContainer = document.getElementById("notice-list");

  if (!listContainer) {
    console.error("❌ 필수 요소가 없습니다.");
    return;
  }

  // ✅ 목록 렌더링
  function renderList(data: any[]) {

    if (listContainer === null) return;
    listContainer.innerHTML = ""; // 초기화

    data.forEach((notice) => {
      const div = document.createElement("div");
      div.className = "p-4 border rounded mb-2 hover:bg-gray-100 flex justify-between items-center";
      div.setAttribute("data-id", notice.contentId);

      const date = new Date(notice.timestamp).toLocaleDateString("ko-KR");

      div.innerHTML = `
        <div>
          <div class="font-bold">${notice.title}</div>
          <div class="text-sm text-gray-500">${date} / 작성자: ${notice.userId}</div>
        </div>
        <div class="flex space-x-2">
            <button class="edit-btn text-blue-600 underline" data-id="${notice.contentId}">수정</button>
            <button class="delete-btn text-red-600 underline" data-id="${notice.contentId}">삭제</button>
        </div>
      `;

      listContainer.appendChild(div);
    });
  }

  // ✅ 공지 데이터 가져온 후 이벤트도 바인딩
  async function fetchNotices() {
    try {
      const res = await fetch("https://api.narrowroad-model.com/model_home_page?func=get-posts&contentType=notice");
      const data = await res.json();
      renderList(data);
      bindActionButtons(); // ✅ 버튼 이벤트 등록
    } catch (err) {
      console.error("❌ 공지사항 불러오기 실패", err);
    }
  }

// ✅ 수정/삭제 버튼 이벤트 등록
  function bindActionButtons() {
    // 수정
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation(); // 부모 클릭 막기
        const id = (e.target as HTMLElement).getAttribute("data-id");
        if (id) location.href = `/html/notice-edit.html?id=${id}`;
      });
    });

    // 삭제
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation(); // 부모 클릭 막기
        const id = (e.target as HTMLElement).getAttribute("data-id");
        if (!id) return;

        const confirmDelete = confirm("정말 삭제하시겠습니까?");
        if (!confirmDelete) return;

        try {
          // 실제 삭제 처리 (DELETE API로 바꿔줘야 함)
          const res = await fetch(`https://api.narrowroad-model.com/model_home_page?func=delete-post&contentType=notice&contentId=${id}`, {
            method: "DELETE",
          });

          if (res.ok) {
            alert("삭제 완료");
            fetchNotices(); // 목록 다시 불러오기
          } else {
            alert("삭제 실패");
          }
        } catch (err) {
          console.error("❌ 삭제 요청 실패", err);
        }
      });
    });
  }


  // ✅ 페이지 로드시 공지사항 가져오기
  fetchNotices();
}
