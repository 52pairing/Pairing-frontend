"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";

import type { EditableFile, EditablePosition, ProjectEditMeta } from "@/features/client/myprojects/edit/types/projectEdit";
import { getClientProjectDetail, updateClientProject } from "@/features/client/myprojects/services/projectDetail";
import type { ClientProjectDetailResponse, ProjectUpdateRequest } from "@/features/client/myprojects/types/projectDetail";
import { ConfirmModal } from "@/features/common/components/Modal";
import { deleteProjectFile, uploadProjectFile } from "@/features/client/projects/services/projectFiles";
import { createProjectPreReview, getProjectJobCategories, getProjectJobRoles, getProjectSkills, getProjectWorkConditions } from "@/features/client/projects/services/projectPreReview";
import type { ProjectMetaOption } from "@/features/client/projects/types/preReview";
import { ApiException } from "@/lib/api";

const MAX_TEXT_LENGTH = 1500;
const MAX_POSITIONS = 100;
const MAX_CAREER_YEARS = 50;
const MAX_HEADCOUNT = 50;
const MAX_SKILLS = 63;
const MAX_FILES = 10;
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;
const ALLOWED_FILE_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];

const ERROR_MESSAGE: Record<string, string> = {
  BUDGET_NOT_CHANGEABLE: "결제 후에는 프로젝트 예산을 변경할 수 없습니다.",
  HEADCOUNT_NOT_CHANGEABLE: "결제 후에는 포지션별 모집 인원을 변경할 수 없습니다.",
  POSITION_NOT_CHANGEABLE: "결제 후에는 포지션을 추가하거나 삭제할 수 없습니다.",
  PROJECT_NOT_FOUND: "프로젝트를 찾을 수 없습니다.",
  NOT_PROJECT_OWNER: "이 프로젝트를 수정할 권한이 없습니다.",
  INVALID_STATUS: "현재 프로젝트 상태에서는 수정할 수 없습니다.",
};

const toEditablePositions = (project: ClientProjectDetailResponse): EditablePosition[] =>
  project.positions.map((position) => ({
    key: `position-${position.positionId}`,
    positionId: position.positionId,
    jobCategory: position.jobCategory,
    jobRole: position.jobRole,
    minCareerYears: position.minCareerYears,
    headcount: position.headcount,
    skills: position.skills,
  }));

const positionSignature = (positions: EditablePosition[]) => JSON.stringify(
  positions.map(({ positionId, jobCategory, jobRole, minCareerYears, headcount, skills }) => ({
    positionId,
    jobCategory,
    jobRole,
    minCareerYears,
    headcount,
    skills,
  })),
);

const formatAmount = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("ko-KR") : "";
};

const apiErrorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiException
    ? ERROR_MESSAGE[error.errorCode] ?? error.message
    : error instanceof Error ? error.message : fallback;

export function ProjectEditForm() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const projectId = Number(params.projectId);
  const detailHref = `/client/projects/${params.projectId}`;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialPositionSignatureRef = useRef("");
  const newlyUploadedFileIdsRef = useRef(new Set<number>());

  const [project, setProject] = useState<ClientProjectDetailResponse | null>(null);
  const [meta, setMeta] = useState<ProjectEditMeta | null>(null);
  const [title, setTitle] = useState("");
  const [startDesiredDate, setStartDesiredDate] = useState("");
  const [startNegotiable, setStartNegotiable] = useState(false);
  const [periodValue, setPeriodValue] = useState("1");
  const [periodUnit, setPeriodUnit] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [workStyle, setWorkStyle] = useState("");
  const [workForm, setWorkForm] = useState("");
  const [positions, setPositions] = useState<EditablePosition[]>([]);
  const [currentSituation, setCurrentSituation] = useState("");
  const [mainTask, setMainTask] = useState("");
  const [detailScope, setDetailScope] = useState("");
  const [extraNote, setExtraNote] = useState("");
  const [files, setFiles] = useState<EditableFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completeDescription, setCompleteDescription] = useState("");

  const applyProject = useCallback((detail: ClientProjectDetailResponse) => {
    const nextPositions = toEditablePositions(detail);
    setProject(detail);
    setTitle(detail.title);
    setStartDesiredDate(detail.startDesiredDate?.slice(0, 10) ?? "");
    setStartNegotiable(detail.startNegotiable);
    setPeriodValue(String(detail.periodValue));
    setPeriodUnit(detail.periodUnit);
    setBudgetAmount(detail.budgetAmount.toLocaleString("ko-KR"));
    setWorkStyle(detail.workStyle);
    setWorkForm(detail.workForm);
    setPositions(nextPositions);
    setCurrentSituation(detail.currentSituation);
    setMainTask(detail.mainTask);
    setDetailScope(detail.detailScope ?? "");
    setExtraNote(detail.extraNote ?? "");
    setFiles(detail.files);
    initialPositionSignatureRef.current = positionSignature(nextPositions);
  }, []);

  const loadPage = useCallback(async () => {
    if (!Number.isInteger(projectId) || projectId <= 0) {
      setErrorMessage("프로젝트 정보를 확인할 수 없습니다.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [detail, categories, jobRoles, skills, workConditions] = await Promise.all([
        getClientProjectDetail(projectId),
        getProjectJobCategories(),
        getProjectJobRoles(),
        getProjectSkills(),
        getProjectWorkConditions(),
      ]);
      applyProject(detail);
      setMeta({ categories, jobRoles, skills, workConditions });
    } catch (error) {
      setErrorMessage(apiErrorMessage(error, "프로젝트 수정 정보를 불러오지 못했습니다."));
    } finally {
      setIsLoading(false);
    }
  }, [applyProject, projectId]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => { if (!cancelled) void loadPage(); });
    return () => { cancelled = true; };
  }, [loadPage]);

  const isAfterPayment = project?.status !== "REGISTERED";
  const numericBudget = Number(budgetAmount.replace(/,/g, ""));
  const numericPeriod = Number(periodValue);
  const isValid = Boolean(
    meta && title.trim() && startDesiredDate && numericPeriod >= 1 && numericBudget > 0 &&
    periodUnit && workStyle && workForm && currentSituation.trim() && mainTask.trim() &&
    currentSituation.length <= MAX_TEXT_LENGTH && mainTask.length <= MAX_TEXT_LENGTH &&
    detailScope.length <= MAX_TEXT_LENGTH && extraNote.length <= MAX_TEXT_LENGTH &&
    positions.length && positions.every((item) => item.jobCategory && item.jobRole && item.minCareerYears >= 1 && item.minCareerYears <= MAX_CAREER_YEARS && item.headcount >= 1 && item.headcount <= MAX_HEADCOUNT && item.skills.length >= 1 && item.skills.length <= MAX_SKILLS) &&
    !isUploading
  );

  const updatePosition = (key: string, changes: Partial<EditablePosition>) =>
    setPositions((current) => current.map((item) => item.key === key ? { ...item, ...changes } : item));

  const addPosition = () => setPositions((current) => [...current, {
    key: `new-${crypto.randomUUID()}`,
    positionId: null,
    jobCategory: "",
    jobRole: "",
    minCareerYears: 1,
    headcount: 1,
    skills: [],
  }]);

  const handleFiles = async (selectedFiles: File[]) => {
    setErrorMessage("");
    if (selectedFiles.length > MAX_FILES - files.length) {
      setErrorMessage(`첨부 자료는 최대 ${MAX_FILES}개까지 등록할 수 있습니다.`);
      return;
    }
    const invalidFile = selectedFiles.find((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      return !ALLOWED_FILE_EXTENSIONS.includes(extension) || file.size > MAX_FILE_SIZE_BYTES;
    });
    if (invalidFile) {
      setErrorMessage("PDF, JPG, JPEG, PNG 형식의 100MB 이하 파일만 업로드할 수 있습니다.");
      return;
    }
    setIsUploading(true);
    try {
      const uploaded: EditableFile[] = [];
      for (const file of selectedFiles) {
        const result = await uploadProjectFile(file);
        newlyUploadedFileIdsRef.current.add(result.fileId);
        uploaded.push(result);
      }
      setFiles((current) => [...current, ...uploaded]);
    } catch (error) {
      setErrorMessage(apiErrorMessage(error, "첨부 자료 업로드에 실패했습니다."));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = async (file: EditableFile) => {
    setFiles((current) => current.filter((item) => item.fileId !== file.fileId));
    if (!newlyUploadedFileIdsRef.current.has(file.fileId)) return;
    try {
      await deleteProjectFile(file.fileId);
      newlyUploadedFileIdsRef.current.delete(file.fileId);
    } catch (error) {
      setFiles((current) => [...current, file]);
      setErrorMessage(apiErrorMessage(error, "첨부 자료를 삭제하지 못했습니다."));
    }
  };

  const saveProject = async () => {
    if (!isValid || isSaving) return;
    setIsSaving(true);
    setErrorMessage("");
    const request: ProjectUpdateRequest = {
      title: title.trim(),
      startDesiredDate,
      startNegotiable,
      periodValue: numericPeriod,
      periodUnit,
      budgetAmount: numericBudget,
      workStyle,
      workForm,
      positions: positions.map(({ positionId, jobCategory, jobRole, minCareerYears, headcount, skills }) => ({ positionId, jobCategory, jobRole, minCareerYears, headcount, skills })),
      currentSituation: currentSituation.trim(),
      mainTask: mainTask.trim(),
      detailScope: detailScope.trim() || null,
      extraNote: extraNote.trim() || null,
      fileIds: files.map((file) => file.fileId),
    };

    try {
      const positionsChanged = initialPositionSignatureRef.current !== positionSignature(positions);
      await updateClientProject(projectId, request);
      let preReviewWarning = "";
      if (!isAfterPayment && positionsChanged) {
        try {
          await createProjectPreReview({ positions: request.positions.map(({ jobRole, headcount, skills }) => ({ jobRole, headcount, skills })) });
        } catch {
          preReviewWarning = " 후보 수 갱신은 완료하지 못했습니다.";
        }
      }
      const refreshed = await getClientProjectDetail(projectId);
      applyProject(refreshed);
      newlyUploadedFileIdsRef.current.clear();
      setCompleteDescription(preReviewWarning.trim());
      setIsCompleteModalOpen(true);
    } catch (error) {
      setErrorMessage(apiErrorMessage(error, "프로젝트 수정에 실패했습니다."));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center text-sm text-theme-secondary">프로젝트 수정 정보를 불러오고 있습니다.</div>;
  if (!project || !meta) return <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4"><p role="alert" className="text-sm text-theme-danger">{errorMessage || "프로젝트를 찾을 수 없습니다."}</p><button type="button" onClick={() => void loadPage()} className="rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white">다시 시도</button></main>;

  return (
    <main className="min-h-screen bg-surface-subtle px-5 py-7 text-theme-primary">
      <form className="mx-auto w-full max-w-[820px]" onSubmit={(event) => { event.preventDefault(); void saveProject(); }}>
        <Link href={detailHref} className="text-[12px] font-bold text-theme-secondary hover:text-theme-primary">← 프로젝트 상세로</Link>
        <header className="mt-5"><h1 className="text-[22px] font-extrabold">프로젝트 수정</h1><p className="mt-2 text-[12px] text-theme-secondary">수정한 내용은 프로젝트와 매칭 정보에 반영됩니다.</p></header>
        {isAfterPayment ? <p className="mt-5 rounded-[10px] border border-[#f4d367] bg-[#fffbed] px-4 py-3 text-[11px] font-semibold text-[#b45309]">결제 후에는 프로젝트 예산, 모집 인원, 포지션 추가·삭제를 수정할 수 없습니다.</p> : null}
        {errorMessage ? <p role="alert" className="mt-4 rounded-[10px] border border-[#fda29b] bg-danger-surface px-4 py-3 text-[11px] font-semibold text-theme-danger">{errorMessage}</p> : null}

        <FormSection title="기본 정보">
          <FormField label="프로젝트 제목" required><input value={title} onChange={(event) => setTitle(event.target.value)} className="h-11 w-full rounded-[8px] border border-theme bg-surface px-4 text-[12px] font-semibold outline-none focus:border-brand" /></FormField>
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="시작 희망일" required><input type="date" value={startDesiredDate} onChange={(event) => setStartDesiredDate(event.target.value)} className="h-11 w-full rounded-[8px] border border-theme bg-surface px-4 text-[12px] font-semibold outline-none focus:border-brand" /><label className="mt-3 flex w-fit items-center gap-2 text-[11px] text-theme-secondary"><input type="checkbox" checked={startNegotiable} onChange={(event) => setStartNegotiable(event.target.checked)} className="accent-[#17365d]" />시작일 협의 가능</label></FormField>
            <FormField label="예상 기간" required><div className="flex gap-2"><input type="number" min={1} value={periodValue} onChange={(event) => setPeriodValue(event.target.value)} className="h-11 w-28 rounded-[8px] border border-theme bg-surface px-4 text-[12px] font-semibold outline-none focus:border-brand" /><select value={periodUnit} onChange={(event) => setPeriodUnit(event.target.value)} className="h-11 flex-1 rounded-[8px] border border-theme bg-surface px-4 text-[12px] font-semibold outline-none focus:border-brand">{meta.workConditions.periodUnits.filter((item) => ["MONTH", "WEEK"].includes(item.code)).map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select></div></FormField>
          </div>
          <FormField label="프로젝트 예산" required><div className="flex items-center gap-2"><input inputMode="numeric" disabled={isAfterPayment} value={budgetAmount} onChange={(event: ChangeEvent<HTMLInputElement>) => setBudgetAmount(formatAmount(event.target.value))} className="h-11 w-full max-w-xs rounded-[8px] border border-theme bg-surface px-4 text-right text-[12px] font-semibold outline-none focus:border-brand disabled:cursor-not-allowed disabled:bg-surface-subtle" /><span className="text-[11px] font-bold">원</span></div></FormField>
          <div className="grid gap-5 md:grid-cols-2"><ChoiceField label="근무 방식" value={workStyle} options={meta.workConditions.workStyles} onChange={setWorkStyle} /><ChoiceField label="근무 형태" value={workForm} options={meta.workConditions.workForms} onChange={setWorkForm} /></div>
        </FormSection>

        <FormSection title="모집 포지션" description={`총 모집 인원 ${positions.reduce((sum, item) => sum + item.headcount, 0)}명`}>
          <div className="space-y-4">{positions.map((position, index) => <PositionEditor key={position.key} index={index} position={position} meta={meta} lockStructure={isAfterPayment} canDelete={!isAfterPayment && positions.length > 1} onChange={(changes) => updatePosition(position.key, changes)} onDelete={() => setPositions((current) => current.filter((item) => item.key !== position.key))} />)}</div>
          <button type="button" disabled={isAfterPayment || positions.length >= MAX_POSITIONS} onClick={addPosition} className="mt-4 h-11 w-full rounded-[9px] border border-theme bg-surface text-[11px] font-bold text-theme-secondary disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-theme-muted">+ 포지션 추가</button>
        </FormSection>

        <FormSection title="상세 정보">
          <TextField label="현재 진행 상황" required value={currentSituation} onChange={setCurrentSituation} />
          <TextField label="주요 담당 업무" required value={mainTask} onChange={setMainTask} />
          <TextField label="세부 업무범위" value={detailScope} onChange={setDetailScope} />
          <TextField label="기타 전달사항 및 우대사항" value={extraNote} onChange={setExtraNote} />
          <FormField label="첨부 자료"><input ref={fileInputRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={(event) => void handleFiles(Array.from(event.target.files ?? []))} /><button type="button" disabled={isUploading || files.length >= MAX_FILES} onClick={() => fileInputRef.current?.click()} className="h-11 w-full rounded-[9px] border border-dashed border-theme bg-surface-subtle text-[11px] font-bold text-theme-secondary disabled:cursor-not-allowed">{isUploading ? "업로드 중..." : "파일 추가"}</button>{files.length ? <ul className="mt-3 space-y-2">{files.map((file) => <li key={file.fileId} className="flex items-center justify-between rounded-[8px] border border-theme px-4 py-3 text-[11px]"><span className="min-w-0 truncate font-semibold">{file.originalName} <span className="text-theme-muted">({formatFileSize(file.sizeBytes)})</span></span><button type="button" onClick={() => void removeFile(file)} className="ml-3 shrink-0 text-theme-muted hover:text-theme-danger" aria-label={`${file.originalName} 삭제`}>삭제</button></li>)}</ul> : null}</FormField>
        </FormSection>

        <div className="mt-6 flex justify-end gap-3"><Link href={detailHref} className="flex h-11 items-center rounded-[9px] border border-theme bg-surface px-6 text-[12px] font-bold text-theme-secondary">취소</Link><button type="submit" disabled={!isValid || isSaving} className="h-11 rounded-[9px] bg-brand px-7 text-[12px] font-bold text-white disabled:cursor-not-allowed disabled:bg-[#aab6c5]">{isSaving ? "저장 중..." : "변경사항 저장"}</button></div>
      </form>
      <ConfirmModal
        open={isCompleteModalOpen}
        title="변경사항이 저장되었습니다."
        description={completeDescription || undefined}
        confirmText="확인"
        onClose={() => router.push(detailHref)}
        onConfirm={() => router.push(detailHref)}
        closeOnOverlayClick={false}
      />
    </main>
  );
}

function PositionEditor({ index, position, meta, lockStructure, canDelete, onChange, onDelete }: { index: number; position: EditablePosition; meta: ProjectEditMeta; lockStructure: boolean; canDelete: boolean; onChange: (changes: Partial<EditablePosition>) => void; onDelete: () => void }) {
  const [skillQuery, setSkillQuery] = useState("");
  const jobs = meta.jobRoles.filter((item) => item.parentCode === position.jobCategory);
  const availableSkills = useMemo(() => meta.skills.filter((item) => !position.skills.includes(item.code) && (!skillQuery.trim() || item.label.toLowerCase().includes(skillQuery.trim().toLowerCase()))), [meta.skills, position.skills, skillQuery]);
  return <article className="rounded-[10px] border border-theme"><div className="flex items-center justify-between bg-surface-subtle px-5 py-3"><h3 className="text-[12px] font-extrabold">포지션 {index + 1}</h3>{canDelete ? <button type="button" onClick={onDelete} className="text-[10px] font-bold text-theme-danger">삭제</button> : null}</div><div className="grid gap-5 p-5 md:grid-cols-2">
    <FormField label="직군" required><select value={position.jobCategory} onChange={(event) => onChange({ jobCategory: event.target.value, jobRole: "" })} className="h-11 w-full rounded-[8px] border border-theme bg-surface px-4 text-[12px] font-semibold outline-none focus:border-brand"><option value="">직군 선택</option>{meta.categories.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select></FormField>
    <FormField label="직무" required><select value={position.jobRole} onChange={(event) => { const role = meta.jobRoles.find((item) => item.code === event.target.value); onChange({ jobRole: role?.code ?? "", jobCategory: role?.parentCode ?? position.jobCategory }); }} className="h-11 w-full rounded-[8px] border border-theme bg-surface px-4 text-[12px] font-semibold outline-none focus:border-brand"><option value="">직무 선택</option>{jobs.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select></FormField>
    <FormField label="희망 경력" required><div className="flex items-center gap-2"><input type="number" min={1} max={MAX_CAREER_YEARS} value={position.minCareerYears} onChange={(event) => onChange({ minCareerYears: Number(event.target.value) })} className="h-11 w-24 rounded-[8px] border border-theme bg-surface px-4 text-[12px] font-semibold outline-none focus:border-brand" /><span className="text-[11px]">년 이상</span></div></FormField>
    <FormField label="모집 인원" required><div className="flex items-center gap-2"><input type="number" min={1} max={MAX_HEADCOUNT} disabled={lockStructure} value={position.headcount} onChange={(event) => onChange({ headcount: Number(event.target.value) })} className="h-11 w-24 rounded-[8px] border border-theme bg-surface px-4 text-[12px] font-semibold outline-none focus:border-brand disabled:cursor-not-allowed disabled:bg-surface-subtle" /><span className="text-[11px]">명</span></div></FormField>
    <div className="md:col-span-2"><FormField label="요구 스킬" required>{position.skills.length ? <div className="mb-3 flex flex-wrap gap-2">{position.skills.map((code) => <button key={code} type="button" onClick={() => onChange({ skills: position.skills.filter((item) => item !== code) })} className="rounded-[6px] border border-[#bfcfe1] bg-[#edf4fb] px-3 py-1.5 text-[10px] font-bold text-brand">{meta.skills.find((item) => item.code === code)?.label ?? code} ×</button>)}</div> : null}<input value={skillQuery} onChange={(event) => setSkillQuery(event.target.value)} placeholder="스킬 검색" className="h-11 w-full rounded-[8px] border border-theme bg-surface px-4 text-[12px] font-semibold outline-none focus:border-brand" /><div className="mt-2 flex max-h-28 flex-wrap gap-2 overflow-y-auto">{availableSkills.slice(0, 20).map((skill) => <button key={skill.code} type="button" disabled={position.skills.length >= MAX_SKILLS} onClick={() => { onChange({ skills: [...position.skills, skill.code] }); setSkillQuery(""); }} className="rounded-[6px] border border-theme px-2.5 py-1 text-[10px] font-semibold text-theme-secondary">+ {skill.label}</button>)}</div></FormField></div>
  </div></article>;
}

function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) { return <section className="mt-5 rounded-[14px] border border-theme bg-surface px-7 py-6"><div className="flex items-center justify-between"><h2 className="text-[15px] font-extrabold">{title}</h2>{description ? <span className="text-[11px] font-bold text-theme-secondary">{description}</span> : null}</div><div className="mt-6 space-y-6">{children}</div></section>; }
function FormField({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) { return <label className="block"><span className="text-[11px] font-bold">{label}{required ? <span className="ml-1 text-theme-danger">*</span> : null}</span><div className="mt-2">{children}</div></label>; }
function ChoiceField({ label, value, options, onChange }: { label: string; value: string; options: ProjectMetaOption[]; onChange: (value: string) => void }) { return <FormField label={label} required><div className="flex flex-wrap gap-2">{options.map((item) => <button key={item.code} type="button" onClick={() => onChange(item.code)} className={`rounded-[8px] border px-4 py-2.5 text-[11px] font-bold ${value === item.code ? "border-brand bg-[#eef3f8] text-brand" : "border-theme text-theme-secondary"}`}>{item.label}</button>)}</div></FormField>; }
function TextField({ label, required, value, onChange }: { label: string; required?: boolean; value: string; onChange: (value: string) => void }) { return <FormField label={label} required={required}><textarea value={value} maxLength={MAX_TEXT_LENGTH} onChange={(event) => onChange(event.target.value)} className="min-h-32 w-full resize-y rounded-[9px] border border-theme bg-surface px-4 py-3 text-[11px] leading-6 outline-none focus:border-brand" /><p className="mt-1 text-right text-[10px] text-theme-muted">{value.length}/{MAX_TEXT_LENGTH}자</p></FormField>; }
function formatFileSize(bytes: number) { if (bytes < 1024) return `${bytes} B`; if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`; return `${(bytes / (1024 * 1024)).toFixed(1)} MB`; }
