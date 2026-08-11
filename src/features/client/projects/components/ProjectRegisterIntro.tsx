"use client";

// 클라이언트 프로젝트 등록 - 등록 전 안내(Step 1) 화면
import { useRouter } from "next/navigation";

import {
  GuideCard,
  GuideLine,
} from "@/features/client/projects/components/GuideCard";
import { ProjectRegisterShell } from "@/features/client/projects/components/ProjectRegisterShell";
import { nextStep } from "@/features/client/projects/constants/steps";
import { useProjectRegister } from "@/features/client/projects/context/ProjectRegisterContext";

export function ProjectRegisterIntro() {
  const router = useRouter();
  const { form, patch } = useProjectRegister();
  const noticeAgreed = form.noticeAgreed ?? false;

  const handleStart = () => {
    if (!noticeAgreed) return;

    const next = nextStep(1);
    if (next) router.push(next.path);
  };

  return (
    <ProjectRegisterShell currentStep={1} backHref="/client" backLabel="홈으로">
      <div className="mx-auto mt-12 max-w-[730px]">
        <h1 className="text-[24px] font-extrabold tracking-[-0.04em] text-theme-primary">
              프로젝트 등록 전 안내
            </h1>

            <p className="mt-3 text-[12px] font-semibold leading-6 text-theme-secondary">
              등록한 프로젝트 조건을 기준으로 AI가 적합한 프리랜서를
              추천합니다.
              <br />
              착수금 수수료를 결제하기 전까지는 실제 후보 추천 및 매칭이
              시작되지 않습니다.
            </p>

            <GuideCard title="프로젝트 등록 및 추천 방식">
              <GuideLine>
                프로젝트 조건과 직군별 모집 조건을 바탕으로 AI가 적합한
                프리랜서를 추천합니다.
              </GuideLine>

              <GuideLine>
                추천된 후보 중 실제 매칭을 요청할 프리랜서는 클라이언트가 직접
                선택합니다.
              </GuideLine>

              <GuideLine>
                확인할 수 있는 추천 후보 수는 클라이언트 등급에 따라 달라질 수
                있습니다.
              </GuideLine>
            </GuideCard>

            <GuideCard title="AI 사전 검수 안내">
              <GuideLine>
                등록 전 AI가 현재 Pairing에 등록된 프리랜서 중 프로젝트 조건에
                맞는 예상 후보 수와 매칭 가능성을 확인합니다.
              </GuideLine>

              <GuideLine>
                직군별 예상 후보 수와 매칭이 어려운 조건을 분석하고, 조정이
                필요한 항목을 안내합니다.
              </GuideLine>

              <GuideLine>
                사전 검수 결과는 현재 등록된 정보를 기준으로 한 예상 결과이며,
                실제 후보 수와 매칭 성사 여부는 달라질 수 있습니다.
              </GuideLine>
            </GuideCard>

            <GuideCard title="매칭 및 재추천 안내">
              <GuideLine>
                기본 매칭 기간 2주 · 1회당 1주씩 최대 2회 연장 가능 · 최대 매칭
                기간 총 4주
              </GuideLine>

              <GuideLine>
                프로젝트당 무료 재추천 1회, 유료 재추천 5회까지 이용할 수
                있어요. (총 6회)
                <br />
                추천된 프리랜서가 요청을 모두 거절하면 무료 재추천이
                활성화됩니다.
                <br />
                유료 재추천은 후보 1명당 10,000원이 부과됩니다.
              </GuideLine>

              <GuideLine>
                매칭 요청 응답 기간 3일 · 거절하거나 응답 기한이 만료된
                프리랜서는 해당 프로젝트에서 재선택 불가
              </GuideLine>
            </GuideCard>

            <GuideCard title="계약 및 수수료 안내">
              <GuideLine>
                착수금 수수료: 계약 금액 1억 원 미만 기준 클라이언트 3% ·
                프리랜서 4%
                <br />
                <span className="pl-4">
                  ※ 계약 금액이 1억 원 이상인 경우 클라이언트 수수료는 2%가
                  적용됩니다.
                </span>
              </GuideLine>

              <GuideLine>
                성공보수 수수료: 계약 금액 1억 원 미만 기준 클라이언트 7% ·
                프리랜서 6%
                <br />
                <span className="pl-4">
                  ※ 계약 금액이 1억 원 이상인 경우 클라이언트 수수료는 6%가
                  적용됩니다.
                </span>
              </GuideLine>

              <GuideLine>
                실제 프로젝트 용역비는 플랫폼을 거치지 않으며, 클라이언트가
                프리랜서에게 직접 지급합니다.
              </GuideLine>
            </GuideCard>

            <div className="mt-1">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={noticeAgreed}
                  onChange={(e) => patch({ noticeAgreed: e.target.checked })}
                  className="mt-[2px] h-[15px] w-[15px] cursor-pointer accent-[#17365d]"
                />

                <span className="text-[11px] font-semibold leading-5 text-theme-secondary">
                  프로젝트 등록 내용을 모두 확인했으며, 위 안내에 동의합니다.
                  <span className="ml-1 font-bold text-theme-danger">(필수)</span>
                </span>
              </label>

              <p className="ml-[27px] mt-1 text-[10px] text-theme-muted">
                동의하지 않으면 프로젝트 등록을 진행할 수 없습니다.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStart}
              disabled={!noticeAgreed}
              className={[
                "mt-8 flex h-[56px] w-full items-center justify-center rounded-[10px]",
                "text-[15px] font-bold transition",
                noticeAgreed
                  ? "bg-brand text-white hover:bg-brand"
                  : "cursor-not-allowed bg-[#a7b0bf] text-white",
              ].join(" ")}
            >
              등록 시작하기
            </button>
      </div>
    </ProjectRegisterShell>
  );
}
