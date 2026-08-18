import { apiCall } from "@/lib/api";
import {
  deleteFreelancerFile,
  uploadFreelancerFile,
} from "@/features/freelancer/mypage/services/freelancerFiles";

jest.mock("@/lib/api", () => ({ apiCall: jest.fn() }));

const mockedApiCall = jest.mocked(apiCall);

afterEach(() => jest.clearAllMocks());

it("uploadFreelancerFile은 purpose 쿼리와 FormData로 업로드를 요청한다", async () => {
  mockedApiCall.mockResolvedValue({
    fileId: 1,
    originalName: "photo.jpg",
    sizeBytes: 100,
  });
  const file = new File(["x"], "photo.jpg", { type: "image/jpeg" });

  const result = await uploadFreelancerFile(file, "PROFILE_IMAGE");

  expect(mockedApiCall).toHaveBeenCalledWith(
    "/api/v1/files?purpose=PROFILE_IMAGE",
    expect.objectContaining({ method: "POST" }),
  );
  const options = mockedApiCall.mock.calls[0][1] as { body: FormData };
  expect(options.body.get("file")).toBe(file);
  expect(result.fileId).toBe(1);
});

it("deleteFreelancerFile은 파일 ID로 삭제를 요청한다", async () => {
  mockedApiCall.mockResolvedValue(null);

  await deleteFreelancerFile(10);

  expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/files/10", {
    method: "DELETE",
  });
});
