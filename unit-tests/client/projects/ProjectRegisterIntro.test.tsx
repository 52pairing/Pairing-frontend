import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProjectRegisterIntro } from "@/features/client/projects/components/ProjectRegisterIntro";
import { useProjectRegister } from "@/features/client/projects/context/ProjectRegisterContext";

const push = jest.fn();
const patch = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

jest.mock("@/features/client/projects/context/ProjectRegisterContext", () => ({
  useProjectRegister: jest.fn(),
}));

jest.mock("@/features/client/projects/components/ProjectRegisterShell", () => ({
  ProjectRegisterShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockUseProjectRegister = jest.mocked(useProjectRegister);

describe("ProjectRegisterIntro", () => {
  beforeEach(() => {
    mockUseProjectRegister.mockReturnValue({
      form: {},
      patch,
      registeredProject: null,
      setRegisteredProject: jest.fn(),
      clearRegisteredProject: jest.fn(),
      clearDraft: jest.fn(),
      reset: jest.fn(),
    });
  });

  test("필수 안내에 동의하지 않으면 등록 시작 버튼이 비활성화된다", () => {
    render(<ProjectRegisterIntro />);

    expect(screen.getByRole("button", { name: "등록 시작하기" })).toBeDisabled();
  });

  test("동의 체크 시 Context에 동의 상태를 저장한다", async () => {
    const user = userEvent.setup();
    render(<ProjectRegisterIntro />);

    await user.click(screen.getByRole("checkbox"));

    expect(patch).toHaveBeenCalledWith({ noticeAgreed: true });
  });

  test("동의한 사용자가 시작 버튼을 누르면 기본 정보 단계로 이동한다", async () => {
    const user = userEvent.setup();
    mockUseProjectRegister.mockReturnValue({
      form: { noticeAgreed: true },
      patch,
      registeredProject: null,
      setRegisteredProject: jest.fn(),
      clearRegisteredProject: jest.fn(),
      clearDraft: jest.fn(),
      reset: jest.fn(),
    });
    render(<ProjectRegisterIntro />);

    await user.click(screen.getByRole("button", { name: "등록 시작하기" }));

    expect(push).toHaveBeenCalledWith("/client/projects/new/basic");
  });
});
