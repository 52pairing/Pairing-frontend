import type { ReactNode } from "react";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  ResumeAgreementsSection,
  ResumeBasicInfoSection,
  ResumeConditionSection,
  ResumeLinksSection,
  ResumePortfolioSection,
} from "@/features/freelancer/mypage/components/ResumeFormSections";
import { uploadFreelancerFile } from "@/features/freelancer/mypage/services/freelancerFiles";
import {
  MAX_PORTFOLIO_SIZE,
  MAX_PROFILE_IMAGE_SIZE,
  blankConditionForm,
  createProfileImagePreview,
  emptyDraft,
  type Agreements,
  type ConditionForm,
  type LinkForm,
  type ResumeDraft,
} from "@/features/freelancer/mypage/utils/resumeFormData";
import type { MetaOption, WorkConditionsMeta } from "@/features/freelancer/mypage/types/resume";

jest.mock("@/features/freelancer/mypage/services/freelancerFiles", () => ({
  uploadFreelancerFile: jest.fn(),
}));
jest.mock("@/features/freelancer/mypage/utils/resumeFormData", () => {
  const actual = jest.requireActual("@/features/freelancer/mypage/utils/resumeFormData");
  return { ...actual, createProfileImagePreview: jest.fn() };
});

const mockedUploadFile = jest.mocked(uploadFreelancerFile);
const mockedCreatePreview = jest.mocked(createProfileImagePreview);

afterEach(() => jest.clearAllMocks());

function makeFile(name: string, type: string, size: number) {
  const file = new File(["content"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

type UpdateDraft = <K extends keyof ResumeDraft>(key: K, value: ResumeDraft[K]) => void;

function DraftHarness({
  initialDraft,
  children,
}: {
  initialDraft?: Partial<ResumeDraft>;
  children: (props: { draft: ResumeDraft; update: UpdateDraft }) => ReactNode;
}) {
  const [draft, setDraft] = useState<ResumeDraft>({ ...emptyDraft(), ...initialDraft });
  const update: UpdateDraft = (key, value) =>
    setDraft((current) => ({ ...current, [key]: value }));
  return <>{children({ draft, update })}</>;
}

function renderBasicInfo(initialDraft?: Partial<ResumeDraft>) {
  return render(
    <DraftHarness initialDraft={initialDraft}>
      {({ draft, update }) => (
        <ResumeBasicInfoSection
          draft={draft}
          update={update}
          name="김프리"
          accountBirthDate={null}
          effectiveEmail={draft.email}
          showErrors={false}
          hasProfileImage={Boolean(draft.profileImageFileId || draft.profileImageUrl)}
        />
      )}
    </DraftHarness>,
  );
}

describe("ResumeBasicInfoSection", () => {
  it("지원하지 않는 파일 형식이면 오류 메시지를 보여주고 업로드하지 않는다", async () => {
    const { container } = renderBasicInfo();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    // accept 속성과 다른 MIME 타입은 user-event가 선택 자체를 막으므로 change 이벤트를 직접 발생시켜
    // 컴포넌트 자체의 타입 검증 로직을 확인한다.
    fireEvent.change(input, { target: { files: [makeFile("photo.gif", "image/gif", 10)] } });

    expect(
      await screen.findByText("JPG 또는 PNG 파일만 등록할 수 있습니다."),
    ).toBeInTheDocument();
    expect(mockedUploadFile).not.toHaveBeenCalled();
  });

  it("5MB를 초과하면 오류 메시지를 보여주고 업로드하지 않는다", async () => {
    const user = userEvent.setup();
    const { container } = renderBasicInfo();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, makeFile("photo.jpg", "image/jpeg", MAX_PROFILE_IMAGE_SIZE + 1));

    expect(
      await screen.findByText("프로필 사진은 5MB 이하만 등록할 수 있습니다."),
    ).toBeInTheDocument();
    expect(mockedUploadFile).not.toHaveBeenCalled();
  });

  it("정상적인 사진을 업로드하면 파일 정보를 저장한다", async () => {
    mockedCreatePreview.mockResolvedValue("data:image/jpeg;base64,preview");
    mockedUploadFile.mockResolvedValue({
      fileId: 10,
      originalName: "photo.jpg",
      sizeBytes: 1024,
    });
    const user = userEvent.setup();
    const { container } = renderBasicInfo();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, makeFile("photo.jpg", "image/jpeg", 1024));

    expect(await screen.findByText("photo.jpg")).toBeInTheDocument();
    expect(mockedUploadFile).toHaveBeenCalledWith(expect.any(File), "PROFILE_IMAGE");
  });
});

function renderPortfolio(initialDraft?: Partial<ResumeDraft>) {
  return render(
    <DraftHarness initialDraft={initialDraft}>
      {({ draft, update }) => (
        <ResumePortfolioSection
          draft={draft}
          update={update}
          showErrors={false}
          hasPortfolio={Boolean(draft.portfolioFileId || draft.portfolioUrl)}
        />
      )}
    </DraftHarness>,
  );
}

describe("ResumePortfolioSection", () => {
  it("PDF가 아니면 오류 메시지를 보여주고 업로드하지 않는다", async () => {
    const { container } = renderPortfolio();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [makeFile("portfolio.hwp", "application/x-hwp", 10)] },
    });

    expect(
      await screen.findByText("포트폴리오는 PDF 파일만 등록할 수 있습니다."),
    ).toBeInTheDocument();
    expect(mockedUploadFile).not.toHaveBeenCalled();
  });

  it("100MB를 초과하면 오류 메시지를 보여주고 업로드하지 않는다", async () => {
    const user = userEvent.setup();
    const { container } = renderPortfolio();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(
      input,
      makeFile("portfolio.pdf", "application/pdf", MAX_PORTFOLIO_SIZE + 1),
    );

    expect(
      await screen.findByText("포트폴리오는 100MB 이하만 등록할 수 있습니다."),
    ).toBeInTheDocument();
    expect(mockedUploadFile).not.toHaveBeenCalled();
  });

  it("정상적인 PDF를 업로드하면 파일 정보를 저장한다", async () => {
    mockedUploadFile.mockResolvedValue({
      fileId: 20,
      originalName: "portfolio.pdf",
      sizeBytes: 2048,
    });
    const user = userEvent.setup();
    const { container } = renderPortfolio();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, makeFile("portfolio.pdf", "application/pdf", 2048));

    expect(await screen.findByText("portfolio.pdf")).toBeInTheDocument();
    expect(mockedUploadFile).toHaveBeenCalledWith(expect.any(File), "PORTFOLIO");
  });

  it("삭제 버튼을 누르면 포트폴리오 정보를 초기화한다", async () => {
    const user = userEvent.setup();
    renderPortfolio({
      portfolioName: "old.pdf",
      portfolioFileId: 5,
      portfolioUrl: "https://cdn.example.com/old.pdf",
    });

    expect(screen.getByText("old.pdf")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "포트폴리오 파일 제거" }));

    expect(screen.queryByText("old.pdf")).not.toBeInTheDocument();
  });
});

function LinksHarness({ initialLinks = [] as LinkForm[] }: { initialLinks?: LinkForm[] }) {
  const [links, setLinks] = useState<LinkForm[]>(initialLinks);
  const update: UpdateDraft = (key, value) => {
    if (key === "links") setLinks(value as LinkForm[]);
  };
  return <ResumeLinksSection links={links} update={update} />;
}

describe("ResumeLinksSection", () => {
  it("http로 시작하지 않으면 오류를 보여주고 추가하지 않는다", async () => {
    const user = userEvent.setup();
    render(<LinksHarness />);

    await user.type(screen.getByPlaceholderText("https://"), "github.com/example");
    await user.click(screen.getByRole("button", { name: "링크 추가" }));

    expect(
      screen.getByText("http:// 또는 https://로 시작하는 링크를 입력해 주세요."),
    ).toBeInTheDocument();
  });

  it("이미 추가된 링크면 오류를 보여준다", async () => {
    const user = userEvent.setup();
    render(<LinksHarness initialLinks={[{ url: "https://github.com/example" }]} />);

    await user.type(screen.getByPlaceholderText("https://"), "https://github.com/example");
    await user.click(screen.getByRole("button", { name: "링크 추가" }));

    expect(screen.getByText("이미 추가된 링크입니다.")).toBeInTheDocument();
  });

  it("정상 링크를 추가하면 목록에 표시된다", async () => {
    const user = userEvent.setup();
    render(<LinksHarness />);

    await user.type(screen.getByPlaceholderText("https://"), "https://notion.so/me");
    await user.click(screen.getByRole("button", { name: "링크 추가" }));

    expect(screen.getByRole("link", { name: "https://notion.so/me" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("https://")).toHaveValue("");
  });

  it("삭제 버튼을 누르면 목록에서 제거된다", async () => {
    const user = userEvent.setup();
    render(<LinksHarness initialLinks={[{ url: "https://github.com/example" }]} />);

    await user.click(screen.getByRole("button", { name: "삭제" }));

    expect(screen.queryByRole("link", { name: "https://github.com/example" })).not.toBeInTheDocument();
  });
});

const EMPTY_AGREEMENTS: Agreements = {
  profileCollectionAgreed: false,
  profileProvisionAgreed: false,
  aiAnalysisAgreed: false,
  careerPortfolioUsageAgreed: false,
};

function AgreementsHarness({
  initialAgreements = EMPTY_AGREEMENTS,
  showErrors = false,
  hasSavedResume = false,
}: {
  initialAgreements?: Agreements;
  showErrors?: boolean;
  hasSavedResume?: boolean;
}) {
  const [draft, setDraft] = useState<ResumeDraft>({
    ...emptyDraft(),
    agreements: initialAgreements,
  });
  const update: UpdateDraft = (key, value) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const agreementsValid = Object.values(draft.agreements).every(Boolean);
  const agreementsGate = hasSavedResume || agreementsValid;
  return (
    <ResumeAgreementsSection
      draft={draft}
      update={update}
      showErrors={showErrors}
      agreementsGate={agreementsGate}
      hasSavedResume={hasSavedResume}
    />
  );
}

describe("ResumeAgreementsSection", () => {
  it("체크박스를 클릭하면 해당 동의 항목만 갱신한다", async () => {
    const user = userEvent.setup();
    render(<AgreementsHarness />);

    await user.click(
      screen.getByRole("checkbox", { name: "이력서 정보 수집에 동의합니다." }),
    );

    expect(
      screen.getByRole("checkbox", { name: "이력서 정보 수집에 동의합니다." }),
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "이력서 정보 제공(매칭용)에 동의합니다." }),
    ).not.toBeChecked();
  });

  it("모두 동의하지 않은 상태에서 오류 표시를 하면 안내 문구를 보여준다", () => {
    render(<AgreementsHarness showErrors />);

    expect(
      screen.getByText("모든 약관에 동의해야 저장할 수 있습니다."),
    ).toBeInTheDocument();
  });

  it("이미 등록된 이력서를 수정할 때는 안내 문구를 보여준다", () => {
    render(<AgreementsHarness hasSavedResume />);

    expect(
      screen.getByText(
        "최초 등록 시 동의한 내용이며, 이후 수정 저장에는 영향을 주지 않습니다.",
      ),
    ).toBeInTheDocument();
  });
});

const jobCategories: MetaOption[] = [{ code: "IT", label: "IT·개발" }];
const jobRoles: MetaOption[] = [{ code: "FE", label: "프론트엔드", parentCode: "IT" }];
const skillOptions: MetaOption[] = [{ code: "REACT", label: "React" }];
const workConditionsMeta: WorkConditionsMeta = {
  workStyles: [{ code: "REMOTE", label: "원격" }],
  workForms: [{ code: "FULL_TIME", label: "상주" }],
  payUnits: [{ code: "MONTHLY", label: "월" }],
  periodUnits: [{ code: "MONTH", label: "개월" }],
  skillLevels: [{ code: "ADVANCED", label: "상" }],
};

function ConditionHarness({
  initialForm = blankConditionForm(),
  showErrors = false,
}: {
  initialForm?: ConditionForm;
  showErrors?: boolean;
}) {
  const [conditionForm, setConditionForm] = useState<ConditionForm>(initialForm);
  const filteredJobRoles = jobRoles.filter(
    (role) => role.parentCode === conditionForm.categoryCode,
  );
  const filteredSkills = skillOptions.filter(
    (skill) => !conditionForm.skills.some((selected) => selected.code === skill.code),
  );
  const toggleSkill = (option: MetaOption) =>
    setConditionForm((current) => ({
      ...current,
      skills: current.skills.some((skill) => skill.code === option.code)
        ? current.skills.filter((skill) => skill.code !== option.code)
        : [
            ...current.skills,
            { code: option.code, levelCode: workConditionsMeta.skillLevels[0]?.code ?? "" },
          ],
    }));

  return (
    <ResumeConditionSection
      conditionForm={conditionForm}
      setConditionForm={setConditionForm}
      metaLoading={false}
      setMetaLoading={() => {}}
      metaError=""
      setMetaError={() => {}}
      fetchConditionMeta={() => {}}
      jobCategories={jobCategories}
      filteredJobRoles={filteredJobRoles}
      workConditionsMeta={workConditionsMeta}
      filteredSkills={filteredSkills}
      skillOptions={skillOptions}
      toggleSkill={toggleSkill}
      showErrors={showErrors}
    />
  );
}

describe("ResumeConditionSection", () => {
  it("직군을 변경하면 직무 선택이 초기화된다", async () => {
    const user = userEvent.setup();
    render(
      <ConditionHarness
        initialForm={{ ...blankConditionForm(), categoryCode: "OLD", roleCode: "STALE" }}
      />,
    );

    await user.selectOptions(screen.getByRole("combobox", { name: "직군 *" }), "IT");

    expect(screen.getByRole("combobox", { name: "직무 *" })).toHaveValue("");
    expect(screen.getByRole("option", { name: "프론트엔드" })).toBeInTheDocument();
  });

  it("필수값이 비어있고 오류 표시 상태면 안내 문구를 모두 보여준다", () => {
    render(<ConditionHarness showErrors />);

    expect(screen.getByText("직군과 직무를 선택해 주세요.")).toBeInTheDocument();
    expect(screen.getByText("근무 방식과 근무 형태를 선택해 주세요.")).toBeInTheDocument();
    expect(screen.getByText("희망 급여를 1만원 이상 입력해 주세요.")).toBeInTheDocument();
    expect(screen.getByText("기간 단위를 선택해 주세요.")).toBeInTheDocument();
    expect(screen.getByText("프리랜서 경험 여부를 선택해 주세요.")).toBeInTheDocument();
    expect(
      screen.getByText("보유 스킬을 1개 이상 선택하고 숙련도를 모두 지정해 주세요."),
    ).toBeInTheDocument();
  });

  it("스킬을 선택하면 목록에 추가되고 삭제할 수 있다", async () => {
    const user = userEvent.setup();
    render(<ConditionHarness />);

    await user.selectOptions(screen.getByDisplayValue("스킬 선택"), "REACT");

    expect(screen.getByText("React")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "React 삭제" }));

    expect(screen.queryByRole("button", { name: "React 삭제" })).not.toBeInTheDocument();
  });
});
