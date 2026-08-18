import { apiCall } from "@/lib/api";
import {
  checkBusinessNoDuplicate,
  checkEmailDuplicate,
  checkPhoneDuplicate,
} from "@/features/auth/services/signupDuplicateCheck";

jest.mock("@/lib/api", () => ({ apiCall: jest.fn() }));

const mockedApiCall = jest.mocked(apiCall);

afterEach(() => jest.clearAllMocks());

it("checkEmailDuplicate은 email과 role을 그대로 쿼리에 담는다", async () => {
  mockedApiCall.mockResolvedValue({ duplicated: false });

  const result = await checkEmailDuplicate("user@pairing.com", "CLIENT");

  expect(mockedApiCall).toHaveBeenCalledWith(
    "/api/v1/auth/exists/email?email=user%40pairing.com&role=CLIENT",
  );
  expect(result).toEqual({ duplicated: false });
});

it("checkPhoneDuplicate은 하이픈을 제거한 번호로 쿼리를 만든다", async () => {
  mockedApiCall.mockResolvedValue({ duplicated: true });

  await checkPhoneDuplicate("010-1234-5678", "FREELANCER");

  expect(mockedApiCall).toHaveBeenCalledWith(
    "/api/v1/auth/exists/phone?phone=01012345678&role=FREELANCER",
  );
});

it("checkBusinessNoDuplicate은 하이픈을 제거한 사업자번호로 쿼리를 만든다", async () => {
  mockedApiCall.mockResolvedValue({ duplicated: false });

  await checkBusinessNoDuplicate("123-45-67890");

  expect(mockedApiCall).toHaveBeenCalledWith(
    "/api/v1/auth/exists/business-no?businessNo=1234567890",
  );
});
