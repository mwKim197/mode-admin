import SunEditor from "suneditor";
import "suneditor/dist/css/suneditor.min.css";
import plugins from "suneditor/src/plugins";
import {fetchWithAuth} from "./api.ts";


export function initNoticeEdit() {
  console.log("✅ notice-edit.ts 로드됨");
  const editorTarget = document.getElementById("notice-editor");
  const saveButton = document.getElementById("save-button");
  const titleInput = document.getElementById("notice-title") as HTMLInputElement;

  // 공지사항 목록으로 이동버튼
  document.getElementById("list-button")?.addEventListener("click", () => {
    location.href = "/html/notice.html"; // 실제 목록 페이지 경로로 설정
  });

  if (!editorTarget || !saveButton) {
    console.error("❌ 요소를 찾을 수 없습니다.");
    return;
  }

  // 파라미터 가져오기
  function getParamId(): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  const postId = getParamId();

  if (postId) {
    // 수정 모드
    fetchWithAuth(`/model_home_page?func=get-post&contentType=notice&contentId=${postId}`)
        .then(res => res.json())
        .then(notice => {
          if (!notice) {
            alert("❌ 해당 공지사항을 찾을 수 없습니다.");
            return;
          }

          // 에디터와 입력값에 기존 데이터 설정
          titleInput.value = notice.title;
          editor.setContents(notice.content);
        })
        .catch(err => {
          console.error("❌ 단건 조회 실패:", err);
          alert("공지사항 정보를 불러오는데 실패했습니다.");
        });
  }


  // ✅ 에디터 인스턴스 생성
  const editor = SunEditor.create(editorTarget, {
    height: "400px",
    plugins,
    buttonList: [
      ["undo", "redo"],
      ["bold", "underline", "italic"],
      ["image"],
    ],
  });

  // 저장버튼 동작
  saveButton.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const contentHtml = editor.getContents(false);

    if (!title || !contentHtml) {
      alert("⚠️ 제목과 내용을 모두 입력해주세요.");
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

    const func = postId ? `update-post&contentId=${postId}` : "create-post";
    const methodType = postId ? "PUT" : "POST";
    const payload = {
      title,
      content: contentHtml,
      images: base64Images,
      contentType: "notice",
      ...(postId && { contentId: Number(postId) }),
    };

    try {
      const res = await fetchWithAuth(`/model_home_page?func=${func}&contentType=notice`, {
        method: methodType,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("✅ 저장 완료!");
        location.href = "/html/notice.html";
      } else {
        const err = await res.json();
        alert(`❌ 저장 실패: ${err.message}`);
      }
    } catch (err) {
      console.error("❌ 저장 오류:", err);
      alert("서버 오류로 저장에 실패했습니다.");
    }
  });
}
