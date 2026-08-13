import { apiCall } from "@/lib/api";
import type { PendingReview, ReviewPage, WrittenReview } from "@/features/review/types/review";

export const getWrittenReviews = (page = 0, size = 10) =>
  apiCall<ReviewPage<WrittenReview>>(`/api/v1/reviews/written?page=${page}&size=${size}`);

export const getPendingReviews = () =>
  apiCall<PendingReview[]>("/api/v1/reviews/pending");

export const getAllWrittenReviews = async () => {
  const firstPage = await getWrittenReviews();
  if (firstPage.totalPages <= 1) return firstPage.content;
  const pages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) => getWrittenReviews(index + 1)),
  );
  return [firstPage, ...pages].flatMap((page) => page.content);
};
