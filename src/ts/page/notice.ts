import SunEditor from "suneditor";
import "suneditor/dist/css/suneditor.min.css";
import plugins from "suneditor/src/plugins";
import {addClickDelay, addClickDelayToSelector} from "../utils/click.ts";
import {apiDelete, apiGet, apiPost, apiPut} from "../api/apiHelpers.ts";

export function initNotice() {
  console.log("✅ notice.ts 로드됨");
  const editorTarget = document.getElementById("notice-editor");
  const saveButton = document.getElementById("save-button");
  const titleInput = document.getElementById("notice-title") as HTMLInputElement;
  const startDateInput = document.getElementById("start-date") as HTMLInputElement;
  const endDateInput = document.getElementById("end-date") as HTMLInputElement;
  const listButton = document.getElementById("list-button");
  const startListDate = document.getElementById("start-list-date") as HTMLInputElement;
  const endListDate = document.getElementById("end-list-date") as HTMLInputElement;
  const noticeTypeSelect = document.getElementById("noticeType") as HTMLSelectElement;
  const adminType = document.getElementById("adminType") as HTMLDivElement;
  const startList = startListDate.value;
  const endList = endListDate.value;

  // 조회 리스트
  let isEditMode = false;
  let editContentId: string | null = null;
  let noticeList: any[] = [];  // 🔥 전체 공지사항 리스트 저장
  
  // 파라미터 가져오기
  function getParamId(key: string): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  }

  const boardType  = getParamId("type") || "notice";

  if (boardType === "admin" && adminType) {
    adminType.style.display = "block"; // ✅ admin일 때만 보이게
  }

  const titleElement = document.getElementById("page-title");

  if (titleElement) {
    let titleText = "";
    switch (boardType) {
      case "notice":
        titleText = "공지사항 등록";
        break;
      case "store":
        titleText = "설치 매장 등록";
        break;
      case "news":
        titleText = "언론 보도 등록";
        break;
      case "machine":
        titleText = "머신 설명서 등록";
        break;
      case "admin":
        titleText = "관리자 공지사항 등록";
        break;  
      default:
        titleText = "게시글 등록";
    }

    titleElement.textContent = titleText;
  }

  if (!editorTarget || !saveButton) {
    console.error("❌ 요소를 찾을 수 없습니다.");
    return;
  }

  // ✅ 에디터 인스턴스 생성
  const editor = SunEditor.create(editorTarget, {
    height: "800px",
    plugins,
    buttonList: [
      ["undo", "redo"],
      ["bold", "underline", "italic"],
      ["image"],
    ],
  });

  if (!listButton) {
    console.error("❌ list-button 요소를 찾을 수 없습니다.");
    return;
  }


  addClickDelay(listButton as HTMLButtonElement, async () => {
    const startList = startListDate.value;
    const endList = endListDate.value;

    if (startList > endList) {
      alert("⚠️ 날짜를 확인해 주세요.");
      return;
    }

    await fetchNotices(startList, endList); // ✅ 목록 다시 조회

  });

  if (!saveButton) {
    console.error("❌ save-button 요소를 찾을 수 없습니다.");
    return;
  }

  addClickDelay(saveButton as HTMLButtonElement, async () => {
    const title = titleInput.value.trim();
    const contentHtml = editor.getContents(false);
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const startList = startListDate.value;
    const endList = endListDate.value;
    const noticeType = noticeTypeSelect?.value || null;

    if (!title || !contentHtml) {
      alert("⚠️ 제목과 내용을 모두 입력해주세요.");
      return;
    }

    if (startDate > endDate) {
      alert("⚠️ 날짜를 확인해 주세요.");
      return;
    }

    const dom = new DOMParser().parseFromString(contentHtml, "text/html");
    const imgTags = Array.from(dom.querySelectorAll("img"));
    const base64Images: string[] = [];

    for (const img of imgTags) {
      const src = img.getAttribute("src");
      if (src?.startsWith("data:image")) {
        base64Images.push(src.split(",")[1]);
      }
    }

    const func = isEditMode ? `update-post&contentId=${editContentId}` : "create-post";

    const payload = {
      title,
      startDate,
      endDate,
      content: contentHtml,
      images: base64Images,
      contentType: boardType,
      ...(boardType === "admin" && {noticeType}),
      ...(isEditMode && { contentId: Number(editContentId) }),
    };

    try {
      let res;
      if (isEditMode) {
        res = await apiPut(`/model_home_page?func=${func}&contentType=${boardType}`, payload);
      } else {
        res = await apiPost(`/model_home_page?func=${func}&contentType=${boardType}`, payload);
      }

      if (res.ok) {
        alert(isEditMode ? "✅ 수정 완료!" : "✅ 등록 완료!");
        isEditMode = false;
        editContentId = null;
        await fetchNotices(startList, endList); // ✅ 목록 다시 조회
        // 등록 폼 초기화 (원하면)
      } else {
        const err = await res.json();
        alert(`❌ 저장 실패: ${err.message}`);
      }
    } catch (err) {
      console.error("❌ 저장 오류:", err);
      alert("서버 오류로 저장에 실패했습니다.");
    }
  });

  // 리스트 조회
  const listContainer = document.getElementById("notice-list");

  if (!listContainer) {
    console.error("❌ 필수 요소가 없습니다.");
    return;
  }

  // ✅ 목록 렌더링
  function renderList(data: any[]) {

    if (listContainer === null) return;
    listContainer.innerHTML = ""; // 초기화

    if (data.length > 0) {
      data.forEach((notice) => {
        const tr = document.createElement("tr");

        const date = new Date(notice.timestamp).toLocaleDateString("ko-KR");
        const startDate = notice.startDate ? notice.startDate : "noDate";
        const endDate = notice.startDate ? notice.startDate : "noDate";

        tr.innerHTML = `
          <td>
            ${notice.title}
          </td>
          <td>
            ${startDate}
          </td>
          <td>
            ${endDate}
          </td>
          <td>
            ${date}
          </td>
          <td>
            <button class="edit-btn" data-id="${notice.contentId}">수정</button>
          </td>
          <td> 
            <button class="delete-btn" data-id="${notice.contentId}">삭제</button>
          </td>  
      `;

        listContainer.appendChild(tr);
      });
    } else {
      const tr = document.createElement("tr");
      tr.innerHTML = `
          <td colspan="7" style="padding:2rem 0 0;">표시할 공지사항이 없습니다.</td> `
      listContainer.appendChild(tr);
    }
  }

  // ✅ 공지 데이터 가져온 후 이벤트도 바인딩
  async function fetchNotices(startList:string, endList:string) {
    try {
      let res;
      if (startList != null && endList != null) {
        res = await apiGet(`/model_home_page?func=get-posts&contentType=${boardType}&startDate=${startList}&endDate=${endList}`);
      } else {
        res = await apiGet(`/model_home_page?func=get-posts&contentType=${boardType}`);
      }

      const data = await res.json();

      noticeList = data;
      renderList(data);
      bindActionButtons(); // ✅ 버튼 이벤트 등록
    } catch (err) {
      console.error("❌ 공지사항 불러오기 실패", err);
    }
  }

// ✅ 수정/삭제 버튼 이벤트 등록
  function bindActionButtons() {

    // 수정공통처리
    addClickDelayToSelector(".edit-btn", async (e) => {
      e.stopPropagation();
      const id = (e.target as HTMLElement).getAttribute("data-id");
      if (!id) return;

      // ✅ 현재 리스트 데이터에서 해당 글 찾기
      const notice = noticeList.find(item => item.contentId === Number(id));
      if (!notice) {
        alert("게시글을 찾을 수 없습니다.");
        return;
      }

      // ✅ 상단 폼에 데이터 주입
      titleInput.value = notice.title || "";
      startDateInput.value = notice.startDate || "";
      endDateInput.value = notice.endDate || "";
      editor.setContents(notice.content || "");

      // ✅ 타입 select 박스 값 세팅
      if (noticeTypeSelect && notice.noticeType) {
        noticeTypeSelect.value = notice.noticeType;
      }

      // ✅ 수정 모드 활성화
      isEditMode = true;
      editContentId = id;
    });

    // 삭제 공통처리
    addClickDelayToSelector(".delete-btn", async (e) => {
      const startList = startListDate.value;
      const endList = endListDate.value;
      e.stopPropagation(); // 부모 클릭 막기
      const id = (e.target as HTMLElement).getAttribute("data-id");
      if (!id) return;

      const confirmDelete = confirm("정말 삭제하시겠습니까?");
      if (!confirmDelete) return;

      try {
        // 실제 삭제 처리 (DELETE API로 바꿔줘야 함)
        const res = await apiDelete(`/model_home_page?func=delete-post&contentType=${boardType}&contentId=${id}`);

        if (res.ok) {
          alert("삭제 완료");
          await fetchNotices(startList, endList); // 목록 다시 불러오기
        } else {
          alert("삭제 실패");
        }
      } catch (err) {
        console.error("❌ 삭제 요청 실패", err);
      }
    });

  }

  // ✅ 페이지 로드시 공지사항 가져오기
  fetchNotices(startList, endList);
}
