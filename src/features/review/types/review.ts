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
