export function isValidNumber(value: any): boolean {
  if (value === null || value === undefined || value === '') return false;

  const num = parseFloat(value);
  if (isNaN(num)) return false;

  // 소수점 둘째 자리 이상인지 검사
  const decimalPart = String(value).split(".")[1];
  return !(decimalPart && decimalPart.length > 1);


}
