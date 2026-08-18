import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FreelancerPaymentMethods } from "@/features/freelancer/mypage/components/FreelancerPaymentMethods";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { getBanks, getCardCompanies } from "@/features/auth/services/signupMeta";
import {
  getMyPaymentMethods,
  updateMyCard,
} from "@/features/payment/services/settlementPayment";
import { ApiException } from "@/lib/api";
import type { AccountPaymentMethod } from "@/features/payment/types/payment";

const mockToastError = jest.fn();
const mockToastSuccess = jest.fn();

jest.mock("@/features/freelancer/mypage/components/FreelancerMyPageLayout", () => ({
  FreelancerMyPageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock("@/features/auth/components/ProfileUpdateVerificationModal", () => ({
  ProfileUpdateVerificationModal: ({
    open,
    onVerified,
  }: {
    open: boolean;
    onVerified: () => void;
  }) => (open ? <button onClick={onVerified}>인증 완료 처리</button> : null),
}));
jest.mock("@/features/auth/hooks/useCurrentUser", () => ({ useCurrentUser: jest.fn() }));
jest.mock("@/features/common/hooks/useToast", () => ({
  useToast: () => ({ error: mockToastError, success: mockToastSuccess }),
}));
jest.mock("@/features/auth/services/signupMeta", () => ({
  getBanks: jest.fn(),
  getCardCompanies: jest.fn(),
}));
jest.mock("@/features/payment/services/settlementPayment", () => ({
  getMyPaymentMethods: jest.fn(),
  updateMyCard: jest.fn(),
  updateMyBankAccount: jest.fn(),
}));

const mockedUseCurrentUser = jest.mocked(useCurrentUser);
const mockedGetCardCompanies = jest.mocked(getCardCompanies);
const mockedGetBanks = jest.mocked(getBanks);
const mockedGetMyPaymentMethods = jest.mocked(getMyPaymentMethods);
const mockedUpdateMyCard = jest.mocked(updateMyCard);

const cardMethod: AccountPaymentMethod = {
  paymentMethodId: 1,
  methodType: "CARD",
  displayName: "신한카드",
  cardBrand: "신한카드",
  cardCompany: "SHINHAN",
  cardLast4: "1234",
  cardHolder: "김프리",
  bankName: null,
  accountLast4: null,
  accountHolder: null,
  isDefault: true,
};

beforeEach(() => {
  mockedUseCurrentUser.mockReturnValue({
    accountId: 1,
    email: "user@pairing.com",
    role: "FREELANCER",
    name: "김프리",
    companyName: null,
    tempPassword: false,
  });
  mockedGetMyPaymentMethods.mockResolvedValue([cardMethod]);
  mockedGetCardCompanies.mockResolvedValue([{ code: "SHINHAN", label: "신한카드" }]);
  mockedGetBanks.mockResolvedValue([{ code: "004", label: "국민은행" }]);
});

afterEach(() => jest.clearAllMocks());

it("미인증 상태에서 수정을 누르면 인증 모달을 띄우고, 인증 후 수정 폼을 연다", async () => {
  const user = userEvent.setup();
  render(<FreelancerPaymentMethods />);

  expect(await screen.findByText("신한카드 · 1234")).toBeInTheDocument();

  await user.click(screen.getAllByRole("button", { name: "수정" })[0]);
  expect(screen.queryByText("카드 수정")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "인증 완료 처리" }));

  expect(await screen.findByText("카드 수정")).toBeInTheDocument();
});

it("카드 저장 중 재인증(AU_006)이 필요하면 인증 모달을 다시 띄운다", async () => {
  mockedUpdateMyCard.mockRejectedValue(
    new ApiException("AU_006", "인증이 만료되었습니다.", 401),
  );
  const user = userEvent.setup();
  render(<FreelancerPaymentMethods />);

  await user.click((await screen.findAllByRole("button", { name: "수정" }))[0]);
  await user.click(screen.getByRole("button", { name: "인증 완료 처리" }));
  await screen.findByText("카드 수정");

  await user.selectOptions(screen.getByRole("combobox"), "SHINHAN");
  await user.type(screen.getByPlaceholderText("카드 번호를 입력해 주세요"), "1234123412341234");

  await user.click(screen.getByRole("button", { name: "수정하기" }));

  await waitFor(() => expect(mockedUpdateMyCard).toHaveBeenCalledTimes(1));
  expect(await screen.findByRole("button", { name: "인증 완료 처리" })).toBeInTheDocument();
});
