export type CandidateMatchStatus = "recommended" | "requested" | "accepted";

export interface CandidateCareer {
  company: string;
  role: string;
  period: string;
  description: string;
}

export interface CandidateProject {
  title: string;
  period: string;
  role: string;
  description: string;
  skills: string[];
}

export interface RecommendedCandidate {
  id: number;
  name: string;
  role: string;
  careerYears: number;
  introduction: string;
  matchScore: number;
  rating: number;
  reviewCount: number;
  level: string;
  availableFrom: string;
  workStyle: string;
  desiredRate: string;
  skills: string[];
  strengths: string[];
  recommendationReasons: string[];
  careers: CandidateCareer[];
  projects: CandidateProject[];
  education: string;
  status: CandidateMatchStatus;
}
