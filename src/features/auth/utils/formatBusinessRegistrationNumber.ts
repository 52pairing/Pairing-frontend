// 숫자만 남기고 10자리로 제한 (사업자등록번호, '-' 없이 입력)

export const formatBusinessRegistrationNumber = (value: string) =>
  value.replace(/\D/g, "").slice(0, 10);

export const isValidBusinessRegistrationNumberFormat = (value: string) =>
  /^\d{10}$/.test(value);
