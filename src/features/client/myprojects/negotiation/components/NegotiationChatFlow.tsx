"use client";

import { useState } from "react";

import { NegotiationFailedCard } from "@/features/client/myprojects/negotiation/components/NegotiationFailedCard";
import { NegotiationResultCard } from "@/features/client/myprojects/negotiation/components/NegotiationResultCard";

type FlowStep = "setup" | "negotiating" | "review" | "adjust" | "complete";
type Decision = "accept" | "reject" | null;

interface NegotiationChatFlowProps {
  onGiveUp: () => void;
  isFailed?: boolean;
}

export function NegotiationChatFlow({ onGiveUp, isFailed = false }: NegotiationChatFlowProps) {
  const [step, setStep] = useState<FlowStep>("setup");
  const [round, setRound] = useState(1);
  const [salaryDecision, setSalaryDecision] = useState<Decision>(null);
  const [durationDecision, setDurationDecision] = useState<Decision>(null);
  const [minimumSalary, setMinimumSalary] = useState("340");
  const [minimumDuration, setMinimumDuration] = useState("5");

  const startNegotiation = () => setStep("negotiating");

  const openReview = () => {
    setSalaryDecision(null);
    setDurationDecision(null);
    setStep("review");
  };

  const confirmReview = () => {
    if (!salaryDecision || !durationDecision) return;
    setStep(salaryDecision === "accept" && durationDecision === "accept" ? "complete" : "adjust");
  };

  const restartNegotiation = () => {
    setRound((current) => current + 1);
    setSalaryDecision(null);
    setDurationDecision(null);
    setStep("negotiating");
  };

  return (
    <main className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] bg-white">
      <div className="shrink-0"><NegotiationHeader step={step} round={round} isFailed={isFailed} /></div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-7 pt-4">
        <TimelineDivider label={`AI 협상이 시작되었습니다. · ${round === 1 ? "14:00" : "14:35"}`} />
        <InitialOffer />

        {step === "setup" && !isFailed ? <SetupPanel onStart={startNegotiation} /> : null}

        {step !== "setup" ? (
          <>
            <AgentMessage side="left" time="14:20">
              조건 검토가 완료되었습니다. 최적 협상안을 도출했어요.
            </AgentMessage>

            {step === "negotiating" && !isFailed ? (
              <>
                <AgentMessage side="right" time="14:24">
                  근무형태 혼합을 제안합니다.
                  <small>근거: 업무 효율 유연성 확보</small>
                </AgentMessage>
                <AgentMessage side="left" time="14:26" emphasized>
                  근무형태 혼합 수락
                  <small>근거: 조건 부합, 합의 완료</small>
                </AgentMessage>
                <AgentMessage side="right" time="14:27">
                  연봉 350만 원 최종안
                  <small>근거: 마지막선 고려, 간극 절충</small>
                </AgentMessage>
                <div className="mt-8 flex justify-center">
                  <button type="button" onClick={openReview} className="h-[40px] cursor-pointer rounded-[9px] bg-[#8878e8] px-6 text-[12px] font-bold text-white hover:bg-[#7969dc]">
                    최종 조건 검토하기
                  </button>
                </div>
              </>
            ) : null}

            {step === "review" && !isFailed ? (
              <>
                <TimelineDivider label="대리인이 조건 안을 마련했습니다 · 14:28" />
                <ReviewPanel
                  salaryDecision={salaryDecision}
                  durationDecision={durationDecision}
                  onSalaryDecision={setSalaryDecision}
                  onDurationDecision={setDurationDecision}
                  onConfirm={confirmReview}
                />
              </>
            ) : null}

            {step === "adjust" && !isFailed ? (
              <>
                <TimelineDivider label="거절 조건을 다시 조정해 주세요 · 14:30" />
                <AdjustmentPanel
                  salaryRejected={salaryDecision === "reject"}
                  durationRejected={durationDecision === "reject"}
                  minimumSalary={minimumSalary}
                  minimumDuration={minimumDuration}
                  onMinimumSalaryChange={setMinimumSalary}
                  onMinimumDurationChange={setMinimumDuration}
                  onRestart={restartNegotiation}
                  onGiveUp={onGiveUp}
                />
              </>
            ) : null}

            {step === "complete" && !isFailed ? (
              <>
                <TimelineDivider label="모든 조건에 합의했습니다 · 14:30" />
                <div className="mt-8"><NegotiationResultCard result="complete" /></div>
              </>
            ) : null}
          </>
        ) : null}

        {isFailed ? (
          <>
            <TimelineDivider label="협상이 결렬되었습니다 · 14:31" />
            <div className="mt-8"><NegotiationFailedCard /></div>
          </>
        ) : null}
      </div>
    </main>
  );
}

function NegotiationHeader({ step, round, isFailed }: { step: FlowStep; round: number; isFailed: boolean }) {
  const isComplete = step === "complete";
  return (
    <div className="flex items-center justify-between border-b border-[#e8ebf0] px-5 py-4">
      <div>
        <h2 className="text-[16px] font-bold">AI 협상 로그</h2>
        <p className="mt-1 text-[11px] text-[#9ba3b2]">AI 에이전트 간 협상 과정</p>
      </div>
      <div className="flex items-center gap-3 text-[11px] font-semibold text-[#667085]">
        {step !== "setup" ? <span>라운드 {round} / 15</span> : null}
        <span className={`rounded-full border px-3 py-1.5 ${isFailed ? "border-[#fecdca] bg-[#fef3f2] text-[#d92d20]" : isComplete ? "border-[#abefc6] bg-[#ecfdf3] text-[#039855]" : "border-[#b9d4ff] bg-[#edf5ff] text-[#4b89f7]"}`}>
          {isFailed ? "× 협상 결렬" : isComplete ? "✓ 협상 완료" : "♙ 협상 중"}
        </span>
      </div>
    </div>
  );
}

function InitialOffer() {
  return (
    <div className="mt-5 flex justify-center">
      <div className="w-[255px] rounded-[14px] bg-[#e8eefc] px-5 py-4">
        <p className="text-[12px] font-bold text-[#3780f6]">초기 제안 조건</p>
        <p className="mt-2 text-[11px] text-[#79859a]">클라이언트 AI가 전달한 조건입니다.</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <ConditionValue label="연봉" value="320만 원" />
          <ConditionValue label="근무 형태" value="상시" />
        </div>
      </div>
    </div>
  );
}

function SetupPanel({ onStart }: { onStart: () => void }) {
  return (
    <div className="mt-6 flex justify-end">
      <section className="w-[360px] rounded-[14px] border border-[#e1e5eb] bg-white p-4 shadow-sm">
        <p className="text-[12px] leading-5 text-[#283142]">협상 전 최소 조건을 설정해 주세요.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <ConditionInput label="최소 연봉" value="350" suffix="만 원 이상" />
          <ConditionInput label="최소 기간" value="4" suffix="개월 이상" />
        </div>
        <p className="mt-4 text-[11px] font-bold text-[#667085]">허용 근무형태</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <OptionButton label="상주" /><OptionButton label="혼합" selected /><OptionButton label="재택" />
        </div>
        <button type="button" onClick={onStart} className="mt-5 h-[42px] w-full cursor-pointer rounded-[9px] bg-[#8878e8] text-[12px] font-bold text-white hover:bg-[#7969dc]">협상 시작</button>
      </section>
    </div>
  );
}

function ReviewPanel({ salaryDecision, durationDecision, onSalaryDecision, onDurationDecision, onConfirm }: { salaryDecision: Decision; durationDecision: Decision; onSalaryDecision: (value: Decision) => void; onDurationDecision: (value: Decision) => void; onConfirm: () => void }) {
  const canConfirm = salaryDecision !== null && durationDecision !== null;
  return (
    <div className="mt-6 flex justify-end">
      <section className="w-[310px] rounded-[14px] border border-[#e1e5eb] bg-white p-4 shadow-sm">
        <p className="text-[12px] font-semibold leading-5">상대 AI가 조건을 검토하고 있습니다.<br />각 조건에 대한 귀하의 의견을 선택해 주세요.</p>
        <DecisionRow label="연봉 350만 원" value={salaryDecision} onChange={onSalaryDecision} />
        <DecisionRow label="기간 6개월" value={durationDecision} onChange={onDurationDecision} />
        <p className="mt-4 text-[11px] text-[#98a2b3]">근무 형태 혼합</p>
        <div className="mt-2 rounded-[8px] border border-[#86efac] bg-[#ecfdf3] py-2 text-center text-[11px] font-bold text-[#16a34a]">♙ 이미 합의</div>
        <button type="button" disabled={!canConfirm} onClick={onConfirm} className="mt-4 h-[40px] w-full cursor-pointer rounded-[8px] bg-[#8878e8] text-[12px] font-bold text-white hover:bg-[#7969dc] disabled:cursor-not-allowed disabled:bg-[#c7c2f4]">확인</button>
      </section>
    </div>
  );
}

function AdjustmentPanel({ salaryRejected, durationRejected, minimumSalary, minimumDuration, onMinimumSalaryChange, onMinimumDurationChange, onRestart, onGiveUp }: { salaryRejected: boolean; durationRejected: boolean; minimumSalary: string; minimumDuration: string; onMinimumSalaryChange: (value: string) => void; onMinimumDurationChange: (value: string) => void; onRestart: () => void; onGiveUp: () => void }) {
  return (
    <div className="mt-6 flex justify-end">
      <section className="w-[330px] rounded-[14px] border border-[#e1e5eb] bg-white p-4 shadow-sm">
        <p className="text-[12px] font-semibold">거절한 조건의 마지막선을 조정해 주세요.</p>
        {salaryRejected ? (
          <div className="mt-4 rounded-[10px] border border-[#f7c65f] bg-[#fff9e8] p-3">
            <div className="flex justify-between text-[11px] font-bold text-[#d97706]"><span>연봉</span><span className="rounded bg-[#fff0b8] px-2 py-1">재입력 필요</span></div>
            <p className="mt-1 text-[10px] text-[#92400e]">직전 마지막선: 350만 원 이상</p>
            <div className="mt-3 flex items-center gap-2"><input type="number" min="1" value={minimumSalary} onChange={(event) => onMinimumSalaryChange(event.target.value)} className="h-[36px] w-full rounded-[7px] border border-[#f5b942] bg-white px-3 text-[11px] outline-none" /><span className="whitespace-nowrap text-[10px] text-[#667085]">만 원 이상</span></div>
          </div>
        ) : null}
        {durationRejected ? (
          <div className="mt-4 rounded-[10px] border border-[#f7c65f] bg-[#fff9e8] p-3">
            <div className="flex justify-between text-[11px] font-bold text-[#d97706]"><span>기간</span><span className="rounded bg-[#fff0b8] px-2 py-1">재입력 필요</span></div>
            <p className="mt-1 text-[10px] text-[#92400e]">직전 마지막선: 5개월 이상</p>
            <div className="mt-3 flex items-center gap-2"><input type="number" min="1" value={minimumDuration} onChange={(event) => onMinimumDurationChange(event.target.value)} className="h-[36px] w-full rounded-[7px] border border-[#f5b942] bg-white px-3 text-[11px] outline-none" /><span className="whitespace-nowrap text-[10px] text-[#667085]">개월 이상</span></div>
          </div>
        ) : null}
        {!salaryRejected ? <div className="mt-3 rounded-[10px] border border-[#e4e7ec] bg-[#f9fafb] p-3"><div className="flex items-center justify-between"><span className="text-[10px] text-[#98a2b3]">연봉</span><span className="rounded border border-[#abefc6] bg-[#ecfdf3] px-2 py-1 text-[10px] font-bold text-[#039855]">♙ 합의 완료</span></div><p className="mt-1 text-[11px] font-bold text-[#667085]">350만 원</p></div> : null}
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2"><button type="button" onClick={onRestart} className="h-[40px] cursor-pointer rounded-[8px] bg-[#8878e8] text-[12px] font-bold text-white hover:bg-[#7969dc]">다시 협상</button><button type="button" onClick={onGiveUp} className="h-[40px] cursor-pointer rounded-[8px] border border-[#f04438] bg-white px-4 text-[12px] font-bold text-[#f04438] hover:bg-[#fff5f4]">협상 포기</button></div>
      </section>
    </div>
  );
}

function DecisionRow({ label, value, onChange }: { label: string; value: Decision; onChange: (value: Decision) => void }) {
  return <div className="mt-4"><p className="text-[11px] text-[#98a2b3]">{label}</p><div className="mt-2 grid grid-cols-2 gap-2"><DecisionButton label="수락" selected={value === "accept"} onClick={() => onChange("accept")} /><DecisionButton label="거절" selected={value === "reject"} onClick={() => onChange("reject")} /></div></div>;
}

function DecisionButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`h-[36px] cursor-pointer rounded-[7px] border text-[11px] font-bold ${selected ? "border-[#8b7cf6] bg-[#f2f0ff] text-[#7969dc]" : "border-[#dfe3e8] bg-white text-[#667085]"}`}>{label}</button>;
}

function TimelineDivider({ label }: { label: string }) {
  return <div className="mt-4 flex items-center gap-3"><div className="h-px flex-1 bg-[#e7eaf0]" /><span className="whitespace-nowrap text-[10px] text-[#a5adbb]">{label}</span><div className="h-px flex-1 bg-[#e7eaf0]" /></div>;
}

function AgentMessage({ side, time, emphasized = false, children }: { side: "left" | "right"; time: string; emphasized?: boolean; children: React.ReactNode }) {
  const isLeft = side === "left";
  return <div className={`mt-5 flex ${isLeft ? "justify-start" : "justify-end"}`}><div className={`flex max-w-[420px] items-start gap-2 ${isLeft ? "" : "flex-row-reverse"}`}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8878e8] text-[11px] font-bold text-white">{isLeft ? "F" : "C"}</span><div><p className={`mb-1 text-[10px] text-[#a5adbb] ${isLeft ? "" : "text-right"}`}>{isLeft ? "프리랜서 AI" : "클라이언트 AI"} · {time}</p><div className={`rounded-[12px] px-4 py-2.5 text-[12px] leading-5 ${isLeft || emphasized ? "bg-[#8878e8] text-white" : "border border-[#e1e5eb] bg-white text-[#283142]"}`}>{children}</div></div></div></div>;
}

function ConditionValue({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[10px] bg-white px-4 py-3"><p className="text-[10px] text-[#9da6b5]">{label}</p><p className="mt-1 text-[18px] font-bold">{value}</p></div>;
}

function ConditionInput({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  return <div><label className="text-[10px] font-bold text-[#667085]">{label}</label><div className="mt-2 rounded-[8px] border border-[#e2e5ea] px-3 py-2"><strong className="text-[16px]">{value}</strong><span className="ml-1 text-[9px] text-[#98a2b3]">{suffix}</span></div></div>;
}

function OptionButton({ label, selected = false }: { label: string; selected?: boolean }) {
  return <button type="button" className={`h-[34px] cursor-pointer rounded-[7px] text-[11px] ${selected ? "bg-[#8878e8] font-bold text-white" : "bg-[#f3f4f7] text-[#7d8798]"}`}>{label}</button>;
}
