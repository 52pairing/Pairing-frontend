import { apiCall } from "@/lib/api";
import type { CreateReviewRequest, PendingReview, ReviewPage, ReviewSummary, WrittenReview } from "@/features/review/types/review";

const normalizePage = (page: ReviewPage<WrittenReview>): ReviewPage<WrittenReview> => ({
  ...page,
  content: page.content ?? [],
  page: page.page ?? 0,
  totalElements: page.totalElements ?? 0,
  totalPages: page.totalPages ?? 0,
});

export const getWrittenReviews = (page = 0, size = 10) =>
  apiCall<ReviewPage<WrittenReview>>(`/api/v1/reviews/written?page=${page}&size=${size}`).then(normalizePage);

export const getReceivedReviews = (page = 0, size = 10) =>
  apiCall<ReviewPage<WrittenReview>>(`/api/v1/reviews/received?page=${page}&size=${size}`).then(normalizePage);

export const getReviewSummary = () =>
  apiCall<ReviewSummary>("/api/v1/reviews/summary").then((summary) => ({
    ...summary,
    averageScore: summary.averageScore ?? null,
    reviewCount: summary.reviewCount ?? 0,
  }));

export const getPendingReviews = () =>
  apiCall<PendingReview[] | null>("/api/v1/reviews/pending").then((reviews) => reviews ?? []);

export const createReview = (request: CreateReviewRequest) =>
  apiCall<WrittenReview>("/api/v1/reviews", {
    method: "POST",
    body: JSON.stringify(request),
  });

export const getAllWrittenReviews = async () => {
  const firstPage = await getWrittenReviews();
  if (firstPage.totalPages <= 1) return firstPage.content;
  const pages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) => getWrittenReviews(index + 1)),
  );
  return [firstPage, ...pages].flatMap((page) => page.content);
};
