import Link from "next/link";

import type {
  NegotiationListItem,
  NegotiationStatus,
} from "@/features/negotiation/types/negotiation";
import { DEFAULT_MAX_ROUND } from "@/features/negotiation/types/negotiation";
import { proposalByLabel } from "@/features/negotiation/utils/conditionFormat";

export interface CandidateCardProps {
  item: NegotiationListItem;
  /** 협상방 링크 생성을 위한 프로젝트 ID */
  projectId: string;
}

// 아바타 배경색 팔레트 (negotiationId 기준 고정 배정)
const AVATAR_COLORS = [
  "bg-[#3777f6]",
  "bg-[#7839ee]",
  "bg-[#16a34a]",
  "bg-[#f79009]",
  "bg-[#e0409a]",
];

export function CandidateCard({ item, projectId }: CandidateCardProps) {
  const negotiationHref = `/client/projects/${projectId}/negotiation/${item.negotiationId}`;
  const name = item.counterpartName ?? "상대방";
  const initial = name.trim().charAt(0) || "?";
  const avatarClass = AVATAR_COLORS[item.negotiationId % AVATAR_COLORS.length];
  // 마지노선 입력 전(라운드 0)이면 "협상 시작", 진행 중이면 "협상방 입장"
  const enterLabel = item.totalRound === 0 ? "협상 시작" : "협상방 입장";

  return (
    <article className="flex min-h-[84px] items-center justify-between rounded-[14px] border border-[#dfe3e8] bg-white px-6 shadow-[0_1px_2px_rgba(16,24,40,0.02)]">
      {/* 왼쪽 프로필 */}
      <div className="flex items-center">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white ${avatarClass}`}>
          {initial}
        </div>

        <div className="ml-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[15px] font-bold text-[#111827]">{name}</h2>
            <StatusBadge status={item.status} waitingForMe={item.waitingForMe} />
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-semibold text-[#98a2b3]">
            <span>
              라운드 {item.totalRound}/{DEFAULT_MAX_ROUND}
            </span>
            {item.lastProposalAt ? (
              <span>
                마지막 제안: {proposalByLabel(item.lastProposalBy)} ·{" "}
                {formatRelativeTime(item.lastProposalAt)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* 오른쪽 액션 */}
      <div className="flex items-center gap-3">
        <Link
          href={negotiationHref}
          className="flex h-[36px] items-center rounded-[8px] bg-[#142f50] px-4 text-[12px] font-bold text-white transition hover:bg-[#102641]"
        >
          {enterLabel}
        </Link>
      </div>
    </article>
  );
}

// 상대 시각으로부터 경과 시간을 "방금 전/N분 전/N시간 전/N일 전"으로 표시
function formatRelativeTime(iso: string): string {
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return "";
  const diffMinutes = Math.floor((Date.now() - timestamp) / 60000);
  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  return `${Math.floor(diffHours / 24)}일 전`;
}

function StatusBadge({
  status,
  waitingForMe,
}: {
  status: NegotiationStatus;
  waitingForMe: boolean;
}) {
  // 내 응답이 필요한 경우를 최우선으로 강조
  if (waitingForMe && status === "IN_PROGRESS") {
    return (
      <span className="rounded-full border border-[#fdb022] bg-[#fffaeb] px-2.5 py-1 text-[11px] font-semibold text-[#b54708]">
        내 응답 필요
      </span>
    );
  }

  const { label, className } = STATUS_STYLE[status];
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${className}`}>
      {label}
    </span>
  );
}

const STATUS_STYLE: Record<NegotiationStatus, { label: string; className: string }> = {
  IN_PROGRESS: { label: "협상중", className: "border-[#b2ccff] bg-[#eff4ff] text-[#2970ff]" },
  AGREED: { label: "합의", className: "border-[#abefc6] bg-[#ecfdf3] text-[#039855]" },
  FAILED: { label: "결렬", className: "border-[#fecdca] bg-[#fef3f2] text-[#f04438]" },
};
