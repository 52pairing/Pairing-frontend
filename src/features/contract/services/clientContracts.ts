import { getContracts } from "@/features/contract/services/contracts";

export const getClientProjectContracts = (
  projectId: number,
  page = 0,
  size = 10,
) => getContracts({ tab: "ALL", projectId, page, size });

const getClientContracts = (page = 0, size = 100) =>
  getContracts({ tab: "ALL", page, size });

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
