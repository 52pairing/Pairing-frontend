import { apiCall } from "@/lib/api";
import type { ClientContractPage } from "@/features/client/myprojects/contract/types/contract";

export const getClientProjectContracts = (
  projectId: number,
  page = 0,
  size = 10,
) => {
  const query = new URLSearchParams({
    projectId: String(projectId),
    page: String(page),
    size: String(size),
  });

  return apiCall<ClientContractPage>(`/api/v1/contracts?${query}`);
};
