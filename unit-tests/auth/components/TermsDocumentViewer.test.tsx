import { render, screen } from "@testing-library/react";

import { TermsDocumentViewer } from "@/features/auth/components/TermsDocumentViewer";
import { getTermsDocuments } from "@/features/auth/services/termsDocuments";
import { ApiException } from "@/lib/api";
import type { SignupTermsItem } from "@/features/auth/types/signupApiTypes";

jest.mock("@/features/auth/services/termsDocuments", () => ({
  getTermsDocuments: jest.fn(),
}));

const mockedGetTermsDocuments = jest.mocked(getTermsDocuments);

const AGREEMENT: SignupTermsItem = {
  termsId: 1,
  code: "TOS",
  type: "AGREEMENT",
  title: "이용약관",
  version: "1",
  required: true,
  effectiveAt: "2026-01-01",
  content: "약관 내용입니다.",
};
const POLICY: SignupTermsItem = {
  ...AGREEMENT,
  termsId: 2,
  code: "PRIVACY",
  type: "POLICY",
  title: "개인정보처리방침",
  content: "개인정보 내용입니다.",
};

afterEach(() => jest.clearAllMocks());

it("role의 AGREEMENT 문서만 불러와 보여준다", async () => {
  mockedGetTermsDocuments.mockResolvedValue([AGREEMENT, POLICY]);

  render(<TermsDocumentViewer role="CLIENT" />);

  expect(await screen.findByText("이용약관")).toBeInTheDocument();
  expect(screen.queryByText("개인정보처리방침")).not.toBeInTheDocument();
  expect(mockedGetTermsDocuments).toHaveBeenCalledWith("CLIENT");
  expect(screen.getByRole("heading", { name: "클라이언트 이용약관" })).toBeInTheDocument();
});

it("policyOnly면 POLICY 문서만 보여준다", async () => {
  mockedGetTermsDocuments.mockResolvedValue([AGREEMENT, POLICY]);

  render(<TermsDocumentViewer role="FREELANCER" policyOnly />);

  expect(await screen.findByText("개인정보처리방침")).toBeInTheDocument();
  expect(screen.queryByText("이용약관")).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "개인정보 처리방침" })).toBeInTheDocument();
});

it("조회에 실패하면 오류 메시지를 보여준다", async () => {
  mockedGetTermsDocuments.mockRejectedValue(
    new ApiException("AU_020", "약관 문서 조회에 실패했습니다.", 500),
  );

  render(<TermsDocumentViewer role="CLIENT" />);

  expect(await screen.findByText("약관 문서 조회에 실패했습니다.")).toBeInTheDocument();
});

it("표시할 문서가 없으면 안내 문구를 보여준다", async () => {
  mockedGetTermsDocuments.mockResolvedValue([]);

  render(<TermsDocumentViewer role="CLIENT" />);

  expect(await screen.findByText("표시할 문서가 없습니다.")).toBeInTheDocument();
});
