import type {
  PrivacyCandidate,
  ProjectContentField,
} from "@/features/client/projects/types/contentPrecheck";

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_PATTERN = /(?<!\d)01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}(?!\d)/g;
const RRN_PATTERN = /(?<!\d)\d{6}[-\s]?[1-4]\d{6}(?!\d)/g;
const ACCOUNT_CONTEXT_PATTERN =
  /(?:계좌(?:번호)?|입금|은행)[^\d\n]{0,12}(\d(?:[\d -]{8,18}\d))/g;
const GROUPED_NUMBER_PATTERN = /(?<!\d)\d{2,6}(?:-\d{2,6}){2,4}(?!\d)/g;

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const maskEmail = (value: string) => {
  const [local, domain] = value.split("@");
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
};

const maskPhone = (value: string) => {
  const digits = digitsOnly(value);
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
};

const maskAccount = (value: string) => `****-****-${digitsOnly(value).slice(-4)}`;

// 주민등록번호는 생년월일·성별·일련번호가 모두 민감하므로 존재만 알리고 전부 마스킹한다.
const maskRRN = () => "******-*******";

// 실제 주민번호는 앞 6자리가 유효한 생년월일(YYMMDD)이다.
// 이 검증으로 13자리 계좌번호가 주민번호로 오분류되는 것을 막는다.
const isLikelyRRN = (value: string) => {
  const digits = digitsOnly(value);
  if (digits.length !== 13) return false;
  const month = Number(digits.slice(2, 4));
  const day = Number(digits.slice(4, 6));
  return month >= 1 && month <= 12 && day >= 1 && day <= 31;
};

const isLikelyAccount = (value: string) => {
  const digits = digitsOnly(value);
  if (digits.length < 10 || digits.length > 16) return false;
  if (/^01[016789]\d{7,8}$/.test(digits)) return false;
  if (/^(19|20)\d{6}$/.test(digits)) return false;
  return true;
};

export function detectPrivacyCandidates(
  field: ProjectContentField,
  text: string,
): PrivacyCandidate[] {
  const candidates: PrivacyCandidate[] = [];
  const occupied = new Set<string>();

  for (const match of text.matchAll(EMAIL_PATTERN)) {
    const value = match[0];
    candidates.push({ type: "email", field, maskedValue: maskEmail(value) });
    occupied.add(value);
  }

  for (const match of text.matchAll(PHONE_PATTERN)) {
    const value = match[0];
    candidates.push({ type: "phone", field, maskedValue: maskPhone(value) });
    occupied.add(value);
  }

  for (const match of text.matchAll(RRN_PATTERN)) {
    const value = match[0];
    if (!isLikelyRRN(value)) continue;
    candidates.push({ type: "rrn", field, maskedValue: maskRRN() });
    occupied.add(value);
  }

  const accountValues = [
    ...Array.from(text.matchAll(ACCOUNT_CONTEXT_PATTERN), (match) => match[1]),
    ...Array.from(text.matchAll(GROUPED_NUMBER_PATTERN), (match) => match[0]),
  ];

  for (const value of new Set(accountValues)) {
    if (!value || occupied.has(value) || !isLikelyAccount(value)) continue;
    candidates.push({
      type: "account",
      field,
      maskedValue: maskAccount(value),
    });
  }

  return candidates;
}
