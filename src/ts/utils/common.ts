// 정수인 경우만 number, 아니면 null
export function parseValidInteger(value: any): number | null {
  if (value === null || value === undefined || value === "") return null;

  const str = String(value).trim();
  return /^\d+$/.test(str) ? parseInt(str, 10) : null;
}

// 정수 또는 소수 첫째 자리까지 허용
export function parseValidDecimal1(value: any): number | null {
  if (value === null || value === undefined || value === "") return null;

  const str = String(value).trim();
  return /^\d+(\.\d)?$/.test(str) ? parseFloat(str) : null;
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