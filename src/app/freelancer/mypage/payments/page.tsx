import { FreelancerPaymentHistory } from "@/features/freelancer/mypage/components/FreelancerPaymentHistory";
import {
  getServerMySettlementSummary,
  getServerMySettlements,
} from "@/features/freelancer/mypage/services/serverFreelancerMypage";

export default async function FreelancerPaymentsPage() {
  const [initialSummary, initialSettlements] = await Promise.all([
    getServerMySettlementSummary(),
    getServerMySettlements(),
  ]);

  return (
    <FreelancerPaymentHistory
      initialSummary={initialSummary}
      initialSettlements={initialSettlements}
    />
  );
}
