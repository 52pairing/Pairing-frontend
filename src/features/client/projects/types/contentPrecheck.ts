export type ProjectContentField = "mainTask" | "detailScope";

export type ProjectContentFindingKind =
  | "privacy"
  | "missing"
  | "short"
  | "repetition"
  | "elaboration";

export interface ProjectContentFinding {
  id: string;
  kind: ProjectContentFindingKind;
  field: ProjectContentField | "both";
  title: string;
  description: string;
  maskedValue?: string;
  questions: string[];
}

export interface ProjectContentPrecheckResult {
  findings: ProjectContentFinding[];
  checkedAt: number;
}

export interface PrivacyCandidate {
  type: "email" | "phone" | "account";
  field: ProjectContentField;
  maskedValue: string;
}
