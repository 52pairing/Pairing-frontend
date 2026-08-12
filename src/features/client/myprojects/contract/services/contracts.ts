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

export const getClientContracts = (page = 0, size = 100) => {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  return apiCall<ClientContractPage>(`/api/v1/contracts?${query}`);
};

export const getAllClientContracts = async () => {
  const firstPage = await getClientContracts();
  if (firstPage.totalPages <= 1) return firstPage.content;

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      getClientContracts(index + 1),
    ),
  );

  return [firstPage, ...remainingPages].flatMap((page) => page.content);
};
