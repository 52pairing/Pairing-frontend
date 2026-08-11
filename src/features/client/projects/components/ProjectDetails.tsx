"use client";

// Step 4 · 상세정보
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { ReactNode } from "react";

import { ProjectRegisterShell } from "@/features/client/projects/components/ProjectRegisterShell";
import { ProjectRequiredLabel } from "@/features/client/projects/components/ProjectRequiredLabel";
import { ProjectStepNavigation } from "@/features/client/projects/components/ProjectStepNavigation";
import { nextStep, prevStep } from "@/features/client/projects/constants/steps";
import { useProjectRegister } from "@/features/client/projects/context/ProjectRegisterContext";
import {
  deleteProjectFile,
  uploadProjectFile,
} from "@/features/client/projects/services/projectFiles";
import type { ProjectUploadedFile } from "@/features/client/projects/types/project";

const STEP = 4;
const MAX_TEXT_LENGTH = 1500;
const MAX_FILES = 10;
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;
const ALLOWED_FILE_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];

export function ProjectDetails() {
  const router = useRouter();
  const { form, patch } = useProjectRegister();
  const prev = prevStep(STEP);
  const next = nextStep(STEP);

  const [currentSituation, setCurrentSituation] = useState(form.currentSituation ?? "");
  const [mainTask, setMainTask] = useState(form.mainTask ?? "");
  const [detailScope, setDetailScope] = useState(form.detailScope ?? "");
  const [extraNote, setExtraNote] = useState(form.extraNote ?? "");
  const [files, setFiles] = useState<ProjectUploadedFile[]>(form.files ?? []);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const [fileError, setFileError] = useState("");

  const [statusGuideOpen, setStatusGuideOpen] = useState(true);
  const [taskGuideOpen, setTaskGuideOpen] = useState(true);
  const [scopeGuideOpen, setScopeGuideOpen] = useState(true);
  const [additionalGuideOpen, setAdditionalGuideOpen] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValid =
    currentSituation.trim().length > 0 &&
    mainTask.trim().length > 0 &&
    currentSituation.length <= MAX_TEXT_LENGTH &&
    mainTask.length <= MAX_TEXT_LENGTH &&
    detailScope.length <= MAX_TEXT_LENGTH &&
    extraNote.length <= MAX_TEXT_LENGTH &&
    !isUploading &&
    deletingFileId === null;

  const goPrev = () => {
    if (prev) router.push(prev.path);
  };

  const goNext = () => {
    if (!isValid || !next) return;

    // 입력값을 공용 Context에 저장 → 이후 스텝(검수·최종 확인)에서 사용
    patch({ currentSituation, mainTask, detailScope, extraNote, files });

    router.push(next.path);
  };

  const handleFiles = async (selectedFiles: File[]) => {
    setFileError("");
    const remainingCount = MAX_FILES - files.length;
    const filesToUpload = selectedFiles.slice(0, remainingCount);

    if (selectedFiles.length > remainingCount) {
      setFileError(`파일은 최대 ${MAX_FILES}개까지 업로드할 수 있습니다.`);
      return;
    }

    const invalidFile = filesToUpload.find((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      return !ALLOWED_FILE_EXTENSIONS.includes(extension) || file.size > MAX_FILE_SIZE_BYTES;
    });

    if (invalidFile) {
      setFileError("PDF, JPG, JPEG, PNG 형식의 100MB 이하 파일만 업로드할 수 있습니다.");
      return;
    }

    setIsUploading(true);
    const uploaded: ProjectUploadedFile[] = [];

    try {
      for (const file of filesToUpload) {
        uploaded.push(await uploadProjectFile(file));
      }
      setFiles((current) => [...current, ...uploaded]);
    } catch (error) {
      setFiles((current) => [...current, ...uploaded]);
      setFileError(error instanceof Error ? error.message : "파일 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteFile = async (file: ProjectUploadedFile) => {
    setFileError("");
    setDeletingFileId(file.fileId);
    try {
      await deleteProjectFile(file.fileId);
      setFiles((current) => current.filter((item) => item.fileId !== file.fileId));
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "파일 삭제에 실패했습니다.");
    } finally {
      setDeletingFileId(null);
    }
  };

  return (
    <ProjectRegisterShell currentStep={STEP} backHref="/client" backLabel="홈으로">
      <div className="mx-auto mt-12 max-w-[720px]">
        <header>
          <h1 className="text-[22px] font-extrabold tracking-[-0.04em] text-theme-primary">
            프로젝트 상세 정보
          </h1>

          <p className="mt-2 text-[12px] font-medium text-theme-secondary">
            프리랜서가 프로젝트를 이해할 수 있도록 상세 내용을 작성해주세요.
          </p>
        </header>

        {/* 현재 프로젝트 진행 상황 */}
        <GuideBox
          title="현재 프로젝트 진행 상황 — 작성 가이드 · 예시"
          open={statusGuideOpen}
          onToggle={() => setStatusGuideOpen(!statusGuideOpen)}
        >
          <div className="grid md:grid-cols-2">
            <div className="border-b border-theme px-5 py-4 md:border-b-0 md:border-r">
              <p className="mb-3 text-[10px] font-medium text-theme-muted">
                작성 가이드
              </p>

              <GuideText>프로젝트 목적</GuideText>
              <GuideText>프로젝트 배경</GuideText>
              <GuideText>프리랜서를 모집하는 이유</GuideText>
              <GuideText>현재 준비된 기획 또는 디자인 자료</GuideText>
              <GuideText>현재까지 완료된 작업</GuideText>
            </div>

            <div className="px-5 py-4">
              <p className="mb-3 text-[10px] font-medium text-theme-muted">
                예시
              </p>

              <ExampleText>목적: 기존 서비스 홈페이지 리뉴얼</ExampleText>
              <ExampleText>배경: 사용자 편의성 및 전환율 개선</ExampleText>
              <ExampleText>
                구인 사유: 내부 개발 인력 부족으로 외부 충원 필요
              </ExampleText>
            </div>
          </div>
        </GuideBox>

        <FieldCard>
          <ProjectRequiredLabel>현재 프로젝트 진행 상황</ProjectRequiredLabel>

          <NoticeBox>
            필요한 업무와 원하는 결과를 작성해 주세요. 자세할수록 더 적합한
            프리랜서를 추천할 수 있습니다.
          </NoticeBox>

          <Textarea
            value={currentSituation}
            onChange={setCurrentSituation}
            placeholder="현재 프로젝트 진행 상황을 작성해주세요..."
          />
        </FieldCard>

        {/* 주요 담당 업무 */}
        <GuideBox
          title="주요 담당 업무 — 작성 가이드 · 예시"
          open={taskGuideOpen}
          onToggle={() => setTaskGuideOpen(!taskGuideOpen)}
        >
          <div className="grid md:grid-cols-2">
            <div className="border-b border-theme px-5 py-4 md:border-b-0 md:border-r">
              <p className="mb-3 text-[10px] font-medium text-theme-muted">
                작성 가이드
              </p>

              <GuideText>구현을 원하는 기능</GuideText>
              <GuideText>담당해야 할 업무</GuideText>
              <GuideText>사용하는 개발 언어 또는 디자인 도구</GuideText>
              <GuideText>업무별 우선순위</GuideText>
              <GuideText>우선 개발해야 하는 플랫폼</GuideText>
            </div>

            <div className="px-5 py-4">
              <p className="mb-3 text-[10px] font-medium text-theme-muted">
                예시
              </p>

              <ExampleText>
                주요 업무: 웹 서비스 기획, UI 디자인, 프론트엔드 개발
              </ExampleText>

              <ExampleText>
                사용 기술: React, TypeScript, Java, Spring
              </ExampleText>

              <ExampleText>
                우선순위: 기획·디자인 → 관리자 페이지 → 사용자 페이지
              </ExampleText>

              <ExampleText>우선 플랫폼: 모바일 앱 우선</ExampleText>
            </div>
          </div>
        </GuideBox>

        <FieldCard>
          <ProjectRequiredLabel>주요 담당 업무</ProjectRequiredLabel>

          <NoticeBox>
            프리랜서가 담당할 주요 업무와 예상 산출물을 작성해 주세요.
            <br />
            사용하는 기술이나 도구, 업무 진행 순서와 우선순위가 있다면 함께
            입력해 주세요.
          </NoticeBox>

          <Textarea
            value={mainTask}
            onChange={setMainTask}
            placeholder="주요 담당 업무를 작성해주세요..."
          />
        </FieldCard>

        {/* 세부 업무 범위 */}
        <GuideBox
          title="세부 업무 범위 — 작성 가이드 · 예시"
          open={scopeGuideOpen}
          onToggle={() => setScopeGuideOpen(!scopeGuideOpen)}
        >
          <div className="grid md:grid-cols-2">
            <div className="border-b border-theme px-5 py-4 md:border-b-0 md:border-r">
              <p className="mb-3 text-[10px] font-medium text-theme-muted">
                작성 가이드
              </p>

              <GuideText>현재 준비 상태 (기획서 / 디자인 보유 여부)</GuideText>
              <GuideText>협업 가능한 내부 인원</GuideText>
              <GuideText>개발이 필요한 페이지 수 / 예상 기능 수</GuideText>
              <GuideText>디자인 시스템 보유 여부 (디자인 프로젝트)</GuideText>
              <GuideText>전체 개발 분량을 판단할 수 있는 정보</GuideText>
            </div>

            <div className="px-5 py-4">
              <p className="mb-3 text-[10px] font-medium text-theme-muted">
                예시
              </p>

              <ExampleText>기획서 완료 · Figma 디자인 80% 완성</ExampleText>

              <ExampleText>내부 협업: 백엔드 2명 · PM 1명</ExampleText>

              <ExampleText>약 15개 주요 페이지 (PC 웹 기준)</ExampleText>

              <ExampleText>예상 주요 기능 약 30개</ExampleText>
            </div>
          </div>
        </GuideBox>

        <FieldCard>
          <label className="text-[12px] font-extrabold text-theme-primary">
            세부 업무 범위
          </label>

          <NoticeBox>
            준비된 자료와 작업 대상, 예상 작업량을 작성해 주세요. 업무 범위가
            구체적일수록 더 적합한 프리랜서를 추천할 수 있습니다.
          </NoticeBox>

          <Textarea
            value={detailScope}
            onChange={setDetailScope}
            placeholder="세부 업무 범위를 작성해주세요..."
          />
        </FieldCard>

        {/* 기타 전달사항 */}
        <GuideBox
          title="기타 전달사항 및 우대사항 — 작성 가이드 · 예시"
          open={additionalGuideOpen}
          onToggle={() => setAdditionalGuideOpen(!additionalGuideOpen)}
        >
          <div className="grid md:grid-cols-2">
            <div className="border-b border-theme px-5 py-4 md:border-b-0 md:border-r">
              <p className="mb-3 text-[10px] font-medium text-theme-muted">
                작성 가이드
              </p>

              <GuideText>우대 경력 / 우대 기술</GuideText>
              <GuideText>커뮤니케이션 가능 시간</GuideText>
              <GuideText>정기 미팅 여부</GuideText>
              <GuideText>기타 프로젝트 관련 전달사항</GuideText>
            </div>

            <div className="px-5 py-4">
              <p className="mb-3 text-[10px] font-medium text-theme-muted">
                예시
              </p>

              <ExampleText>유사 프로젝트 경험자 우대</ExampleText>
              <ExampleText>매주 월요일 오전 스크럼 미팅</ExampleText>
              <ExampleText>오전 10시~오후 6시 슬랙 응답 가능자 우대</ExampleText>
            </div>
          </div>
        </GuideBox>

        <FieldCard>
          <label className="text-[12px] font-extrabold text-theme-primary">
            기타 전달사항 및 우대사항
          </label>

          <Textarea
            value={extraNote}
            onChange={setExtraNote}
            placeholder="기타 전달사항 및 우대사항을 작성해주세요..."
          />
        </FieldCard>

        {/* 프로젝트 관련 자료 */}
        <section className="mt-5 rounded-[12px] border border-theme bg-surface p-6">
          <h2 className="text-[13px] font-extrabold text-theme-primary">
            프로젝트 관련 자료
          </h2>

          <p className="mt-2 text-[11px] leading-5 text-theme-muted">
            기획서, 디자인 시안, 참고 자료 등을 첨부해주세요. 구체적인
            자료일수록 더 적합한 프리랜서 매칭에 도움이 됩니다.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(event) =>
              void handleFiles(Array.from(event.target.files ?? []))
            }
          />

          <button
            type="button"
            disabled={files.length >= MAX_FILES || isUploading}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (files.length < MAX_FILES && !isUploading) {
                void handleFiles(Array.from(event.dataTransfer.files));
              }
            }}
            className="mt-5 flex min-h-[92px] w-full flex-col items-center justify-center rounded-[10px] border border-dashed border-[#cfd6df] bg-[#fafbfc] transition hover:bg-[#f6f8fa] disabled:cursor-not-allowed disabled:bg-[#f1f3f5] disabled:opacity-60"
          >
            <UploadIcon />

            <p className="mt-2 text-[12px] font-bold text-theme-secondary">
              {isUploading
                ? "파일을 업로드하고 있습니다."
                : files.length >= MAX_FILES
                  ? "최대 10개 파일을 업로드했습니다."
                  : "클릭하거나 파일을 드래그하여 업로드"}
            </p>

            <p className="mt-1 text-[10px] text-theme-muted">
              PDF · 이미지 · 파일당 최대 100MB · 최대 10개
            </p>
          </button>

          {files.length > 0 ? (
            <div className="mt-3 space-y-2">
              {files.map((file) => (
                <div key={file.fileId} className="flex h-[48px] items-center justify-between rounded-[8px] border border-theme px-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileIcon />
                    <p className="truncate text-[11px] font-bold text-theme-secondary">{file.originalName}</p>
                    <span className="shrink-0 text-[10px] text-theme-muted">{formatFileSize(file.sizeBytes)}</span>
                  </div>
                  <button
                    type="button"
                    disabled={deletingFileId === file.fileId}
                    onClick={() => void handleDeleteFile(file)}
                    className="text-[16px] text-theme-muted hover:text-theme-secondary disabled:cursor-wait"
                    aria-label={`${file.originalName} 삭제`}
                  >
                    {deletingFileId === file.fileId ? "…" : "×"}
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {fileError ? (
            <p role="alert" className="mt-3 text-[11px] font-semibold text-theme-danger">{fileError}</p>
          ) : null}

          <div className="mt-3 space-y-1 text-[10px] font-medium text-theme-muted">
            <p>
              · 허용 형식: PDF, PNG, JPG, JPEG · 파일당 최대 100MB · 최대 10개
            </p>

            <p>· 기밀 자료는 NDA 체결 후 추가 공유를 권장드립니다.</p>
          </div>
        </section>
      </div>

      <ProjectStepNavigation
        onPrevious={goPrev}
        onNext={goNext}
        nextDisabled={!isValid}
      />
    </ProjectRegisterShell>
  );
}

/* =========================================================
   FIELD CARD
========================================================= */

function FieldCard({ children }: { children: ReactNode }) {
  return (
    <section className="mt-3 rounded-[12px] border border-theme bg-surface p-5">
      {children}
    </section>
  );
}

/* =========================================================
   NOTICE
========================================================= */

function NoticeBox({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 rounded-[8px] border border-[#f4d367] bg-[#fffbed] px-4 py-[9px] text-[10px] font-bold leading-[1.6] text-[#d97706]">
      {children}
    </div>
  );
}

/* =========================================================
   TEXTAREA
========================================================= */

function Textarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="mt-3">
      <textarea
        value={value}
        maxLength={MAX_TEXT_LENGTH}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[165px] w-full resize-none rounded-[9px] border border-theme bg-surface px-4 py-4 text-[11px] font-medium leading-6 text-theme-secondary outline-none transition placeholder:text-theme-muted focus:border-[#3b73ff] focus:ring-1 focus:ring-[#3b73ff]"
      />

      <p className="mt-1 text-right text-[10px] font-medium text-theme-muted">
        {value.length}자/{MAX_TEXT_LENGTH}자
      </p>
    </div>
  );
}

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* =========================================================
   GUIDE
========================================================= */

function GuideBox({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="mt-5 overflow-hidden rounded-[11px] border border-theme bg-surface">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-[44px] w-full items-center justify-between bg-surface-subtle px-4 text-left"
      >
        <span className="text-[11px] font-bold text-theme-secondary">{title}</span>

        <ChevronIcon open={open} />
      </button>

      {open && children}
    </section>
  );
}

function GuideText({ children }: { children: ReactNode }) {
  return (
    <p className="mt-[7px] flex items-start gap-2 text-[10px] font-semibold leading-[1.5] text-theme-secondary">
      <span className="mt-[6px] h-[3px] w-[3px] shrink-0 rounded-full bg-[#98a2b3]" />
      {children}
    </p>
  );
}

function ExampleText({ children }: { children: ReactNode }) {
  return (
    <p className="mt-[7px] text-[10px] font-medium leading-[1.5] text-theme-muted">
      {children}
    </p>
  );
}

/* =========================================================
   ICONS (이 단계 전용)
========================================================= */

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={`text-theme-muted transition ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M3.5 8.5L7 5L10.5 8.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 16V4M12 4L8 8M12 4L16 8"
        stroke="#98A2B3"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M5 14V18C5 19.1 5.9 20 7 20H17C18.1 20 19 19.1 19 18V14"
        stroke="#98A2B3"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      width="15"
      height="17"
      viewBox="0 0 16 18"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M3 1.5H9.5L13.5 5.5V16.5H3V1.5Z"
        stroke="#3978EF"
        strokeWidth="1.2"
      />

      <path d="M9.5 1.5V5.5H13.5" stroke="#3978EF" strokeWidth="1.2" />
    </svg>
  );
}
