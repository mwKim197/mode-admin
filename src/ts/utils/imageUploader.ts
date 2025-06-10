import {UploadResult} from "../types/imge.ts";

export function handleImageUpload(
  inputEl: HTMLInputElement,
  previewEl: HTMLImageElement,
  fileNameEl?: HTMLElement,
  maxWidth = 600,
  maxHeight = 600
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const file = inputEl.files?.[0];
    if (!file) return reject("파일이 없습니다.");

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
        const base64 = (reader.result as string).replace(/^data:image\/png;base64,/, "");
        resolve({ base64, fileName: file.name, dataUrl: reader.result as string });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };

    img.onerror = () => reject("이미지 로드 실패");
  });
}
