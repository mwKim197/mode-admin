import SunEditor from "suneditor";
import "suneditor/dist/css/suneditor.min.css";
import plugins from "suneditor/src/plugins";

export function initNotice() {
  console.log("✅ notice.ts 로드됨");

  const editorTarget = document.getElementById("notice-editor");
  const saveButton = document.getElementById("save-button");
  const titleInput = document.getElementById("notice-title") as HTMLInputElement;

  if (!editorTarget || !saveButton) {
    console.error("❌ 요소를 찾을 수 없습니다.");
    return;
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

  // ✅ 저장 버튼 이벤트 등록
  saveButton.addEventListener("click", () => {
    const title = titleInput.value.trim();
    const contentHtml = editor.getContents(false); // 전체 HTML 가져오기

    if (!title || !contentHtml) {
      alert("⚠️ 제목과 내용을 모두 입력해주세요.");
      return;
    }
    const dom = new DOMParser().parseFromString(contentHtml, "text/html");
    const imgTags = Array.from(dom.querySelectorAll("img"));

    const base64Images: string[] = [];

    for (const img of imgTags) {
      const src = img.getAttribute("src");
      if (src && src.startsWith("data:image")) {
        // 👉 "data:image/jpeg;base64," 부분 제거
        const base64Only = src.split(",")[1]; // 콤마 기준으로 base64 데이터만 추출
        if (base64Only) {
          base64Images.push(base64Only);
        }
      }
    }

    const payload = {
      title,
      content: contentHtml,
      images: base64Images,
    };

    console.log("📦 전송 payload", payload);

    // ✅ API 전송
    fetch("https://api.narrowroad-model.com/model_home_page?func=get-posts&contentType=notice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (res.ok) {
          alert("✅ 공지사항 저장 완료!");
        } else {
          const err = await res.json();
          alert(`❌ 저장 실패: ${err.message}`);
        }
      })
      .catch((err) => {
        console.error("❌ 저장 중 오류:", err);
        alert("서버 오류로 저장에 실패했습니다.");
      });
  });
}
