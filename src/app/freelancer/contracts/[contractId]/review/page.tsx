import type { Metadata } from "next";

import { FreelancerReviewForm } from "@/features/client/reviews/components/FreelancerReviewForm";

export const metadata: Metadata = {
  title: "리뷰 작성",
  robots: { index: false, follow: false },
};

export default function FreelancerContractReviewPage() {
  return <FreelancerReviewForm />;
}
