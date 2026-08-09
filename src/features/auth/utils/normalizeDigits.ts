// 전화번호·사업자번호처럼 서버에 숫자만 보내는 값에 사용합니다.
export const normalizeDigits = (value: string) => value.replace(/\D/g, "");
