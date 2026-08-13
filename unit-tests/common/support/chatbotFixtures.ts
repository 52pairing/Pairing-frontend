import type {
  ChatbotMessage,
  ChatbotQuotaResponse,
} from "@/features/support/types/support";

export const chatbotQuota: ChatbotQuotaResponse = {
  quotaDate: "2026-08-13",
  dailyLimit: 10,
  usedCount: 6,
  remainingCount: 4,
};

export const chatbotHistory: ChatbotMessage[] = [
  {
    sessionId: 40,
    question: "계약은 어디에서 확인하나요?",
    answer: "내 계약 메뉴에서 확인할 수 있습니다.",
    actions: [
      {
        code: "CONTRACTS",
        label: "내 계약 보기",
        url: "/contracts",
      },
    ],
    remainingQuota: 4,
    createdAt: "2026-08-13T09:00:00",
  },
];

export const chatbotResponse = (
  overrides: Partial<ChatbotMessage> = {},
): ChatbotMessage => ({
  sessionId: 41,
  question: "프로젝트는 어떻게 등록하나요?",
  answer: "프로젝트 등록 화면에서 정보를 입력해 주세요.",
  actions: [
    {
      code: "PROJECT_CREATE",
      label: "프로젝트 등록하기",
      url: "/projects/new",
    },
  ],
  remainingQuota: 3,
  createdAt: "2026-08-13T10:00:00",
  ...overrides,
});
