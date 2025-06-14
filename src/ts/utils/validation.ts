// utils/validation.ts
import { MenuDetail } from "../types/product.ts";
import {isValidDecimal1Strict, isValidIntegerStrict} from "./common.ts";

// 기본 값 체크
export function validateMenuDetail(detail: MenuDetail): string | null {
  if (!detail.no) return "📛 순번을 입력해주세요.";
  if (!detail.name?.trim()) return "📛 메뉴 이름을 입력해주세요.";
  if (!detail.category) return "📛 카테고리를 선택해주세요.";
  const price = detail.price;
  if (!price?.trim() || !isValidIntegerStrict(price)) return "📛 가격을 정수로 입력해주세요.";

  if (detail.cupYn === "no" && !detail.cup) return "📛 컵 종류를 선택해주세요.";
  if (detail.cupYn === "no" && detail.iceYn === "yes" && !isValidDecimal1Strict(detail.iceTime)) return "📛 얼음 시간을 입력해주세요.";
  if (detail.cupYn === "no" && detail.items.length === 0) return "📛 음료상품은 항목을 추가해야합니다.";

  for (let i = 0; i < detail.items.length; i++) {
    const item = detail.items[i];
    if (!item.type) return `📛 ${i + 1}번째 재료의 타입을 선택해주세요.`;
    if (item.type === "coffee" && !(parseFloat(item.value1) > 0 || parseFloat(item.value2) > 0)) {
      return `📛 원두1, 원두2 중 한개의 값은 입력해야합니다.`;
    } else if (item.type !== "coffee") {
      if (!isValidDecimal1Strict(item.value1)) return `📛 ${i + 1}번째 재료의 첫 번째 값을 입력해주세요.`;
      if (!isValidDecimal1Strict(item.value2)) return `📛 ${i + 1}번째 재료의 두 번째 값을 입력해주세요.`;
    }
    if (!isValidDecimal1Strict(item.value3)) return `📛 ${i + 1}번째 재료의 세 번째 값을 입력해주세요.`;
    if (item.type !== "garucha" && !isValidDecimal1Strict(item.value4)) return `📛 ${i + 1}번째 재료의 네 번째 값을 입력해주세요.`;
  }

    return null; // 유효
}

// item 항목 체크 
export function validateMenuItemsByType(detail: MenuDetail): string | null {
  for (let i = 0; i < detail.items.length; i++) {
    const item = detail.items[i];

    // 1~6초 소수 체크 0.1~ 6.0 유효
    const isValidValue = (value: any) => {
      return value >= 1 && value <= 6 && /^[0-9]+(\.[0-9]{1,2})?$/.test(String(value));
    };

    if (item.type === "coffee") {
      if (parseFloat(item.value1) > 0) {
        if (parseFloat(item.value2)) return `☕ 그라인더1 사용 시, 그라인더2는 0이어야 합니다.`;
        if (!isValidValue(item.value1)) return `☕ 그라인더1 값은 1~6 초 범위의 소수여야 합니다.`;
      }

      if (parseFloat(item.value2) > 0) {
        if (parseFloat(item.value1)) return `☕ 그라인더2 사용 시, 그라인더1은 0이어야 합니다.`;
        if (!isValidValue(item.value2)) return `☕ 그라인더2 값은 1~6 초 범위의 소수여야 합니다.`;
      }
    }

    if (item.type === "garucha") {
      if (parseFloat(item.value2) > 0 && parseFloat(item.value3) < parseFloat(item.value2) * 10) {
        return `🍵 가루차 핫워터(${item.value3})는 추출시간(${item.value2})의 10배 이상이어야 합니다.`;
      }
    }

    if (item.type === "syrup") {
      if (parseFloat(item.value3) < 20 && parseFloat(item.value4) < 20) {
        return `🍯 시럽 핫워터 또는 탄산수 중 하나는 20 이상이어야 합니다.`;
      }
    }
  }

  return null;
}


