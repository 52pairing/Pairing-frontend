import { apiBlob, apiCall } from "@/lib/api";
import type { ContractDetailResponse } from "@/features/contract/types/contractDetail";

export const getContractDetail = (contractId: number) =>
  apiCall<ContractDetailResponse>(`/api/v1/contracts/${contractId}`);

export const downloadContractPdf = (contractId: number) =>
  apiBlob(`/api/v1/contracts/${contractId}/pdf`);

export const uploadContractSignature = (signature: Blob) => {
  const formData = new FormData();
  formData.append("file", signature, "signature.png");

  return apiCall<{ fileId: number }>("/api/v1/files?purpose=SIGNATURE", {
    method: "POST",
    body: formData,
  });
};

export const signContract = (
  contractId: number,
  signatureFileId?: number,
) =>
  apiCall<ContractDetailResponse>(`/api/v1/contracts/${contractId}/signature`, {
    method: "POST",
    body: JSON.stringify({
      agreed: true,
      ...(signatureFileId != null ? { signatureFileId } : {}),
    }),
  });
