export interface FreelancerMyPageResponse {
  accountId: number;
  name: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  address: string | null;
  profileImageUrl: string | null;
  aiMatchingAgreed: boolean;
  grade: "JUNIOR" | "SENIOR" | "MASTER";
  ratingAverage: number | null;
  reviewCount: number;
  resumeCompleted: boolean;
  withdrawable: boolean;
}

export interface FreelancerProfileUpdateRequest {
  profileFileId?: number;
  phone?: string;
  address?: string;
  aiMatchingAgreed: boolean;
}
