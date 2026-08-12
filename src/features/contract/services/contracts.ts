import { apiBlob, apiCall } from "@/lib/api";
import type { ContractDetailResponse } from "@/features/contract/types/contractDetail";
import type { ContractListPage, ContractListTab } from "@/features/contract/types/contractList";

interface GetContractsParams {
  tab: ContractListTab;
  page?: number;
  size?: number;
  projectId?: number;
}

export const getContracts = ({
  tab,
  page = 0,
  size = 10,
  projectId,
}: GetContractsParams) => {
  const query = new URLSearchParams({
    tab,
    page: String(page),
    size: String(size),
  });

  if (projectId != null) query.set("projectId", String(projectId));

  return apiCall<ContractListPage>(`/api/v1/contracts?${query}`);
};

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
