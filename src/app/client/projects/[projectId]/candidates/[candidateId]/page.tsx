import { notFound } from "next/navigation";

import { CandidateProfile } from "@/features/matching/components/CandidateProfile";
import { getRecommendedCandidate } from "@/features/matching/constants/recommendedCandidates";

interface CandidateProfilePageProps { params: Promise<{ projectId: string; candidateId: string }>; }

export default async function CandidateProfilePage({ params }: CandidateProfilePageProps) {
  const { projectId, candidateId } = await params;
  const parsedProjectId = Number(projectId);
  const candidate = getRecommendedCandidate(Number(candidateId));
  if (!Number.isInteger(parsedProjectId) || parsedProjectId <= 0 || !candidate) notFound();
  return <CandidateProfile projectId={parsedProjectId} candidate={candidate} />;
}
