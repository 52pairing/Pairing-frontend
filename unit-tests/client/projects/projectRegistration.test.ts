import {
  toProjectRegistrationRequest,
} from "@/features/client/projects/services/projectRegistration";
import type { ProjectRegisterForm } from "@/features/client/projects/types/project";

const validForm: ProjectRegisterForm = {
  noticeAgreed: true,
  projectName: "쇼핑몰 리뉴얼",
  startDate: "2026-09-01",
  startNegotiable: true,
  periodValue: 6,
  periodUnit: "MONTH",
  budget: 5000,
  workMethod: "REMOTE",
  workType: "FULL_TIME",
  recruits: [
    {
      id: 1,
      category: "DEVELOPMENT",
      job: "FRONTEND",
      experience: 3,
      count: 2,
      skills: ["REACT", "TYPESCRIPT"],
    },
  ],
  currentSituation: "기획 완료",
  mainTask: "프론트엔드 개발",
  detailScope: "  결제 화면 구현  ",
  extraNote: "   ",
  files: [{ fileId: 10, originalName: "요구사항.pdf", sizeBytes: 1024 }],
};

describe("toProjectRegistrationRequest", () => {
  test("화면 폼을 프로젝트 등록 API 요청 형식으로 변환한다", () => {
    expect(toProjectRegistrationRequest(validForm)).toEqual({
      noticeAgreed: true,
      title: "쇼핑몰 리뉴얼",
      startDesiredDate: "2026-09-01",
      startNegotiable: true,
      periodValue: 6,
      periodUnit: "MONTH",
      budgetAmount: 50_000_000,
      workStyle: "REMOTE",
      workForm: "FULL_TIME",
      positions: [
        {
          jobCategory: "DEVELOPMENT",
          jobRole: "FRONTEND",
          minCareerYears: 3,
          headcount: 2,
          skills: ["REACT", "TYPESCRIPT"],
        },
      ],
      currentSituation: "기획 완료",
      mainTask: "프론트엔드 개발",
      detailScope: "결제 화면 구현",
      extraNote: null,
      fileIds: [10],
    });
  });

  test.each([
    ["안내 동의", { noticeAgreed: false }],
    ["프로젝트명", { projectName: "" }],
    ["시작일", { startDate: "" }],
    ["예산", { budget: undefined }],
    ["모집 포지션", { recruits: [] }],
    ["주요 업무", { mainTask: "" }],
  ])("필수값인 %s이(가) 없으면 오류가 발생한다", (_, partial) => {
    expect(() =>
      toProjectRegistrationRequest({ ...validForm, ...partial }),
    ).toThrow("프로젝트 등록에 필요한 입력값을 다시 확인해주세요.");
  });

  test("모집 포지션의 직군 또는 직무가 없으면 오류가 발생한다", () => {
    expect(() =>
      toProjectRegistrationRequest({
        ...validForm,
        recruits: [{ ...validForm.recruits![0], category: null }],
      }),
    ).toThrow("직군과 직무 입력값을 다시 확인해주세요.");
  });

  test("시작일 협의 여부와 첨부 파일이 없으면 기본값을 사용한다", () => {
    const request = toProjectRegistrationRequest({
      ...validForm,
      startNegotiable: undefined,
      files: undefined,
    });

    expect(request.startNegotiable).toBe(false);
    expect(request.fileIds).toEqual([]);
  });
});
