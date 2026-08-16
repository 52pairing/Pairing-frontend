import { apiCall } from "@/lib/api";
import {
  getFreelancerJobRoles,
  getFreelancerWorkConditions,
} from "@/features/freelancer/mypage/services/freelancerResume";

jest.mock("@/lib/api", () => ({ apiCall: jest.fn() }));

// 제네릭 apiCall 은 jest.Mock 으로 다뤄 타입 마찰 없이 반환값을 지정한다.
const mockApiCall = apiCall as unknown as jest.Mock;

describe("freelancerResume 정적 메타 캐시", () => {
  beforeEach(() => {
    mockApiCall.mockReset();
  });

  it("같은 메타를 여러 번 조회해도 apiCall 은 1회만 호출한다(캐시)", async () => {
    mockApiCall.mockResolvedValue([{ code: "FRONTEND", label: "프론트엔드" }]);

    const [a, b, c] = await Promise.all([
      getFreelancerJobRoles(),
      getFreelancerJobRoles(),
      getFreelancerJobRoles(),
    ]);

    expect(mockApiCall).toHaveBeenCalledTimes(1);
    expect(mockApiCall).toHaveBeenCalledWith("/api/v1/meta/job-roles");
    // 캐시된 동일 프로미스 결과를 공유한다.
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it("조회 실패 시 캐시를 비워 다음 호출에서 재조회한다", async () => {
    // 이 테스트는 위와 다른 게터(work-conditions)를 써서 캐시 오염을 피한다.
    mockApiCall.mockRejectedValueOnce(new Error("네트워크 오류"));
    await expect(getFreelancerWorkConditions()).rejects.toThrow("네트워크 오류");

    mockApiCall.mockResolvedValueOnce({
      workStyles: [],
      workForms: [],
      payUnits: [],
      periodUnits: [],
      skillLevels: [],
    });
    const result = await getFreelancerWorkConditions();

    expect(result).toEqual({
      workStyles: [],
      workForms: [],
      payUnits: [],
      periodUnits: [],
      skillLevels: [],
    });
    // 실패로 캐시가 비워졌으므로 재조회가 일어나 총 2회 호출된다.
    expect(mockApiCall).toHaveBeenCalledTimes(2);
  });
});
