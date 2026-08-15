import {
  buildClientSignupRequest,
  buildFreelancerSignupRequest,
  buildFreelancerSocialSignupRequest,
} from "@/features/auth/utils/buildSignupRequest";

const address = {
  sido: "세종",
  sigungu: "",
  roadAddress: "세종 한누리대로 2130",
  addressDetail: "3층",
  zipCode: "30151",
};

describe("회원가입 주소 요청", () => {
  it("클라이언트 가입 요청에 5칸 주소 객체를 담는다", () => {
    expect(buildClientSignupRequest({ address }, []).address).toEqual(address);
  });

  it("프리랜서 일반 가입 요청에 세종시의 빈 sigungu를 유지한다", () => {
    expect(buildFreelancerSignupRequest({ address }, []).address).toEqual(
      address,
    );
  });

  it("프리랜서 소셜 가입 요청에도 같은 주소 계약을 사용한다", () => {
    expect(
      buildFreelancerSocialSignupRequest({ address }, []).address,
    ).toEqual(address);
  });
});
