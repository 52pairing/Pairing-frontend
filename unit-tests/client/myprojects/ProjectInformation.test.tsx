import { render, screen } from "@testing-library/react";

import { ProjectInformation } from "@/features/client/myprojects/information/components/ProjectInformation";
import { projectDetail } from "./fixtures";

jest.mock("@/features/client/myprojects/information/components/ProjectFreelancerStatus", () => ({
  ProjectFreelancerStatus: () => null,
}));
jest.mock("@/features/client/myprojects/services/projectDetail", () => ({
  downloadProjectFile: jest.fn(),
}));

const renderProjectInformation = (status: typeof projectDetail.status) => render(
  <ProjectInformation
    project={{
      ...projectDetail,
      status,
      recruitDeadline: "2099-08-26",
      extensionCount: 1,
    }}
    jobRoleLabels={{ FRONTEND: "프론트엔드 개발자" }}
    skillLabels={{ REACT: "React" }}
    workStyleLabel="재택"
    workFormLabel="풀타임"
  />,
);

describe("ProjectInformation", () => {
  test.each(["CLOSED", "CANCELED"] as const)("%s 프로젝트에서 모집 마감일과 연장 횟수를 숨긴다", (status) => {
    renderProjectInformation(status);
    expect(screen.queryByText(/1 \/ 2회 사용/)).not.toBeInTheDocument();
    expect(screen.queryByText(/D-/)).not.toBeInTheDocument();
  });

  test.each(["RECRUITING", "NEGOTIATING", "CONTRACT_PENDING"] as const)("%s 프로젝트에서 모집 정보를 표시한다", (status) => {
    renderProjectInformation(status);
    expect(screen.getByText("1 / 2회 사용")).toBeInTheDocument();
    expect(screen.getByText(/D-/)).toBeInTheDocument();
  });
});
