import type {
  PrivacyCandidate,
  ProjectContentField,
} from "@/features/client/projects/types/contentPrecheck";

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_PATTERN = /(?<!\d)01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}(?!\d)/g;
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
