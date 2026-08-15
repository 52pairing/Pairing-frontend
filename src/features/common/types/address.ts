// 회원가입과 마이페이지 API가 공통으로 사용하는 5칸 주소입니다.
export interface AddressParts {
  sido: string;
  sigungu: string;
  roadAddress: string;
  addressDetail: string;
  zipCode: string;
}

export const EMPTY_ADDRESS_PARTS: AddressParts = {
  sido: "",
  sigungu: "",
  roadAddress: "",
  addressDetail: "",
  zipCode: "",
};
