import { CandidateRerollRequest } from "@/features/matching/components/CandidateRerollRequest";

interface CandidateRerollPageProps { params: Promise<{ projectId: string }>; }

export default async function CandidateRerollPage({ params }: CandidateRerollPageProps) {
  const { projectId } = await params;
  return <CandidateRerollRequest projectId={Number(projectId)} />;
}
