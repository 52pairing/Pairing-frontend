import { apiCall } from "@/lib/api";

import type {
  ChatbotQuotaResponse,
  ChatbotMessage,
  ChatbotQuestionRequest,
  InquiryPageResponse,
  InquiryResponse,
  InquiryStatus,
  InquiryUploadedFile,
  CreateInquiryRequest,
  CreateInquiryResponse,
} from "../types/support";

export const getChatbotQuota = () =>
  apiCall<ChatbotQuotaResponse>("/api/v1/support/chatbot/quota");

export const getSuggestedQuestions = () =>
  apiCall<string[]>("/api/v1/support/chatbot/suggested-questions");

export const getChatbotMessages = () =>
  apiCall<ChatbotMessage[]>("/api/v1/support/chatbot/messages");

export const sendChatbotQuestion = (request: ChatbotQuestionRequest) =>
  apiCall<ChatbotMessage>("/api/v1/support/chatbot/questions", {
    method: "POST",
    body: JSON.stringify(request),
  });

export const getMyInquiries = ({
  status,
  page,
  size = 10,
}: {
  status?: InquiryStatus;
  page: number;
  size?: number;
}) => {
  const query = new URLSearchParams({ page: String(page), size: String(size) });
  if (status) query.set("status", status);

  return apiCall<InquiryPageResponse>(
    `/api/v1/support/inquiries/mine?${query.toString()}`,
  );
};

export const getInquiry = (inquiryId: number) =>
  apiCall<InquiryResponse>(`/api/v1/support/inquiries/${inquiryId}`);

export const uploadInquiryFile = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiCall<InquiryUploadedFile>(
    "/api/v1/files?purpose=INQUIRY_ATTACHMENT",
    {
      method: "POST",
      body: formData,
    },
  );
};

export const deleteInquiryFile = (fileId: number) =>
  apiCall<null>(`/api/v1/files/${fileId}`, { method: "DELETE" });

export const createInquiry = (request: CreateInquiryRequest) =>
  apiCall<CreateInquiryResponse>("/api/v1/support/inquiries", {
    method: "POST",
    body: JSON.stringify(request),
  });
