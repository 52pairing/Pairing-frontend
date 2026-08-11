"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { ContractCompleteModal } from "@/features/contract/components/ContractCompleteModal";

const CLIENT_ROWS = [
  ["기업명", "카카오 주식회사"],
  ["사업자등록번호", "120-81-47521"],
  ["대표자", "정신아"],
  ["주소", "경기도 성남시 분당구 판교역로 235"],
  ["연락처", "02-1234-5678"],
];

const FREELANCER_ROWS = [
  ["성명", "김민준"],
  ["연락처", "010-9876-5432"],
  ["직군", "백엔드 개발자"],
  ["정산 계좌", "카카오뱅크 3333-01-2345678 (김민준)"],
];

const SCOPE_ROWS = [
  ["프로젝트명", "모바일 앱 백엔드 API 개발"],
  ["담당 업무", "모바일 앱용 RESTful API 설계 및 개발"],
  ["산출물", "소스코드, API 명세서, 배포 가이드"],
  ["세부 업무 범위", "Node.js 기반 RESTful API 설계 및 구현, 데이터베이스 스키마 설계 및 최적화, AWS 인프라 구성 및 배포, CI/CD 파이프라인 구축"],
  ["요구 기술·직무", "Node.js, TypeScript, AWS, PostgreSQL"],
];

const AMOUNT_ROWS = [
  ["총 계약 금액", "42,000,000원 (부가세 별도)"],
  ["착수금", "4,200,000원 — 계약 체결 시 지급"],
  ["성공보수(잔금)", "37,800,000원 — 완료·검수 후 지급"],
];

const ARTICLES = [
  { title: "제5조 (대금 지급)", lines: ["① 용역비는 갑이 을에게 직접 지급하며 플랫폼은 개입하지 않는다.", "② 착수금은 계약 체결 시 을의 정산 계좌로 지급한다.", "③ 성공보수는 검수 완료 후 7일 이내에 지급한다."] },
  { title: "제8조 (검수 및 완료)", lines: ["① 을은 계약 기간 내 산출물을 제출한다.", "② 갑은 산출물 수령 후 7일 이내 검수를 완료한다.", "③ 검수 통과 시 완료가 확정된다.", "④ 하자 발생 시 갑은 7일 이내 서면으로 보완을 요청할 수 있다."] },
  { title: "제9조 (지식재산권)", lines: ["① 산출물의 지식재산권은 대금 완납 시 갑에게 귀속된다.", "② 을은 산출물이 제3자의 권리를 침해하지 않음을 보증한다."] },
  { title: "제10조 (비밀유지)", lines: ["① 양 당사자는 계약 수행 중 알게 된 상대방의 비밀정보를 제3자에게 누설하지 않는다.", "② 비밀유지 의무는 계약 종료 후 3년간 유효하다."] },
  { title: "제12조 (계약 해지 및 위약금)", lines: ["① 일방이 계약을 위반하고 14일 이내에 시정하지 않는 경우 상대방은 계약을 해지할 수 있다.", "② 을 파기 시 수행분 정산 후 총 계약 금액의 10%를 위약금으로 지급한다.", "③ 갑 파기 시 수행분 지급 후 총 계약 금액의 10%를 위약금으로 지급한다."] },
  { title: "제14조 (분쟁 해결)", lines: ["① 준거법은 대한민국 법률을 적용한다.", "② 관할은 민사소송법상의 관할 법원으로 한다.", "③ 플랫폼의 분쟁 조정 절차를 우선 적용한다."] },
];

interface ContractDocumentProps {
  role: "client" | "freelancer";
}

export function ContractDocument({ role }: ContractDocumentProps) {
  const router = useRouter();
  const params = useParams<{ projectId?: string; contractId: string }>();
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  const completeContract = () => {
    window.sessionStorage.setItem(`${role}-contract-${params.contractId}-signed`, "true");
    setIsCompleteModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#f3f5fa] text-[#182235]">
      <header className="border-b border-[#e8ebf0] bg-surface">
        <div className="mx-auto flex h-[52px] max-w-[860px] items-center gap-3 px-5">
          <Link href=".." className="text-[13px] font-medium text-theme-muted hover:text-theme-secondary">&lt; 계약 상세로</Link>
          <span className="text-[#c7ced8]">|</span>
          <h1 className="text-[15px] font-bold text-theme-primary">계약서 미리보기</h1>
        </div>
      </header>

      <div className="mx-auto max-w-[860px] px-5 py-6">
        <div className="mb-4 rounded-[9px] border border-[#f0d28a] bg-[#fff8e8] px-4 py-2.5 text-[12px] font-medium text-[#b06d1c]">
          계약서 내용을 최종 확인해 주세요. 전자 서명 후에는 수정이 불가합니다.
        </div>

        <article className="rounded-[15px] bg-surface px-10 py-8 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="text-center">
            <h2 className="text-[22px] font-bold tracking-[-0.02em]">프리랜서 용역 계약서</h2>
            <p className="mt-2 text-[12px] text-theme-muted">계약 번호: CNT-2026-00127 · 작성일: 2026.08.07</p>
          </div>

          <SectionTitle title="당사자 표시" className="mt-8" />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <PartyCard title="갑 (클라이언트)" rows={CLIENT_ROWS} />
            <PartyCard title="을 (프리랜서)" rows={FREELANCER_ROWS} />
          </div>
          <p className="mt-5 text-[14px] font-semibold text-[#4b5565]">갑과 을은 아래와 같이 계약을 체결한다.</p>

          <ContractSection title="제1조 (목적)">
            갑이 을에게 모바일 앱 백엔드 API 개발 용역을 위탁하고, 을이 이를 성실히 수행함을 목적으로 한다.
          </ContractSection>
          <InfoSection title="제2조 (계약 대상 및 업무 범위)" rows={SCOPE_ROWS} />
          <InfoSection title="제3조 (계약 기간)" rows={[["계약 기간", "2026.09.01 ~ 2027.02.28"]]} />
          <InfoSection title="제4조 (계약 금액)" rows={AMOUNT_ROWS} />

          {ARTICLES.slice(0, 1).map((article) => <Article key={article.title} {...article} />)}
          <InfoRows rows={[["지급 계좌", "카카오뱅크 3333-01-2345678 (예금주 : 김민준)"]]} />

          <ArticleTitle title="제6조 (플랫폼 이용 수수료)" />
          <p className="mt-3 text-[14px] leading-7 text-theme-secondary">① 갑·을은 각각 플랫폼에 수수료를 지급한다.</p>
          <FeeTable />
          <p className="mt-3 text-[14px] text-theme-secondary">② 등급별 차등 적용: 다이아·마스터 등급은 각 1%씩 인하한다.</p>

          <InfoSection title="제7조 (근무 조건)" rows={[["근무 방식", "혼합"], ["근무 형태", "풀타임"]]} />
          {ARTICLES.slice(1, 4).map((article) => <Article key={article.title} {...article} />)}
          <ContractSection title="제11조 (계약 변경)">계약 변경은 양 당사자의 서면(전자) 합의로만 가능하다.</ContractSection>
          {ARTICLES.slice(4, 5).map((article) => <Article key={article.title} {...article} />)}
          <ContractSection title="제13조 (손해배상)">계약 위반으로 손해가 발생한 경우 귀책 당사자가 배상한다.</ContractSection>
          {ARTICLES.slice(5).map((article) => <Article key={article.title} {...article} />)}
          <ContractSection title="제15조 (특약사항)">별도의 특약사항 없음</ContractSection>

          <SectionTitle title="서명" className="mt-11" />
          <div className="mt-5 max-w-[380px] rounded-[12px] border border-theme px-7 py-6">
            <p className="text-center text-[14px] text-theme-muted">갑 (클라이언트)</p>
            <p className="mt-2 text-center text-[17px] font-bold">카카오 주식회사</p>
            <p className="mt-1 text-center text-[13px] text-theme-muted">대표자 정신아</p>
            <div className="mt-7 flex justify-center"><div className="flex h-[88px] w-[88px] items-center justify-center rounded-full border border-dashed border-[#d6dbe3] text-[13px] text-[#a8b0bd]">전자서명</div></div>
          </div>
        </article>

        <div className="mt-5 flex gap-3">
          <button type="button" className="h-[46px] w-[240px] cursor-pointer rounded-[11px] border border-theme bg-surface text-[14px] font-semibold text-theme-secondary transition hover:bg-surface-subtle">취소하기</button>
          <button type="button" onClick={completeContract} className="h-[46px] flex-1 cursor-pointer rounded-[11px] bg-[#163760] text-[14px] font-bold text-white transition hover:bg-[#122d4f]">전자 서명 및 계약 체결</button>
        </div>
      </div>

      {isCompleteModalOpen && (
        <ContractCompleteModal
          onBackToProject={() => router.push(role === "client" ? `/client/projects/${params.projectId}?tab=계약` : "/freelancer/contracts")}
          onDownload={() => window.print()}
          backLabel={role === "client" ? "프로젝트로 돌아가기" : "내 계약으로 돌아가기"}
        />
      )}
    </main>
  );
}

function SectionTitle({ title, className = "" }: { title: string; className?: string }) {
  return <div className={`${className} flex items-center gap-2 border-b-2 border-[#203a63] pb-2`}><span className="h-2.5 w-2.5 bg-[#142f54]" /><h3 className="text-[15px] font-bold">{title}</h3></div>;
}

function ArticleTitle({ title }: { title: string }) {
  return <h4 className="mt-9 border-b-2 border-[#203a63] pb-2 text-[15px] font-bold">{title}</h4>;
}

function PartyCard({ title, rows }: { title: string; rows: string[][] }) {
  return <div className="rounded-[12px] bg-surface-subtle px-5 py-4"><p className="mb-2 text-[13px] font-semibold text-theme-muted">{title}</p><InfoRows rows={rows} compact /></div>;
}

function InfoRows({ rows, compact = false }: { rows: string[][]; compact?: boolean }) {
  return <div>{rows.map(([label, value]) => <div key={label} className={`grid ${compact ? "grid-cols-[110px_1fr]" : "grid-cols-[150px_1fr]"} border-b border-[#e6ebf1] py-2.5 last:border-b-0`}><span className="text-[13px] text-theme-muted">{label}</span><span className="text-[14px] font-semibold leading-6 text-theme-secondary">{value}</span></div>)}</div>;
}

function ContractSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><ArticleTitle title={title} /><p className="mt-3 text-[14px] leading-7 text-theme-secondary">{children}</p></section>;
}

function InfoSection({ title, rows }: { title: string; rows: string[][] }) {
  return <section><ArticleTitle title={title} /><div className="mt-3"><InfoRows rows={rows} /></div></section>;
}

function Article({ title, lines }: { title: string; lines: string[] }) {
  return <section><ArticleTitle title={title} /><ol className="mt-3 space-y-1 text-[14px] leading-7 text-theme-secondary">{lines.map((line) => <li key={line}>{line}</li>)}</ol></section>;
}

function FeeTable() {
  const headers = ["구분", "1억 미만 — 갑", "1억 미만 — 을", "1억 이상 — 갑", "1억 이상 — 을"];
  const rows = [["착수금 수수료", "3%", "4%", "2%", "4%"], ["성공보수 수수료", "7%", "6%", "6%", "6%"]];
  return <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[680px] border-collapse text-center text-[13px]"><thead><tr className="bg-[#f5f7fb]">{headers.map((header) => <th key={header} className="border border-theme px-3 py-2.5 font-semibold text-[#384250]">{header}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row[0]}>{row.map((cell, columnIndex) => <td key={`${row[0]}-${columnIndex}`} className="border border-theme px-3 py-2.5 text-theme-secondary">{cell}</td>)}</tr>)}</tbody></table></div>;
}
