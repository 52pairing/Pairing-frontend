import { apiCall } from "@/lib/api";
import {
  getFreelancerGradeCriteria,
  getMyGrade,
} from "@/features/freelancer/mypage/services/grade";

jest.mock("@/lib/api", () => ({ apiCall: jest.fn() }));

const mockedApiCall = jest.mocked(apiCall);

afterEach(() => jest.clearAllMocks());

it("getMyGrade는 null로 내려온 필드를 기본값으로 채운다", async () => {
  mockedApiCall.mockResolvedValue({
    grade: "JUNIOR",
    label: "주니어",
    completedProjectCount: null,
    ratingAverage: null,
    nextGrade: null,
    nextGradeGuide: null,
    checkedGuide: "2026-08-01 기준",
  });

  const result = await getMyGrade();

  expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/grades/me");
  expect(result).toEqual({
    grade: "JUNIOR",
    label: "주니어",
    completedProjectCount: 0,
    ratingAverage: null,
    nextGrade: null,
    nextGradeGuide: null,
    checkedGuide: "2026-08-01 기준",
  });
});

it("getFreelancerGradeCriteria는 null 응답을 빈 배열로 바꾼다", async () => {
  mockedApiCall.mockResolvedValue(null);

  const result = await getFreelancerGradeCriteria();

  expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/grades?role=FREELANCER");
  expect(result).toEqual([]);
});
