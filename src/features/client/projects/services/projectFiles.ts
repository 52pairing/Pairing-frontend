import { apiCall } from "@/lib/api";
import type { ProjectUploadedFile } from "@/features/client/projects/types/project";

export const uploadProjectFile = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiCall<ProjectUploadedFile>("/api/v1/files?purpose=PROJECT_FILE", {
    method: "POST",
    body: formData,
  });
};

export const deleteProjectFile = (fileId: number) =>
  apiCall<null>(`/api/v1/files/${fileId}`, { method: "DELETE" });
