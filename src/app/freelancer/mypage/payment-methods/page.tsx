import { FreelancerPaymentMethods } from "@/features/freelancer/mypage/components/FreelancerPaymentMethods";
import { getServerMyPaymentMethods } from "@/features/freelancer/mypage/services/serverFreelancerMypage";

export default async function FreelancerPaymentMethodsPage() {
  const initialMethods = await getServerMyPaymentMethods();
  return <FreelancerPaymentMethods initialMethods={initialMethods} />;
}
