import { FreelancerProfile } from "@/features/freelancer/mypage/components/FreelancerProfile";
import {
  getServerFreelancerGradeCriteria,
  getServerFreelancerProfile,
  getServerMyGrade,
} from "@/features/freelancer/mypage/services/serverFreelancerProfile";

export default async function FreelancerProfilePage() {
  const [initialProfile, initialGrade, initialGradeCriteria] = await Promise.all([
    getServerFreelancerProfile(),
    getServerMyGrade(),
    getServerFreelancerGradeCriteria(),
  ]);

  return (
    <FreelancerProfile
      initialProfile={initialProfile}
      initialGrade={initialGrade}
      initialGradeCriteria={initialGradeCriteria}
    />
  );
}
