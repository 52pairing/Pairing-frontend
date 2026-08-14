"use client";

import { useEffect, useRef, useState } from "react";

import type { ProjectContentPrecheckResult } from "@/features/client/projects/types/contentPrecheck";
import { runProjectContentPrecheck } from "@/features/client/projects/utils/projectContentPrecheck";

interface ProjectContentPrecheckProps {
  mainTask?: string;
  detailScope?: string;
}

type CheckStatus = "idle" | "checking" | "done" | "error";

const FIELD_LABEL = {
  mainTask: "주요 업무",
  detailScope: "상세 업무 범위",
  both: "두 항목",
} as const;

export function ProjectContentPrecheck({
  mainTask,
  detailScope,
}: ProjectContentPrecheckProps) {
  const [status, setStatus] = useState<CheckStatus>("idle");
  const [result, setResult] = useState<ProjectContentPrecheckResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const startCheck = () => {
    if (status === "checking") return;
    setStatus("checking");

    timerRef.current = setTimeout(() => {
      try {
        setResult(runProjectContentPrecheck({ mainTask, detailScope }));
        setStatus("done");
      } catch {
        setResult(null);
        setStatus("error");
      } finally {
        timerRef.current = null;
      }
    }, 100);
  };

  return (
    <section
      aria-labelledby="content-precheck-title"
      className="mt-4 rounded-[12px] border border-[#c7d6ee] bg-[#f8fbff] px-5 py-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e8f0ff] text-[12px] font-extrabold text-brand"
            >
              ✓
            </span>
            <h2
              id="content-precheck-title"
              className="text-[13px] font-extrabold text-theme-primary"
            >
              작성 내용 사전 점검
            </h2>
          </div>
          <p className="mt-2 max-w-[500px] text-[11px] font-medium leading-5 text-theme-secondary">
            연락처 같은 개인정보가 포함되었는지, 업무 내용이 충분히 작성되었는지
            확인합니다. 점검 결과는 참고용이며 프로젝트 등록을 제한하지 않습니다.
          </p>
        </div>
        <button
          type="button"
          onClick={startCheck}
          disabled={status === "checking"}
          className={`h-9 shrink-0 rounded-[7px] px-4 text-[11px] font-bold text-white transition ${
            status === "checking"
              ? "cursor-not-allowed bg-[#8fa3bf]"
              : "cursor-pointer bg-brand hover:bg-brand"
          }`}
        >
          {status === "checking"
            ? "점검 중..."
            : status === "done" || status === "error"
              ? "다시 점검하기"
              : "작성 내용 점검하기"}
        </button>
      </div>

      <div className="mt-4 border-t border-[#dce6f4] pt-4">
        {status === "idle" ? (
          <p className="text-[11px] leading-5 text-theme-muted">
            원문과 점검 결과를 별도로 저장하거나 외부 분석 서비스로 전송하지 않습니다.
          </p>
        ) : null}

        {status === "checking" ? (
          <p role="status" className="text-[11px] font-semibold text-theme-secondary">
            작성 내용을 점검하고 있습니다.
          </p>
        ) : null}

        {status === "error" ? (
          <div role="alert" className="rounded-[8px] bg-[#fff4f2] px-4 py-3">
            <p className="text-[11px] font-bold text-theme-danger">
              점검을 완료하지 못했습니다.
            </p>
            <p className="mt-1 text-[10px] leading-5 text-theme-secondary">
              다시 시도하거나 점검을 건너뛸 수 있습니다. 프로젝트 등록에는 영향이 없습니다.
            </p>
          </div>
        ) : null}

        {status === "done" && result ? (
          result.findings.length === 0 ? (
            <div role="status" className="rounded-[8px] bg-[#edf9f2] px-4 py-3">
              <p className="text-[11px] font-bold text-[#087a46]">
                작성 내용 점검을 완료했습니다.
              </p>
              <p className="mt-1 text-[10px] leading-5 text-theme-secondary">
                실제 업무 범위와 완료 기준이 충분한지는 최종 등록 전에 직접 확인해 주세요.
              </p>
            </div>
          ) : (
            <div>
              <p role="status" className="text-[11px] font-bold text-theme-primary">
                확인할 항목 {result.findings.length}개
              </p>
              <ul className="mt-3 space-y-2">
                {result.findings.map((finding) => (
                  <li
                    key={finding.id}
                    className="rounded-[8px] border border-[#dce6f4] bg-surface px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-surface-subtle px-2 py-1 text-[9px] font-bold text-theme-secondary">
                        {FIELD_LABEL[finding.field]}
                      </span>
                      <p className="text-[11px] font-bold text-theme-primary">
                        {finding.title}
                      </p>
                    </div>
                    <p className="mt-2 text-[10px] leading-5 text-theme-secondary">
                      {finding.description}
                    </p>
                    {finding.maskedValue ? (
                      <p className="mt-1 font-mono text-[10px] font-bold text-theme-danger">
                        감지 값: {finding.maskedValue}
                      </p>
                    ) : null}
                    {finding.questions.map((question) => (
                      <p
                        key={question}
                        className="mt-2 text-[10px] font-semibold leading-5 text-brand"
                      >
                        확인 질문 · {question}
                      </p>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          )
        ) : null}
      </div>
    </section>
  );
}
