import { apiCall } from "@/lib/api";

export interface FreelancerUploadedFile {
  fileId: number;
  originalName: string;
  sizeBytes: number;
}

export type FreelancerFilePurpose = "PROFILE_IMAGE" | "PORTFOLIO";

export const uploadFreelancerFile = (
  file: File,
  purpose: FreelancerFilePurpose,
) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiCall<FreelancerUploadedFile>(`/api/v1/files?purpose=${purpose}`, {
    method: "POST",
    body: formData,
  });
};

export const deleteFreelancerFile = (fileId: number) =>
  apiCall<null>(`/api/v1/files/${fileId}`, { method: "DELETE" });
