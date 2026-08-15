// 숫자만 남기고 010-0000-0000 형태로 자동 하이픈 처리

export const formatPhoneNumber = (value: string) => {
  const numbers = value.replace(/\D/g, "").slice(0, 11);

  if (numbers.length > 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  }
  if (numbers.length > 3) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  }
  return numbers;
};
