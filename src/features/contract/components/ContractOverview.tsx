"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState, useSyncExternalStore } from "react";

import { ContractSignModal } from "@/features/contract/components/ContractSignModal";

const CONTRACT_CONDITIONS = [
  ["프로젝트", "AI 추천 엔진 개발"],
  ["클라이언트", "카카오"],
  ["역할", "AI · ML 엔지니어"],
  ["금액", "월 6,000,000원"],
  ["기간", "2026.09.01~2026.12.31"],
  ["근무 형태", "재택 / 풀타임"],
  ["서명 기한", "2026.08.10"],
];

interface ContractOverviewProps {
  role: "client" | "freelancer";
}

export function ContractOverview({ role }: ContractOverviewProps) {
  const router = useRouter();
  const params = useParams<{ projectId?: string; contractId: string }>();
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

  const contractPath = role === "client"
    ? `/client/projects/${params.projectId}/contracts/${params.contractId}`
    : `/freelancer/contracts/${params.contractId}`;
  const signPath = `${contractPath}/sign`;
  const backHref = role === "client"
    ? `/client/projects/${params.projectId}`
    : "/freelancer/contracts";
  const subscribeToContractState = useCallback((onStoreChange: () => void) => {
    window.addEventListener("contract-signed", onStoreChange);
    return () => window.removeEventListener("contract-signed", onStoreChange);
  }, []);
  const getContractState = useCallback(
    () => window.sessionStorage.getItem(`${role}-contract-${params.contractId}-signed`) === "true",
    [params.contractId, role],
  );
  const isSigned = useSyncExternalStore(subscribeToContractState, getContractState, () => false);

  return (
    <main className="min-h-screen bg-background px-5 py-5 text-theme-primary">
      <div className="mx-auto w-full max-w-[960px]">
        <Link href={backHref} className="text-[12px] font-semibold text-theme-secondary hover:underline">← 내 계약</Link>

        <header className="mt-7">
          <h1 className="text-[20px] font-extrabold tracking-[-0.04em]">AI 추천 엔진 개발</h1>
          <p className="mt-4 text-[11px] font-medium text-theme-muted">카카오 · AI · ML 엔지니어</p>
        </header>

        <section className="mt-4 grid grid-cols-3 gap-2.5">
          <StatusCard active={!isSigned} complete={isSigned} title="클라이언트 서명" name="김클라이언트" status={isSigned ? "✓ 서명 완료" : "서명 대기 중"} />
          <StatusCard title="프리랜서 서명" name="김프리" status="✓ 서명 완료" />
          <StatusCard complete={isSigned} title="계약 확정" name={isSigned ? "계약 최종 확정" : "서명 대기 중"} status={isSigned ? "확정일: 2026.08.03" : "양측 서명 완료 시 확정"} />
        </section>

        <section className="mt-3 rounded-[10px] border border-[#e1e6ed] bg-surface px-6 py-5">
          <h2 className="text-[13px] font-bold">계약 조건</h2>
          <dl className="mt-4 grid gap-x-12 gap-y-3 md:grid-cols-2">
            {CONTRACT_CONDITIONS.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[100px_1fr] text-[11px]">
                <dt className="text-theme-muted">{label}</dt>
                <dd className="font-bold text-theme-primary">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-3 rounded-[10px] border border-[#e1e6ed] bg-surface p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[13px] font-bold">계약서 PDF 미리보기</h2>
              <p className="mt-1 text-[11px] text-theme-muted">계약 내용을 확인한 후 서명을 진행해 주세요.</p>
            </div>
            <button type="button" onClick={() => window.print()} className="h-8 cursor-pointer rounded-[7px] border border-[#dce2ea] px-3 text-[11px] font-semibold text-theme-secondary transition hover:bg-surface-subtle">PDF 다운로드</button>
          </div>

          <PdfPreview />

          <div className="mt-4 rounded-[8px] border border-[#cbdbea] bg-[#eef5fb] px-4 py-3.5">
            <p className="text-[12px] font-bold text-theme-secondary">계약 내용을 확인하고 서명해 주세요.</p>
            <p className="mt-2 text-[11px] leading-5 text-theme-secondary">서명은 전자 서명으로 처리되며 법적 효력이 있습니다. 계약 내용에 동의하는 경우에만 서명해 주세요.<br />서명 기한: 2026.08.10까지 · 서명하지 않으면 계약이 자동으로 취소될 수 있습니다.</p>
            <button type="button" onClick={() => setIsSignModalOpen(true)} className="mt-3 h-9 cursor-pointer rounded-[7px] bg-brand px-4 text-[11px] font-bold text-white transition hover:bg-brand">계약서 서명하기</button>
          </div>
        </section>
      </div>

      {isSignModalOpen && (
        <ContractSignModal
          onCancel={() => setIsSignModalOpen(false)}
          onConfirm={() => router.push(signPath)}
          projectName="AI 추천 엔진 개발"
          company="카카오"
          roleName="AI · ML 엔지니어"
        />
      )}
    </main>
  );
}

function StatusCard({ title, name, status, active = false, complete = false }: { title: string; name: string; status: string; active?: boolean; complete?: boolean }) {
  const colorClass = complete ? "border-[#a7e8c4] bg-[#effcf4]" : active ? "border-[#c9d9ed] bg-[#eef5fb]" : "border-[#e1e6ed] bg-surface";
  const statusClass = complete ? "text-theme-success" : active ? "text-[#2f6fed]" : "text-theme-muted";
  return <article className={`min-h-[116px] rounded-[10px] border p-4 ${colorClass}`}><p className={`text-[10px] font-semibold ${complete ? "text-theme-success" : "text-theme-muted"}`}>{complete ? "✓ " : ""}{title}</p><p className={`mt-3 text-[12px] font-bold ${complete ? "text-[#168653]" : ""}`}>{name}</p><p className={`mt-1.5 text-[10px] font-semibold ${statusClass}`}>{status}</p></article>;
}

function PdfPreview() {
  return (
    <div className="mx-auto mt-5 max-w-[700px] rounded-[9px] border border-[#e2e6ec] bg-[#fafbfc] p-4">
      <div className="mx-auto min-h-[560px] max-w-[570px] bg-surface px-10 py-8 shadow-[0_1px_5px_rgba(15,23,42,0.08)]">
        <h3 className="text-center text-[16px] font-bold">프리랜서 용역 계약서</h3>
        <p className="mt-2 text-center text-[9px] text-theme-muted">계약 번호: CNT-2026-00127 · 작성일: 2026.08.02</p>
        <PdfSection title="1. 계약 당사자"><div className="grid grid-cols-2 gap-4"><MiniParty title="발주자 (클라이언트)" name="김클라" detail="ABC Company · client@abc.com" /><MiniParty title="수주자 (프리랜서)" name="김프리" detail="프론트엔드 개발자 · kimpre@dev.com" /></div></PdfSection>
        <PdfSection title="2. 용역 내용"><MiniRows rows={[["프로젝트명", "프론트엔드 서비스 개발"], ["직무", "프론트엔드 개발자"], ["계약 기간", "2026.08.20 ~ 2027.02.19"], ["근무 방식", "재택"], ["근무 형태", "풀타임"], ["업무 범위", "React 및 Next.js 기반 UI 구현과 유지보수"]]} /></PdfSection>
        <PdfSection title="3. 보수 및 지급"><MiniRows rows={[["급여", "월 500만원"], ["지급 방식", "월별 지급"], ["지급일", "매월 25일"]]} /></PdfSection>
        <PdfSection title="4. 기타 조항"><p className="text-[9px] leading-5 text-theme-secondary">• 비밀유지: 계약 기간 및 종료 후 관련 정보를 외부에 공개하지 않습니다.<br />• 지식재산권: 계약을 통해 생성된 모든 결과물의 권리는 발주자에게 귀속됩니다.</p></PdfSection>
        <div className="mt-8 grid grid-cols-2 gap-5"><SignatureBox label="발주자 (서명)" name="김클라" /><SignatureBox label="수주자 (서명)" name="김프리" /></div>
      </div>
    </div>
  );
}

function PdfSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-7"><h4 className="border-b border-[#163760] pb-2 text-[11px] font-bold">{title}</h4><div className="mt-3">{children}</div></section>; }
function MiniParty({ title, name, detail }: { title: string; name: string; detail: string }) { return <div className="rounded-[5px] bg-surface-subtle p-3 text-[9px]"><p className="text-theme-muted">{title}</p><p className="mt-3 font-bold">{name}</p><p className="mt-2 text-theme-secondary">{detail}</p></div>; }
function MiniRows({ rows }: { rows: string[][] }) { return <div>{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[105px_1fr] border-b border-theme py-2 text-[9px]"><span className="text-theme-muted">{label}</span><span className="font-semibold">{value}</span></div>)}</div>; }
function SignatureBox({ label, name }: { label: string; name: string }) { return <div className="rounded-[6px] border border-[#e2e6ec] py-5 text-center text-[9px]"><p className="text-theme-muted">{label}</p><p className="mt-3 text-[11px] font-bold">{name}</p><div className="mx-auto mt-4 flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-[#d6dbe3] text-[8px] text-theme-muted">전자서명</div></div>; }
