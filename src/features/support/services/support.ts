import { apiCall } from "@/lib/api";

import type {
  ChatbotQuotaResponse,
  InquiryPageResponse,
  InquiryResponse,
  InquiryStatus,
  InquiryUploadedFile,
  CreateInquiryRequest,
  CreateInquiryResponse,
} from "../types/support";

export const getChatbotQuota = () =>
  apiCall<ChatbotQuotaResponse>("/api/v1/support/chatbot/quota");

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
  formData.append("purpose", "INQUIRY_ATTACHMENT");

  return apiCall<InquiryUploadedFile>("/api/v1/files", {
    method: "POST",
    body: formData,
  });
};

export const deleteInquiryFile = (fileId: number) =>
  apiCall<null>(`/api/v1/files/${fileId}`, { method: "DELETE" });

export const createInquiry = (request: CreateInquiryRequest) =>
  apiCall<CreateInquiryResponse>("/api/v1/support/inquiries", {
    method: "POST",
    body: JSON.stringify(request),
  });
