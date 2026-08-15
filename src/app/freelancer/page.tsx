import { FreelancerMain } from "@/features/freelancer/components/FreelancerMain";
import { getServerCurrentUser } from "@/features/auth/services/serverCurrentUser";

export default async function FreelancerMainPage() {
  const initialUser = await getServerCurrentUser();
  return <FreelancerMain initialUser={initialUser} />;
}
