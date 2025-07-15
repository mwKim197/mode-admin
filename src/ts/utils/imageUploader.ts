import {UploadResult} from "../types/imge.ts";

// 이미지 업로드 - 2mb, 600x600 제한
export function handleImageUpload(
  inputEl: HTMLInputElement,
  previewEl: HTMLImageElement,
  fileNameEl?: HTMLElement,
  maxWidth = 600,
  maxHeight = 600,
  maxFileSize = 2 * 1024 * 1024 // ✅ 2MB
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const file = inputEl.files?.[0];
    if (!file) return reject("파일이 없습니다.");

    // ✅ 파일 크기 제한 검사
    if (file.size > maxFileSize) {
      inputEl.value = "";
      alert(`❌ 파일 크기는 최대 ${maxFileSize / 1024 / 1024}MB 이하여야 합니다.`);
      return reject("파일 용량 초과");
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;

    img.onload = () => {
      if (img.width > maxWidth || img.height > maxHeight) {
        inputEl.value = "";
        alert(`❌ 이미지 사이즈는 ${maxWidth}x${maxHeight} 이하만 가능합니다.`);
        return reject("이미지 크기 초과");
      }

      // 미리보기 설정
      previewEl.src = url;
      previewEl.style.display = "block";

      if (fileNameEl) {
        fileNameEl.textContent = file.name;
      }

      // base64 추출
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const pureBase64 = dataUrl.replace(/^data:image\/[a-zA-Z]+;base64,/, ""); // ✅ prefix 제거

        previewEl.src = dataUrl; // 미리보기는 prefix 포함
        previewEl.style.display = "block";

        if (fileNameEl) {
          fileNameEl.textContent = file.name;
        }

        resolve({
          base64: pureBase64,          // ✅ prefix 제거한값
          fileName: file.name,
          dataUrl,                  // ✅ 동일 (alias)
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };

    img.onerror = () => reject("이미지 로드 실패");
  });
}
