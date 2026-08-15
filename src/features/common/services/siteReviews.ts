import type { SiteReview } from "@/features/common/types/siteReview";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface SiteReviewsResponse {
  code: string;
  message: string;
  data: SiteReview[];
}

interface SiteReviewsErrorResponse {
  traceId?: string;
}

export async function getSiteReviews(size = 6): Promise<SiteReview[]> {
  if (!API_BASE || size < 1 || size > 20) return [];

  try {
    const response = await fetch(
      `${API_BASE}/api/v1/home/site-reviews?size=${size}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as
        | SiteReviewsErrorResponse
        | null;
      console.error("메인 리뷰 조회 실패", {
        status: response.status,
        traceId: error?.traceId,
      });
      return [];
    }

    const body = (await response.json()) as SiteReviewsResponse;
    return Array.isArray(body.data) ? body.data : [];
  } catch {
    return [];
  }
}
