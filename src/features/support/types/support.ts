export interface ChatbotQuotaResponse {
  dailyLimit: number;
}

export type InquiryStatus = "PENDING" | "ANSWERED";

export interface InquiryFile {
  fileId: number;
  originalName: string;
  fileUrl: string;
}

export interface InquiryResponse {
  inquiryNo: string;
  inquiryId: number;
  title: string;
  content: string;
  status: InquiryStatus;
  answer: string | null;
  answererName: string | null;
  answeredAt: string | null;
  files: InquiryFile[];
  createdAt: string;
  writerName?: string | null;
  writerRole?: string | null;
  writerEmail?: string | null;
}

export interface InquiryPageResponse {
  content: InquiryResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface InquiryUploadedFile {
  fileId: number;
  originalName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
}

export interface CreateInquiryRequest {
  title: string;
  content: string;
  fileIds: number[];
}

export interface CreateInquiryResponse {
  inquiryId: number;
}
