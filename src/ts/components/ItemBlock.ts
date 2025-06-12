import {validateMenuItemsByType} from "../utils/validation.ts";

export type ItemType = "coffee" | "garucha" | "syrup" | "";

export interface ItemData {
  type: ItemType;
  [key: string]: any;
}

export function createItemBlock(index: number, itemData?: ItemData): HTMLElement {
  const type: ItemType = itemData?.type || "";

  const wrapper = document.createElement("div");
  wrapper.className = "boxStyle gr mb20 item";

  wrapper.innerHTML = `
    <h2 class="mb10">${index + 1}항목</h2>
    <p class="fs14">타입</p>
    <div class="btnFlex mb20">
      <select class="popup-select mb0 item-type-select">
        <option value="">선택</option>
        <option value="coffee" ${type === "coffee" ? "selected" : ""}>커피</option>
        <option value="garucha" ${type === "garucha" ? "selected" : ""}>가루차</option>
        <option value="syrup" ${type === "syrup" ? "selected" : ""}>시럽</option>
      </select>
      <button class="btn red delete-btn">삭제</button>
    </div>
    ${getDetailHTML(type, itemData)}
  `;

  // 삭제 버튼
  wrapper.querySelector(".delete-btn")?.addEventListener("click", () => wrapper.remove());

  // 타입 변경 → 초기값으로 새로 렌더링
  const selectEl = wrapper.querySelector(".item-type-select") as HTMLSelectElement;
  selectEl.addEventListener("change", () => {
    const newType = selectEl.value as ItemType;
    const container = wrapper.parentElement!;
    const newBlock = createItemBlock(index, { type: newType }); // ⚠️ 초기화된 폼
    container.replaceChild(newBlock, wrapper);
  });

  attachValidationEvents(wrapper); // ✅ 여기서 호출

  return wrapper;
}

// 📌 type에 따라 input 구성
function getDetailHTML(type: ItemType, data: any = {}): string {
  if (type === "coffee") {
    return `
      <div class="input-group col mb20">
        <div><p class="fs14">원두 1</p><input type="text" value="${data.value1 || ""}" /></div>
        <div><p class="fs14">원두 2</p><input type="text" value="${data.value2 || ""}" /></div>
      </div>
      <div class="input-group col">
        <div><p class="fs14">추출량</p><input type="text" value="${data.value3 || ""}" /></div>
        <div><p class="fs14">온수</p><input type="text" value="${data.value4 || ""}" /></div>
      </div>
    `;
  }

  if (type === "garucha") {
    return `
      <div class="input-group col mb20">
        <div><p class="fs14">차 종류</p><input type="text" value="${data.value1 || ""}" /></div>
        <div><p class="fs14">추출 시간</p><input type="text" value="${data.value2 || ""}" /></div>
      </div>
      <div class="input-group col">
        <div><p class="fs14">온수</p><input type="text" value="${data.value3 || ""}" /></div>
        <div></div>
      </div>
    `;
  }

  if (type === "syrup") {
    return `
      <div class="input-group col mb20">
        <div><p class="fs14">시럽 종류</p><input type="text" value="${data.value1 || ""}" /></div>
        <div><p class="fs14">펌프 시간</p><input type="text" value="${data.value2 || ""}" /></div>
      </div>
      <div class="input-group col">
        <div><p class="fs14">온수</p><input type="text" value="${data.value3 || ""}" /></div>
        <div><p class="fs14">탄산수</p><input type="text" value="${data.value4 || ""}" /></div>
      </div>
    `;
  }

  return "";
}

// 각 item 벨리데이션체크
function attachValidationEvents(wrapper: HTMLElement) {
  const inputs = wrapper.querySelectorAll("input, select");

  for (const el of inputs) {
    el.addEventListener("blur", () => {
      const itemBlock = wrapper;
      const type = (itemBlock.querySelector(".item-type-select") as HTMLSelectElement).value as ItemType;
      const inputEls = itemBlock.querySelectorAll("input");

      const itemData = {
        type,
        value1: (inputEls[0] as HTMLInputElement)?.value,
        value2: (inputEls[1] as HTMLInputElement)?.value,
        value3: (inputEls[2] as HTMLInputElement)?.value,
        value4: (inputEls[3] as HTMLInputElement)?.value
      };

      // 단일 항목만 검사하는 임시 menuData
      const dummyMenu = {
        items: [itemData]
      };

      const err = validateMenuItemsByType(dummyMenu as any);
      if (err) {
        window.showToast(err, 2000, "error");
      }
    });
  }
}
