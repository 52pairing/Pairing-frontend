import { FreelancerProjectDetail } from "@/features/freelancer/myprojects/components/FreelancerProjectDetail";
import { getServerMatchingRequestDetail } from "@/features/matching/services/serverMatchingRequestDetail";

interface FreelancerProjectDetailPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function FreelancerProjectDetailPage({
  params,
}: FreelancerProjectDetailPageProps) {
  const { projectId } = await params;
  const requestId = Number(projectId);
  const initialProject = Number.isInteger(requestId)
    ? await getServerMatchingRequestDetail(requestId)
    : null;

  return <FreelancerProjectDetail initialProject={initialProject} />;
}
