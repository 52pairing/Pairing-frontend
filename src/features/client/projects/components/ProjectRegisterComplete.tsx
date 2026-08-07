"use client";

// 프로젝트 등록 완료 화면 (Step6 등록 후 이동)
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useProjectRegister } from "@/features/client/projects/context/ProjectRegisterContext";
import { PaymentMethodModal } from "@/features/payment/components/PaymentMethodModal";

function formatKoreanDate(iso?: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

export function ProjectRegisterComplete() {
  const router = useRouter();
  const { form, reset } = useProjectRegister();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const recruits = form.recruits ?? [];
  const positions = recruits
    .map((r) => `${r.job || "직무 미지정"}×${r.count}`)
    .join(", ");
  const budgetWon = (form.budget ?? 0) * 10000;
  const startText = form.startDate
    ? formatKoreanDate(form.startDate)
    : form.startNegotiable
      ? "협의 가능"
      : "-";

  const goMyProjects = () => {
    reset();
    router.push("/client/projects");
  };

  // TODO: 실제 프로젝트 상세 경로(/client/projects/[id])는 백엔드 연동 후 연결
  const goDetail = () => {
    router.push("/client/projects");
  };

  const goPayment = () => {
    setIsPaymentModalOpen(true);
  };

  const completePayment = () => {
    setIsPaymentModalOpen(false);
    reset();
    router.push("/client/payments/complete");
  };

  const upfrontFee = Math.round(budgetWon * 0.03);

  return (
    <main
      className="h-[calc(100dvh-60px)] overflow-hidden bg-[#f7f8fa] text-[#111827]"
      style={{
        fontFamily:
          '"Pretendard", "Noto Sans KR", Arial, Helvetica, sans-serif',
      }}
    >
      <div className="mx-auto w-full max-w-[980px] px-6 py-4">
        <div className="mx-auto mt-10 max-w-[720px] text-center">
          {/* 완료 아이콘 */}
          <span className="mx-auto flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#e7f7ee]">
            <svg
              width="30"
              height="30"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="16" cy="16" r="11" stroke="#12b76a" strokeWidth="2" />
              <path
                d="M11 16.2L14.5 19.7L21 12.5"
                stroke="#12b76a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <h1 className="mt-5 text-[24px] font-extrabold tracking-[-0.04em] text-[#111827]">
            프로젝트 등록 완료!
          </h1>

          <p className="mt-3 text-[13px] font-medium leading-6 text-[#667085]">
            <span className="font-bold text-[#111827]">
              {form.projectName || "프로젝트"}
            </span>{" "}
            프로젝트가 등록되었습니다.
            <br />
            AI 추천을 시작하려면 착수금 결제가 필요합니다.
          </p>

          {/* 요약 카드 */}
          <section className="mt-8 rounded-[14px] border border-[#e5e9ef] bg-white px-8 py-7 text-left">
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <SummaryItem label="프로젝트명" value={form.projectName || "-"} />
              <SummaryItem label="모집 포지션" value={positions || "-"} />
              <SummaryItem
                label="프로젝트 기간"
                value={
                  form.durationMonths != null
                    ? `${form.durationMonths}개월`
                    : "-"
                }
              />
              <SummaryItem
                label="예산"
                value={
                  form.budget != null
                    ? `${budgetWon.toLocaleString("ko-KR")}원`
                    : "-"
                }
              />
              <SummaryItem label="시작 희망일" value={startText} />
              <SummaryItem
                label="현재 상태"
                value={
                  <span className="inline-flex rounded-[6px] bg-[#eee9ff] px-2 py-[3px] text-[11px] font-bold text-[#6b4eff]">
                    등록 완료
                  </span>
                }
              />
            </div>
          </section>

          {/* 안내 */}
          <div className="mt-4 flex items-center gap-2 rounded-[10px] border border-[#f4d367] bg-[#fffbed] px-4 py-3 text-left">
            <svg
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              className="shrink-0"
            >
              <path
                d="M8 2.5L14.5 13.5H1.5L8 2.5Z"
                stroke="#d97706"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
              <path d="M8 6.5V9.5" stroke="#d97706" strokeWidth="1.3" strokeLinecap="round" />
              <circle cx="8" cy="11.4" r="0.7" fill="#d97706" />
            </svg>

            <p className="text-[11px] font-bold leading-5 text-[#b45309]">
              착수금 결제 전에는 AI 추천 후보 메뉴를 이용할 수 없습니다. 결제 후
              추천 후보를 확인할 수 있습니다.
            </p>
          </div>

          {/* 버튼 */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={goMyProjects}
              className="flex h-[46px] cursor-pointer items-center justify-center rounded-[9px] border border-[#dce2e8] bg-white px-6 text-[12px] font-semibold text-[#8b95a5] transition hover:bg-[#f8fafc]"
            >
              내 프로젝트로 이동
            </button>

            <button
              type="button"
              onClick={goDetail}
              className="flex h-[46px] cursor-pointer items-center justify-center rounded-[9px] border border-[#c3ccd8] bg-white px-6 text-[12px] font-bold text-[#344054] transition hover:bg-[#f8fafc]"
            >
              프로젝트 상세보기
            </button>

            <button
              type="button"
              onClick={goPayment}
              className="flex h-[46px] cursor-pointer items-center justify-center gap-1 rounded-[9px] bg-[#17365d] px-6 text-[12px] font-bold text-white transition hover:bg-[#102a49]"
            >
              착수금 결제하기
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>

      <PaymentMethodModal
        open={isPaymentModalOpen}
        payment={{
          type: "UPFRONT_FEE",
          title: "착수금 수수료",
          description: form.projectName || "프로젝트",
          amount: upfrontFee,
        }}
        onClose={() => setIsPaymentModalOpen(false)}
        onPay={completePayment}
      />
    </main>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[12px] font-medium text-[#98a2b3]">{label}</p>
      <div className="mt-1.5 text-[13px] font-bold text-[#111827]">{value}</div>
    </div>
  );
}
