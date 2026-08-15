export interface WrittenReview {
  reviewId: number;
  contractId: number;
  projectTitle: string;
  reviewerName: string;
  reviewerRole: "CLIENT" | "FREELANCER";
  score: number;
  content: string | null;
  createdAt: string;
}

export interface PendingReview {
  contractId: number;
  projectTitle: string;
  counterpartName: string;
  completedAt: string;
}

export interface CreateReviewRequest {
  contractId: number;
  counterpart: { score: number; content?: string | null };
  site: { score: number; content?: string | null };
}

export interface ReviewPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ReviewSummary {
  averageScore: number | null;
  reviewCount: number;
  grade: string;
}
