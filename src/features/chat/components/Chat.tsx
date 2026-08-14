"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { getChatMessages, getChatRoom, getChatRooms, markChatRoomRead, sendChatMessage } from "@/features/chat/services/chatRooms";
import type { ChatMessage, ChatMessageBroadcast, ChatRoomDetail, ChatRoomListItem } from "@/features/chat/types/chat";
import { useChatMessages } from "@/features/chat/stomp/useChatMessages";
import { getCurrentUser } from "@/features/auth/services/currentUser";
import { getProjectJobRoles } from "@/features/client/projects/services/projectPreReview";
import { getContractByNegotiation } from "@/features/contract/services/contracts";
import type { ContractDetailResponse } from "@/features/contract/types/contractDetail";
import { getNegotiation } from "@/features/negotiation/services/negotiation";
import type { NegotiationDetail } from "@/features/negotiation/types/negotiation";
import { ApiException } from "@/lib/api";

const MAX_MESSAGE_LENGTH = 500;

export function Chat() {
  const searchParams = useSearchParams();
  const requestedRoomId = Number(searchParams.get("chatRoomId"));
  const [rooms, setRooms] = useState<ChatRoomListItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [room, setRoom] = useState<ChatRoomDetail | null>(null);
  const [contract, setContract] = useState<ContractDetailResponse | null>(null);
  const [negotiation, setNegotiation] = useState<NegotiationDetail | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [jobRoleLabels, setJobRoleLabels] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);

  const addMessage = useCallback((incoming: ChatMessage) => {
    setMessages((current) => current.some((item) => item.messageId === incoming.messageId) ? current : [...current, incoming]);
  }, []);

  const loadRooms = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [resultData, user, jobRoles] = await Promise.all([getChatRooms(), getCurrentUser(), getProjectJobRoles().catch(() => [])]);
      setAccountId(user.accountId);
      setJobRoleLabels(Object.fromEntries(jobRoles.map((item) => [item.code, item.label])));
      const result = [...resultData].sort((a, b) => (Date.parse(b.lastMessageAt ?? "") || 0) - (Date.parse(a.lastMessageAt ?? "") || 0));
      setRooms(result);
      setSelectedId((current) => {
        if (Number.isFinite(requestedRoomId) && result.some((item) => item.chatRoomId === requestedRoomId)) return requestedRoomId;
        if (current && result.some((item) => item.chatRoomId === current)) return current;
        return result[0]?.chatRoomId ?? null;
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "대화 목록을 불러오지 못했습니다."));
    } finally {
      setIsLoading(false);
    }
  }, [requestedRoomId]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => { if (!cancelled) void loadRooms(); });
    return () => { cancelled = true; };
  }, [loadRooms]);

  useEffect(() => {
    if (selectedId == null) return;
    let cancelled = false;
    Promise.all([getChatRoom(selectedId), getChatMessages(selectedId), markChatRoomRead(selectedId)])
      .then(async ([detail, page]) => {
        if (cancelled) return;
        setRoom(detail);
        setMessages([...page.content].reverse());
        setContract(null);
        setNegotiation(null);
        setRooms((current) => current.map((item) => item.chatRoomId === selectedId ? { ...item, unreadCount: 0 } : item));
        const [contractResult, negotiationResult] = await Promise.allSettled([
          getContractByNegotiation(detail.negotiationId).catch((error: unknown) => {
            if (error instanceof ApiException && error.errorCode === "CT_001") return null;
            throw error;
          }),
          getNegotiation(detail.negotiationId),
        ]);
        if (!cancelled) {
          setContract(contractResult.status === "fulfilled" ? contractResult.value : null);
          setNegotiation(negotiationResult.status === "fulfilled" ? negotiationResult.value : null);
        }
      })
      .catch((error) => { if (!cancelled) setErrorMessage(getErrorMessage(error, "대화를 불러오지 못했습니다.")); });
    return () => { cancelled = true; };
  }, [selectedId]);

  const handleBroadcast = useCallback((incoming: ChatMessageBroadcast) => {
    addMessage({ ...incoming, mine: incoming.senderId != null && incoming.senderId === accountId });
    if (selectedId != null) void markChatRoomRead(selectedId);
    setRooms((current) => current.map((item) => item.chatRoomId === incoming.chatRoomId ? { ...item, lastMessage: incoming.content, lastMessageAt: incoming.createdAt, unreadCount: 0 } : item));
  }, [accountId, addMessage, selectedId]);

  useChatMessages(selectedId, handleBroadcast);

  useEffect(() => { messageEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || selectedId == null || isSending || !room?.inputEnabled) return;
    setIsSending(true);
    setErrorMessage("");
    try {
      const sent = await sendChatMessage(selectedId, content);
      addMessage(sent);
      setDraft("");
      setRooms((current) => current.map((item) => item.chatRoomId === selectedId ? { ...item, lastMessage: sent.content, lastMessageAt: sent.createdAt } : item));
    } catch (error) { setErrorMessage(getErrorMessage(error, "메시지를 보내지 못했습니다.")); }
    finally { setIsSending(false); }
  };

  return (
    <div className="h-[calc(100vh-60px)] overflow-hidden bg-background p-4 text-theme-primary sm:px-6">
      <section className="mx-auto flex h-full max-w-[1200px] overflow-hidden rounded-xl border border-theme bg-surface shadow-sm">
        <ConversationList rooms={rooms} selectedId={selectedId} isLoading={isLoading} onSelect={setSelectedId} onRetry={() => void loadRooms()} />
        <div className="flex min-w-0 flex-1 flex-col">
          {errorMessage ? <p role="alert" className="border-b border-theme bg-danger-surface px-5 py-2 text-xs text-theme-danger">{errorMessage}</p> : null}
          {!room ? <EmptyRoom isLoading={isLoading} /> : <ChatRoom room={room} contract={contract} negotiation={negotiation} jobRoleLabels={jobRoleLabels} messages={messages} draft={draft} isSending={isSending} onDraftChange={setDraft} onSubmit={handleSubmit} messageEndRef={messageEndRef} />}
        </div>
      </section>
    </div>
  );
}

function ConversationList({ rooms, selectedId, isLoading, onSelect, onRetry }: { rooms: ChatRoomListItem[]; selectedId: number | null; isLoading: boolean; onSelect: (id: number) => void; onRetry: () => void }) {
  return <aside className="w-[300px] shrink-0 border-r border-theme max-md:w-[110px]">
    <div className="h-[72px] border-b border-theme px-5 py-4"><h1 className="text-sm font-bold">메시지</h1><p className="mt-1 text-[11px] text-theme-muted max-md:hidden">{rooms.length}개의 대화</p></div>
    {isLoading ? <p className="p-5 text-xs text-theme-muted">불러오는 중...</p> : rooms.length === 0 ? <div className="p-5 text-xs text-theme-muted"><p>대화가 없습니다.</p><button type="button" onClick={onRetry} className="mt-3 font-bold text-brand">다시 시도</button></div> : rooms.map((item) => <button key={item.chatRoomId} type="button" onClick={() => onSelect(item.chatRoomId)} className={`flex w-full gap-3 border-b border-theme px-4 py-4 text-left hover:bg-surface-subtle ${item.chatRoomId === selectedId ? "bg-[#edf4fa]" : ""}`}>
      <Avatar name={item.counterpartName} imageUrl={item.counterpartImageUrl} />
      <span className="min-w-0 flex-1 max-md:hidden"><span className="flex justify-between gap-2"><strong className="truncate text-xs">{item.counterpartName ?? "알 수 없는 사용자"}</strong><time className="shrink-0 text-[10px] text-theme-muted">{formatRelativeTime(item.lastMessageAt)}</time></span><span className="mt-1 flex items-center gap-2"><span className="min-w-0 flex-1 truncate text-[11px] text-theme-secondary">{item.lastMessage ?? "새 대화가 시작되었습니다."}</span>{item.unreadCount > 0 ? <span className="rounded-full bg-red-500 px-1.5 text-[9px] font-bold text-white">{item.unreadCount}</span> : null}</span><span className="mt-2 block truncate text-[10px] text-theme-muted">{item.projectTitle ?? "프로젝트 정보 없음"}</span></span>
    </button>)}
  </aside>;
}

function ChatRoom({ room, contract, negotiation, jobRoleLabels, messages, draft, isSending, onDraftChange, onSubmit, messageEndRef }: { room: ChatRoomDetail; contract: ContractDetailResponse | null; negotiation: NegotiationDetail | null; jobRoleLabels: Record<string, string>; messages: ChatMessage[]; draft: string; isSending: boolean; onDraftChange: (value: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; messageEndRef: React.RefObject<HTMLDivElement | null> }) {
  const jobRoleLabel = contract?.jobRole ? jobRoleLabels[contract.jobRole] ?? contract.jobRole : null;
  return <><header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-theme px-5"><Avatar name={room.counterpartName} imageUrl={room.counterpartImageUrl} /><div className="min-w-0"><h2 className="truncate text-[13px] font-bold">{room.counterpartName ?? "알 수 없는 사용자"}</h2><p className="mt-1 truncate text-[10px] text-theme-muted">{jobRoleLabel ? `${jobRoleLabel} · ` : ""}{room.projectTitle ?? "프로젝트 정보 없음"}</p></div></header>
    {contract ? <NegotiationSummary contract={contract} negotiation={negotiation} /> : null}
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8">{messages.length === 0 ? <p className="py-16 text-center text-xs text-theme-muted">아직 메시지가 없습니다.</p> : <div className="space-y-4">{messages.map((message, index) => <div key={message.messageId}>{shouldShowDate(messages, index) ? <DateDivider date={message.createdAt} /> : null}<MessageBubble message={message} /></div>)}</div>}<div ref={messageEndRef} /></div>
    <form onSubmit={onSubmit} className="border-t border-theme p-4"><div className="flex gap-2"><label htmlFor="chat-message" className="sr-only">메시지</label><input id="chat-message" value={draft} maxLength={MAX_MESSAGE_LENGTH} disabled={!room.inputEnabled || isSending} onChange={(event) => onDraftChange(event.target.value)} placeholder={room.inputEnabled ? "메시지를 입력하세요 (최대 500자)" : "현재 메시지를 보낼 수 없습니다."} className="h-11 min-w-0 flex-1 rounded-lg border border-theme bg-surface px-4 text-xs outline-none focus:border-brand disabled:bg-surface-muted"/><button type="submit" disabled={!draft.trim() || !room.inputEnabled || isSending} aria-label="메시지 보내기" className="h-11 w-11 rounded-lg bg-brand text-white disabled:opacity-40">➤</button></div><p className="mt-1 text-right text-[10px] text-theme-muted">{draft.length}/{MAX_MESSAGE_LENGTH}</p></form></>;
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.messageType === "SYSTEM") return <div className="flex items-center gap-3 py-2 text-center text-[10px] text-theme-muted"><span className="h-px flex-1 bg-border"/><span>{message.content}</span><span className="h-px flex-1 bg-border"/></div>;
  return <div className={`flex items-start gap-3 ${message.mine ? "justify-end" : ""}`}>{!message.mine ? <Avatar name={message.senderName ?? "상대방"} imageUrl={message.senderImageUrl} small /> : null}<div className={`max-w-[75%] ${message.mine ? "text-right" : ""}`}>{!message.mine ? <p className="mb-1 text-[10px] text-theme-muted">{message.senderName}</p> : null}<p className={`inline-block whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-left text-xs ${message.mine ? "rounded-br-md bg-brand font-semibold text-white" : "rounded-bl-md bg-surface-subtle"}`}>{message.content}</p><time className="mt-1 block text-[10px] text-theme-muted">{formatTime(message.createdAt)}</time></div></div>;
}

function NegotiationSummary({ contract, negotiation }: { contract: ContractDetailResponse; negotiation: NegotiationDetail | null }) {
  const items = [
    ["단가(월)", `월 ${contract.payAmount.toLocaleString("ko-KR")}원`],
    ["계약 기간", formatContractPeriod(contract.startDate, contract.endDate)],
    ["시작일", formatDate(contract.startDate)],
    ["근무 방식", WORK_STYLE_LABEL[contract.workStyle] ?? contract.workStyle],
    ["근무 형태", WORK_FORM_LABEL[contract.workForm] ?? contract.workForm],
  ];
  return <section className="mx-4 mt-4 shrink-0 rounded-xl border border-theme bg-surface-subtle px-5 py-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-xs font-bold text-brand">최종 합의안</h3><div className="flex items-center gap-2 text-[10px] text-theme-muted">{negotiation?.aiOutAt ? <span>AI 협상 종료 {formatTime(negotiation.aiOutAt)}</span> : null}<span className="rounded-full bg-success-surface px-2 py-1 font-bold text-theme-success">타결</span></div></div><dl className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">{items.map(([label, value]) => <div key={label}><dt className="text-[10px] text-theme-muted">{label}</dt><dd className="mt-1 text-xs font-bold">{value}</dd></div>)}</dl>{contract.specialTerms ? <div className="mt-3"><p className="text-[10px] font-bold text-brand">특약사항</p><p className="mt-1 whitespace-pre-line text-[11px] leading-5 text-theme-secondary">{contract.specialTerms}</p></div> : null}</section>;
}

const WORK_STYLE_LABEL: Record<string, string> = { REMOTE: "재택", ONSITE: "상주", ANY: "혼합" };
const WORK_FORM_LABEL: Record<string, string> = { FULL_TIME: "풀타임", PART_TIME: "파트타임", ANY: "모두 가능" };
function Avatar({ name, imageUrl, small = false }: { name: string | null; imageUrl: string | null; small?: boolean }) { const size = small ? 32 : 40; return <span className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand font-bold text-white" style={{ width: size, height: size }}>{imageUrl ? <AvatarImage key={imageUrl} src={imageUrl} size={size} fallback={name?.slice(0, 1) ?? "?"} /> : name?.slice(0, 1) ?? "?"}</span>; }
function AvatarImage({ src, size, fallback }: { src: string; size: number; fallback: string }) { const [broken, setBroken] = useState(false); return broken ? fallback : <Image src={src} alt="" fill sizes={`${size}px`} className="object-cover" unoptimized onError={() => setBroken(true)} />; }
function EmptyRoom({ isLoading }: { isLoading: boolean }) { return <div className="flex flex-1 items-center justify-center text-sm text-theme-muted">{isLoading ? "채팅을 불러오고 있습니다." : "대화를 선택해 주세요."}</div>; }
function DateDivider({ date }: { date: string }) { return <div className="my-5 text-center text-[10px] text-theme-muted">{new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(date))}</div>; }
function shouldShowDate(messages: ChatMessage[], index: number) { if (index === 0) return true; return new Date(messages[index - 1].createdAt).toDateString() !== new Date(messages[index].createdAt).toDateString(); }
function formatTime(value: string) { return new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value)); }
function formatDate(value: string) { return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(`${value}T00:00:00`)); }
function formatContractPeriod(startDate: string, endDate: string) { const start = new Date(`${startDate}T00:00:00`); const end = new Date(`${endDate}T00:00:00`); const months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1; return `${Math.max(1, months)}개월`; }
function formatRelativeTime(value: string | null) { if (!value) return ""; const diff = Date.now() - new Date(value).getTime(); if (diff < 60_000) return "방금"; if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`; if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}시간 전`; return new Intl.DateTimeFormat("ko-KR", { month: "numeric", day: "numeric" }).format(new Date(value)); }
function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiException) {
    const messageByCode: Partial<Record<string, string>> = {
      CH_001: "아직 채팅방이 열리지 않았습니다.",
      CH_002: "이 채팅방에 접근할 수 없습니다.",
      CH_003: "현재 메시지를 보낼 수 없습니다.",
      CH_004: "현재 채팅방에서 나갈 수 없습니다.",
      CH_005: "이미 나간 채팅방입니다.",
    };
    return messageByCode[error.errorCode] ?? error.message ?? fallback;
  }
  return error instanceof Error && error.message ? error.message : fallback;
}
