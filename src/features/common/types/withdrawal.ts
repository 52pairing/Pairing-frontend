export type WithdrawalBlockerType =
  | "NEGOTIATION"
  | "PROJECT"
  | "SIGN_PENDING_CONTRACT"
  | "CONTRACT"
  | "UNPAID_SETTLEMENT";

export interface WithdrawalBlocker {
  type: WithdrawalBlockerType;
  label: string;
  count: number;
  linkUrl: string;
}

export interface WithdrawalEligibility {
  withdrawable: boolean;
  blockers: WithdrawalBlocker[];
}

export interface WithdrawalRequest {
  agreed: boolean;
  confirmText: string;
  reason?: string;
}
