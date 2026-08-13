import type { InquiryPageResponse, InquiryResponse } from "@/features/support/types/support";

export const pendingInquiry: InquiryResponse = {
  inquiryNo: "IQ-2026-0001",
  inquiryId: 1,
  title: "계약 진행 문의",
  content: "계약 진행 상태를 확인하고 싶습니다.",
  status: "PENDING",
  answer: null,
  answererName: null,
  answeredAt: null,
  files: [{ fileId: 10, originalName: "화면.png", fileUrl: "https://example.com/screen.png" }],
  createdAt: "2026-08-12T10:30:00",
};

export const answeredInquiry: InquiryResponse = {
  ...pendingInquiry,
  inquiryNo: "IQ-2026-0002",
  inquiryId: 2,
  title: "수수료 문의",
  status: "ANSWERED",
  answer: "계약 금액에 따라 수수료가 적용됩니다.",
  answererName: "고객지원 담당자",
  answeredAt: "2026-08-13T14:20:00",
  files: [],
};

export const inquiryPage = (
  content: InquiryResponse[] = [pendingInquiry, answeredInquiry],
  overrides: Partial<InquiryPageResponse> = {},
): InquiryPageResponse => ({
  content,
  page: 0,
  size: 10,
  totalElements: content.length,
  totalPages: 1,
  first: true,
  last: true,
  ...overrides,
});
