export type SiteReviewWriterRole = "CLIENT" | "FREELANCER";

export interface SiteReview {
  siteReviewId: number;
  writerRole: SiteReviewWriterRole;
  writerName: string;
  score: number;
  content: string | null;
  projectTitle: string | null;
  visibility: "PUBLIC";
  promoted: true;
  createdAt: string;
}
