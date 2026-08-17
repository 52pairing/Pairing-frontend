import { notFound } from "next/navigation";

import { CandidateProfile } from "@/features/matching/components/CandidateProfile";
import { getServerCandidateProfile } from "@/features/matching/services/serverCandidateProfile";

interface CandidateProfilePageProps {
  params: Promise<{ projectId: string; candidateId: string }>;
}

export default async function CandidateProfilePage({ params }: CandidateProfilePageProps) {
  const { projectId, candidateId } = await params;
  const parsedProjectId = Number(projectId);
  const parsedCandidateId = Number(candidateId);
  if (
    !Number.isInteger(parsedProjectId) ||
    parsedProjectId <= 0 ||
    !Number.isInteger(parsedCandidateId) ||
    parsedCandidateId <= 0
  )
    notFound();

  const initialProfile = await getServerCandidateProfile(parsedCandidateId);

  return (
    <CandidateProfile
      projectId={parsedProjectId}
      candidateId={parsedCandidateId}
      initialProfile={initialProfile}
    />
  );
}
