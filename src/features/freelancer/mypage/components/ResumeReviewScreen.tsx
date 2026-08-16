import type {
  FreelancerCondition,
  MetaOption,
  WorkConditionsMeta,
} from "@/features/freelancer/mypage/types/resume";
import {
  GRADUATION_STATUS_OPTIONS,
  labelOf,
  type ResumeDraft,
} from "@/features/freelancer/mypage/utils/resumeFormData";
import { FormCard, ProfileRegistrationShell } from "./ProfileRegistrationShell";

export function ReviewScreen({
  name,
  birthDate,
  phone,
  email,
  draft,
  photoUrl,
  condition,
  jobCategories,
  jobRoles,
  skillOptions,
  workConditionsMeta,
  notice,
  onEdit,
}: {
  name: string;
  birthDate: string | null;
  phone: string;
  email: string;
  draft: ResumeDraft;
  photoUrl: string;
  condition: FreelancerCondition | null;
  jobCategories: MetaOption[];
  jobRoles: MetaOption[];
  skillOptions: MetaOption[];
  workConditionsMeta: WorkConditionsMeta | null;
  notice: string;
  onEdit: () => void;
}) {
  return (
    <ProfileRegistrationShell
      step={2}
      title="내 이력서"
      description="등록된 이력서와 포트폴리오 정보를 확인할 수 있습니다."
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {notice ? (
          <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-[11px] font-bold text-blue-700">
            {notice}
          </p>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 self-end rounded-md bg-brand px-6 py-3 text-[12px] font-bold text-brand-contrast hover:bg-brand-hover sm:self-auto"
        >
          수정하기
        </button>
      </div>
      <div className="mt-4 space-y-3">
        <ReviewCard
          title="기본 정보"
          imagePreview={photoUrl}
          imageName={draft.profileImageName}
          rows={[
            ["성명", name],
            ["생년월일", birthDate ?? "확인 중"],
            ["연락처", phone],
            ["이메일", email],
          ]}
          fullRows={[
            [
              "주소",
              [draft.zipCode, draft.address, draft.addressDetail]
                .filter(Boolean)
                .join(" "),
            ],
          ]}
        />
        {condition ? (
          <ConditionReviewCards
            condition={condition}
            jobCategories={jobCategories}
            jobRoles={jobRoles}
            skillOptions={skillOptions}
            workConditionsMeta={workConditionsMeta}
          />
        ) : null}
        {draft.educations.map((education, index) => (
          <ReviewCard
            key={education.id}
            title={`학력사항 ${draft.educations.length > 1 ? index + 1 : ""}`}
            columns={3}
            rows={[
              ["학교명", education.schoolName],
              ["학과(과)", education.major],
              [
                "학력 상태",
                GRADUATION_STATUS_OPTIONS.find(
                  (o) => o.code === education.graduationStatus,
                )?.label ?? "",
              ],
            ]}
          />
        ))}
        {draft.careers.map((career, index) => (
          <ReviewCard
            key={career.id}
            title={`경력사항 ${draft.careers.length > 1 ? index + 1 : ""}`}
            columns={3}
            rows={[
              ["회사/기관명", career.companyName],
              [
                "부서 · 직급",
                [career.department, career.position]
                  .filter(Boolean)
                  .join(" · "),
              ],
              ["재직 상태", career.isEmployed ? "재직 중" : "근무 종료"],
            ]}
            fullRows={[["담당 업무", career.jobDescription]]}
          />
        ))}
        <ReviewCard title="자기소개" fullRows={[["내용", draft.summary]]} />
        {draft.certificates.map((certificate, index) => (
          <ReviewCard
            key={certificate.id}
            title={`자격증 및 어학 ${draft.certificates.length > 1 ? index + 1 : ""}`}
            rows={[
              ["취득일자", certificate.acquiredDate || "미입력"],
              ["자격증명", certificate.name || "미입력"],
              ["발급기관", certificate.issuer || "미입력"],
              ["점수", certificate.score || "미입력"],
              ["비고", certificate.note || "미입력"],
            ]}
          />
        ))}
        <ReviewCard
          title="포트폴리오 · 링크"
          rows={[
            ["파일", draft.portfolioName],
            ...draft.links.map((link, index) => [
              `링크 ${index + 1}`,
              link.url,
            ]),
          ]}
        />
      </div>
    </ProfileRegistrationShell>
  );
}

function ConditionReviewCards({
  condition,
  jobCategories,
  jobRoles,
  skillOptions,
  workConditionsMeta,
}: {
  condition: FreelancerCondition;
  jobCategories: MetaOption[];
  jobRoles: MetaOption[];
  skillOptions: MetaOption[];
  workConditionsMeta: WorkConditionsMeta | null;
}) {
  const payAmount = Math.floor(condition.payAmount / 10_000).toLocaleString(
    "ko-KR",
  );
  const minAcceptAmount = Math.floor(
    condition.minAcceptAmount / 10_000,
  ).toLocaleString("ko-KR");
  const payUnitLabel = labelOf(
    workConditionsMeta?.payUnits ?? [],
    condition.payUnit,
  );
  const periodUnitLabel = labelOf(
    workConditionsMeta?.periodUnits ?? [],
    condition.periodUnit,
  );

  return (
    <>
      <ReviewCard
        title="희망 조건"
        rows={[
          ["직군", labelOf(jobCategories, condition.jobCategory)],
          ["직무", labelOf(jobRoles, condition.jobRole)],
          [
            "근무 방식",
            labelOf(workConditionsMeta?.workStyles ?? [], condition.workStyle),
          ],
          [
            "근무 형태",
            labelOf(workConditionsMeta?.workForms ?? [], condition.workForm),
          ],
          ["희망 급여", `${payUnitLabel} ${payAmount}만원`],
          [
            "최저 수용 금액",
            condition.minAcceptAmount ? `${minAcceptAmount}만원` : "미입력",
          ],
          [
            "시작 가능일",
            condition.startNegotiable
              ? "협의 가능"
              : (condition.availableFrom ?? "미입력"),
          ],
          [
            "예상 기간",
            condition.periodValue
              ? `${condition.periodValue}${periodUnitLabel}`
              : "미입력",
          ],
          ["프리랜서 경험", condition.hasFreelanceExperience ? "있음" : "없음"],
          [
            "전체 경력",
            condition.careerYears ? `${condition.careerYears}년` : "미입력",
          ],
        ]}
      />
      <FormCard>
        <h2 className="text-[14px] font-extrabold">보유 스킬</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {condition.skills.map((skill) => (
            <span
              key={skill.skillCode}
              className="rounded-full border border-brand bg-brand/10 px-3 py-1.5 text-[11px] font-bold text-brand"
            >
              {labelOf(skillOptions, skill.skillCode)} ·{" "}
              {labelOf(workConditionsMeta?.skillLevels ?? [], skill.skillLevel)}
            </span>
          ))}
        </div>
      </FormCard>
    </>
  );
}

export function CompleteScreen({
  name,
  onView,
}: {
  name: string;
  onView: () => void;
}) {
  return (
    <main className="min-h-screen bg-background px-4 py-16 text-center text-theme-primary">
      <div className="mx-auto max-w-[580px]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-surface text-3xl text-theme-success">
          ✓
        </div>
        <h1 className="mt-6 text-[25px] font-extrabold">
          프리랜서 프로필 등록이 완료되었습니다.
        </h1>
        <p className="mt-2 text-[12px] text-theme-secondary">
          등록된 프로필을 바탕으로 적합한 프로젝트를 추천해 드립니다.
        </p>
        <section className="mt-8 rounded-xl border border-theme bg-surface p-7 text-left">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-xl font-bold text-brand">
              {name.charAt(0)}
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold">{name}</h2>
            </div>
          </div>
        </section>
        <button
          type="button"
          onClick={onView}
          className="mt-6 inline-flex rounded-md border border-theme bg-surface px-6 py-3 text-[12px] font-bold"
        >
          내 프로필 보기
        </button>
      </div>
    </main>
  );
}

function ReviewCard({
  title,
  rows,
  fullRows,
  imagePreview,
  imageName,
  columns = 2,
}: {
  title: string;
  rows?: (string | undefined)[][];
  fullRows?: (string | undefined)[][];
  imagePreview?: string;
  imageName?: string;
  columns?: 2 | 3;
}) {
  const gridClassName =
    columns === 3 ? "grid gap-3 sm:grid-cols-3" : "grid gap-3 sm:grid-cols-2";
  return (
    <FormCard>
      <h2 className="text-[14px] font-extrabold">{title}</h2>
      <div
        className={
          imagePreview ? "mt-4 grid gap-5 sm:grid-cols-[126px_1fr]" : "mt-4"
        }
      >
        {imagePreview ? (
          <div className="w-[126px]">
            <div
              className="h-[162px] w-[126px] rounded-md border border-theme bg-cover bg-center"
              style={{ backgroundImage: `url(${imagePreview})` }}
              role="img"
              aria-label="등록한 프로필 사진 미리보기"
            />
            {imageName ? (
              <p className="mt-2 truncate text-[9px] text-theme-muted">
                {imageName}
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          {rows?.length ? (
            <dl className={gridClassName}>
              {rows.map(([label, value]) => (
                <div key={label} className="min-w-0 text-[11px]">
                  <dt className="font-semibold text-theme-secondary">
                    {label}
                  </dt>
                  <dd className="mt-2 min-h-10 break-all rounded-md border border-theme bg-surface px-3 py-2.5 font-semibold text-theme-primary">
                    {value || "미입력"}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
          {fullRows?.length ? (
            <dl className={rows?.length ? "mt-3 space-y-3" : "space-y-3"}>
              {fullRows.map(([label, value]) => (
                <div key={label} className="min-w-0 text-[11px]">
                  <dt className="font-semibold text-theme-secondary">
                    {label}
                  </dt>
                  <dd className="mt-2 min-h-10 whitespace-pre-wrap break-words rounded-md border border-theme bg-surface px-3 py-2.5 font-semibold text-theme-primary">
                    {value || "미입력"}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>
    </FormCard>
  );
}
