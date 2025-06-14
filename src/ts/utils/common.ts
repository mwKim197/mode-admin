// 정수만 남기고 제거
export function isValidInteger(value: any): boolean {
  if (value === null || value === undefined || value === "") return false;

  const str = String(value).trim();
  return /^\d+$/.test(str); // 0 이상의 정수만 허용 (음수는 제외됨)
}

// 소숫점 첫째자리까지 까지남기고 제거
export function isValidDecimal1(value: any): boolean {
  if (value === null || value === undefined || value === "") return false;

  const str = String(value).trim();
  return /^\d+(\.\d)?$/.test(str); // 정수 또는 소수 첫째 자리까지만 허용
}

// 정수만인지 체크
export function isValidIntegerStrict(value: any): boolean {
  if (value === null || value === undefined || value === '') return false;

  const str = String(value).trim();
  return /^[1-9]\d*$/.test(str); // "03" 은 불허, "0" 또는 "3"은 OK
}

// 소수점 첫째자리인지 체크
export function isValidDecimal1Strict(value: any): boolean {
  if (value === null || value === undefined || value === '') return false;

  const str = String(value).trim();
  return /^([1-9]\d*|0)(\.\d)?$/.test(str);  // "03.5" ❌, "3.5" ✅
}