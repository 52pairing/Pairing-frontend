import type { ContractSignature } from "@/features/contract/types/contractDetail";

export const areBothPartiesSigned = (signatures: ContractSignature[]) =>
  (["CLIENT", "FREELANCER"] as const).every((partyRole) =>
    signatures.some(
      (signature) =>
        signature.partyRole === partyRole && signature.status === "SIGNED",
    ),
  );
