import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InquiryForm } from "@/features/support/components/InquiryForm";
import { createInquiry, deleteInquiryFile, uploadInquiryFile } from "@/features/support/services/support";
import { ApiException } from "@/lib/api";

const replace = jest.fn();
const toastError = jest.fn();

jest.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
jest.mock("@/features/common/components/header/Header", () => ({ Header: () => null }));
jest.mock("@/features/common/hooks/useToast", () => ({
  useToast: () => ({ error: toastError }),
}));
jest.mock("@/features/support/services/support", () => ({
  createInquiry: jest.fn(),
  uploadInquiryFile: jest.fn(),
  deleteInquiryFile: jest.fn(),
}));
jest.mock("@/features/common/components/Modal", () => ({
  ConfirmModal: ({ open, title, confirmText, onConfirm, onClose }: { open: boolean; title: string; confirmText: string; onConfirm: () => void; onClose: () => void }) =>
    open ? <div role="dialog"><p>{title}</p><button type="button" onClick={onClose}>모달 취소</button><button type="button" onClick={onConfirm}>{confirmText}</button></div> : null,
}));

const mockCreateInquiry = jest.mocked(createInquiry);
const mockUploadFile = jest.mocked(uploadInquiryFile);
const mockDeleteFile = jest.mocked(deleteInquiryFile);

const fillRequiredFields = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/문의 제목/), "  계약 문의  ");
  await user.type(screen.getByLabelText(/문의 내용/), "  계약 상태를 확인해 주세요.  ");
};

describe("InquiryForm", () => {
  beforeEach(() => {
    mockCreateInquiry.mockResolvedValue({ inquiryId: 15 });
    mockDeleteFile.mockResolvedValue(null);
  });

  test("필수값을 입력해야 문의 접수 버튼을 활성화한다", async () => {
    const user = userEvent.setup();
    render(<InquiryForm />);
    expect(screen.getByRole("link", { name: "1대1 문의로 돌아가기" })).toHaveAttribute("href", "/support/inquiries");
    const submit = screen.getByRole("button", { name: "문의 접수" });
    expect(submit).toBeDisabled();

    await fillRequiredFields(user);
    expect(submit).toBeEnabled();
    expect(screen.getByText("19/2000")).toBeInTheDocument();
  });

  test("확인 모달에서 취소하면 문의를 접수하지 않는다", async () => {
    const user = userEvent.setup();
    render(<InquiryForm />);
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "문의 접수" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "모달 취소" }));
    expect(mockCreateInquiry).not.toHaveBeenCalled();
  });

  test("첨부파일 없이 문의를 접수하고 완료 화면으로 이동한다", async () => {
    const user = userEvent.setup();
    render(<InquiryForm />);
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "문의 접수" }));
    await user.click(screen.getByRole("button", { name: "접수 하기" }));

    expect(mockCreateInquiry).toHaveBeenCalledWith({
      title: "계약 문의",
      content: "계약 상태를 확인해 주세요.",
      fileIds: [],
    });
    expect(replace).toHaveBeenCalledWith("/support/inquiries/complete?inquiryId=15");
  });

  test("허용된 첨부파일을 업로드한 뒤 반환된 ID로 문의를 접수한다", async () => {
    const user = userEvent.setup();
    const file = new File(["image"], "화면.png", { type: "image/png" });
    mockUploadFile.mockResolvedValue({ fileId: 21, originalName: file.name, url: "https://example.com/21" });
    render(<InquiryForm />);
    await fillRequiredFields(user);
    await user.upload(screen.getByLabelText(/첨부파일/), file);
    expect(screen.getByText("화면.png")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "문의 접수" }));
    await user.click(screen.getByRole("button", { name: "접수 하기" }));

    expect(mockUploadFile).toHaveBeenCalledWith(file);
    expect(mockCreateInquiry).toHaveBeenCalledWith(expect.objectContaining({ fileIds: [21] }));
  });

  test("지원하지 않는 파일은 추가하지 않고 오류를 표시한다", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<InquiryForm />);
    await user.upload(screen.getByLabelText(/첨부파일/), new File(["text"], "메모.txt", { type: "text/plain" }));

    expect(screen.getByRole("alert")).toHaveTextContent("PDF, JPG, JPEG, PNG 파일만 파일당 10MB까지 첨부할 수 있습니다.");
    expect(screen.queryByText("메모.txt")).not.toBeInTheDocument();
  });

  test("문의 접수 실패 시 업로드된 파일을 정리하고 오류를 안내한다", async () => {
    const user = userEvent.setup();
    const file = new File(["pdf"], "자료.pdf", { type: "application/pdf" });
    mockUploadFile.mockResolvedValue({ fileId: 22, originalName: file.name, url: "https://example.com/22" });
    mockCreateInquiry.mockRejectedValue(new ApiException("GLOBAL_007", "server", 500));
    render(<InquiryForm />);
    await fillRequiredFields(user);
    await user.upload(screen.getByLabelText(/첨부파일/), file);
    await user.click(screen.getByRole("button", { name: "문의 접수" }));
    await user.click(screen.getByRole("button", { name: "접수 하기" }));

    await waitFor(() => expect(mockCreateInquiry).toHaveBeenCalled());
    await waitFor(() => expect(mockDeleteFile.mock.calls[0]?.[0]).toBe(22));
    expect(toastError).toHaveBeenCalledWith("서버에서 파일을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    expect(screen.getByLabelText(/문의 제목/)).toHaveValue("  계약 문의  ");
  });
});
