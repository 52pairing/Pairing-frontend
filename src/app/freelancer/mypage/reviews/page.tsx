import { FreelancerReviews } from "@/features/freelancer/mypage/components/FreelancerReviews";
import {
  getServerPendingReviews,
  getServerReceivedReviews,
  getServerReviewSummary,
} from "@/features/freelancer/mypage/services/serverFreelancerMypage";

export default async function FreelancerReviewsPage() {
  const [initialPendingReviews, initialSummary, initialPage] = await Promise.all([
    getServerPendingReviews(),
    getServerReviewSummary(),
    getServerReceivedReviews(),
  ]);

  return (
    <FreelancerReviews
      initialPendingReviews={initialPendingReviews}
      initialSummary={initialSummary}
      initialPage={initialPage}
    />
  );
}
