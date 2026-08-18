import { apiCall } from "@/lib/api";
import {
  getFreelancerProfile,
  updateFreelancerProfile,
} from "@/features/freelancer/mypage/services/freelancerProfile";
import type { AddressParts } from "@/features/common/types/address";

jest.mock("@/lib/api", () => ({ apiCall: jest.fn() }));

const mockedApiCall = jest.mocked(apiCall);

const address: AddressParts = {
  sido: "서울",
  sigungu: "강남구",
  roadAddress: "테헤란로 1",
  addressDetail: "1층",
  zipCode: "06134",
};

afterEach(() => jest.clearAllMocks());

it("getFreelancerProfile은 null로 내려온 필드를 기본값으로 채운다", async () => {
  mockedApiCall.mockResolvedValue({
    accountId: 1,
    name: "김프리",
    email: "user@pairing.com",
    phone: null,
    birthDate: null,
    address: null,
    addressParts: null,
    profileImageUrl: null,
    aiMatchingAgreed: false,
    grade: "JUNIOR",
    ratingAverage: null,
    reviewCount: null,
    resumeCompleted: false,
    withdrawable: true,
  });

  const result = await getFreelancerProfile();

  expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/freelancers/me");
  expect(result.reviewCount).toBe(0);
  expect(result.phone).toBeNull();
});

it("updateFreelancerProfile은 PATCH로 변경 사항을 전송한다", async () => {
  mockedApiCall.mockResolvedValue({
    accountId: 1,
    name: "김프리",
    email: "user@pairing.com",
    phone: "01012345678",
    birthDate: null,
    address: "서울 강남구 테헤란로 1 1층",
    addressParts: address,
    profileImageUrl: null,
    aiMatchingAgreed: true,
    grade: "JUNIOR",
    ratingAverage: null,
    reviewCount: 0,
    resumeCompleted: false,
    withdrawable: true,
  });

  const payload = { phone: "01012345678", address, aiMatchingAgreed: true };
  await updateFreelancerProfile(payload);

  expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/freelancers/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
});
