import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  ProjectRegisterProvider,
  useProjectRegister,
} from "@/features/client/projects/context/ProjectRegisterContext";

const FORM_KEY = "pairing:project-register-form";
const RESULT_KEY = "pairing:project-register-result";

function ContextConsumer() {
  const { form, registeredProject, patch, setRegisteredProject, reset } =
    useProjectRegister();

  return (
    <div>
      <span data-testid="project-name">{form.projectName ?? "없음"}</span>
      <span data-testid="project-result">
        {registeredProject?.title ?? "없음"}
      </span>
      <button type="button" onClick={() => patch({ projectName: "변경된 프로젝트" })}>
        폼 수정
      </button>
      <button
        type="button"
        onClick={() =>
          setRegisteredProject({
            projectId: 1,
            title: "등록된 프로젝트",
            periodValue: 3,
            periodUnit: "MONTH",
            budgetAmount: 10_000_000,
            startDesiredDate: "2026-09-01",
            status: "REGISTERED",
            positions: [],
            payableSettlementId: null,
          })
        }
      >
        결과 저장
      </button>
      <button type="button" onClick={reset}>전체 초기화</button>
    </div>
  );
}

const renderContext = () =>
  render(
    <ProjectRegisterProvider>
      <ContextConsumer />
    </ProjectRegisterProvider>,
  );

describe("ProjectRegisterProvider", () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => sessionStorage.clear());

  test("sessionStorage에 저장된 작성 정보와 등록 결과를 복원한다", async () => {
    sessionStorage.setItem(FORM_KEY, JSON.stringify({ projectName: "임시 프로젝트" }));
    sessionStorage.setItem(
      RESULT_KEY,
      JSON.stringify({ title: "완료 프로젝트" }),
    );

    renderContext();

    expect(screen.getByText("작성 중인 프로젝트 정보를 불러오고 있습니다.")).toBeInTheDocument();
    expect(await screen.findByTestId("project-name")).toHaveTextContent("임시 프로젝트");
    expect(screen.getByTestId("project-result")).toHaveTextContent("완료 프로젝트");
  });

  test("폼 수정과 등록 결과를 상태 및 sessionStorage에 함께 저장한다", async () => {
    const user = userEvent.setup();
    renderContext();

    await screen.findByTestId("project-name");
    await user.click(screen.getByRole("button", { name: "폼 수정" }));
    await user.click(screen.getByRole("button", { name: "결과 저장" }));

    expect(screen.getByTestId("project-name")).toHaveTextContent("변경된 프로젝트");
    expect(JSON.parse(sessionStorage.getItem(FORM_KEY) ?? "{}")).toMatchObject({
      projectName: "변경된 프로젝트",
    });
    expect(JSON.parse(sessionStorage.getItem(RESULT_KEY) ?? "{}")).toMatchObject({
      projectId: 1,
      title: "등록된 프로젝트",
    });
  });

  test("전체 초기화 시 상태와 저장된 값을 모두 제거한다", async () => {
    const user = userEvent.setup();
    sessionStorage.setItem(FORM_KEY, JSON.stringify({ projectName: "임시 프로젝트" }));
    sessionStorage.setItem(RESULT_KEY, JSON.stringify({ title: "완료 프로젝트" }));
    renderContext();

    await screen.findByText("임시 프로젝트");
    await user.click(screen.getByRole("button", { name: "전체 초기화" }));

    expect(screen.getByTestId("project-name")).toHaveTextContent("없음");
    expect(screen.getByTestId("project-result")).toHaveTextContent("없음");
    expect(sessionStorage.getItem(FORM_KEY)).toBeNull();
    expect(sessionStorage.getItem(RESULT_KEY)).toBeNull();
  });

  test("손상된 저장값은 제거하고 빈 상태로 복구한다", async () => {
    sessionStorage.setItem(FORM_KEY, "잘못된 JSON");
    sessionStorage.setItem(RESULT_KEY, "잘못된 JSON");

    renderContext();

    await waitFor(() =>
      expect(screen.getByTestId("project-name")).toHaveTextContent("없음"),
    );
    expect(sessionStorage.getItem(FORM_KEY)).toBeNull();
    expect(sessionStorage.getItem(RESULT_KEY)).toBeNull();
  });

  test("Provider 밖에서 훅을 사용하면 사용 방법을 안내한다", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => render(<ContextConsumer />)).toThrow(
      "useProjectRegister는 ProjectRegisterProvider 안에서만 사용할 수 있습니다.",
    );

    consoleError.mockRestore();
  });
});
