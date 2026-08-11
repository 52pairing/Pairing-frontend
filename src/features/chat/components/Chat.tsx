"use client";

import { FormEvent, useState } from "react";

interface Conversation {
  id: number;
  company: string;
  initials: string;
  role: string;
  preview: string;
  time: string;
  unread?: number;
}

interface ChatMessage {
  id: number;
  text: string;
  time: string;
  sender: "company" | "me";
}

const conversations: Conversation[] = [
  {
    id: 1,
    company: "카카오 담당자",
    initials: "카",
    role: "모바일 앱 백엔드 API 개발",
    preview: "AI 제안 수락하겠습니다.",
    time: "11:30",
    unread: 1,
  },
  {
    id: 2,
    company: "삼성전자 담당자",
    initials: "삼",
    role: "쇼핑몰 관리자 페이지 리뉴얼",
    preview: "이번 주 작업 내용 공유드릴게요.",
    time: "어제",
  },
];

const initialMessages: Record<number, ChatMessage[]> = {
  1: [
    { id: 1, text: "안녕하세요! 월 500만원 조건으로 참여 가능하신가요?", time: "09:05", sender: "company" },
    { id: 2, text: "검토해 보겠습니다. 기간도 협의 가능한가요?", time: "09:10", sender: "me" },
  ],
  2: [
    { id: 3, text: "안녕하세요. 프로젝트 진행 상황을 확인하고 싶습니다.", time: "어제", sender: "company" },
    { id: 4, text: "이번 주 작업 내용을 정리해서 공유드리겠습니다.", time: "어제", sender: "me" },
  ],
};

export function Chat() {
  const [selectedId, setSelectedId] = useState(1);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const selectedConversation = conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();

    if (!text) return;

    setMessages((current) => ({
      ...current,
      [selectedId]: [
        ...(current[selectedId] ?? []),
        { id: Date.now(), text, time: "방금", sender: "me" },
      ],
    }));
    setDraft("");
  };

  return (
    <div className="h-[calc(100vh-60px)] overflow-hidden bg-background px-4 py-4 text-theme-primary sm:px-6 lg:px-8">
      <div className="mx-auto flex h-full max-w-[1120px] flex-col">
        <NegotiationSummary />

        <section className="mt-3 flex min-h-0 flex-1 overflow-hidden rounded-xl border border-theme bg-surface shadow-sm">
          <ConversationList selectedId={selectedId} onSelect={setSelectedId} />
          <ChatRoom conversation={selectedConversation} messages={messages[selectedId] ?? []} draft={draft} onDraftChange={setDraft} onSubmit={handleSubmit} />
        </section>
      </div>
    </div>
  );
}

function NegotiationSummary() {
  return (
    <section className="rounded-xl border border-theme bg-surface px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef4ff] text-sm text-[#377cf6]" aria-hidden="true">☼</span>
          <strong className="text-[13px]">AI 협상 완료 — 최종 합의안</strong>
          <span className="rounded-full bg-[#e9fbef] px-2.5 py-1 text-[10px] font-semibold text-[#16a34a]">합의 완료</span>
        </div>
        <div className="flex items-center gap-5">
          <span className="text-[11px] text-theme-muted">09:08 · 오늘</span>
          <button type="button" className="h-8 rounded-lg bg-[#102a4c] px-4 text-[11px] font-semibold text-white hover:bg-[#183b67]">협상 상세보기</button>
        </div>
      </div>

      <dl className="mt-3 grid overflow-hidden rounded-lg bg-[#f6f8fb] sm:grid-cols-2 lg:grid-cols-4">
        <SummaryItem label="금액" value="월 4,800,000원" />
        <SummaryItem label="기간" value="4개월" />
        <SummaryItem label="근무 형태" value="재택" />
        <SummaryItem label="근무 유형" value="풀타임" last />
      </dl>
      <p className="mt-2.5 text-[10px] text-theme-secondary"><strong className="mr-3 text-[#377cf6]">추가 조건</strong>· 완료 후 1개월 연장 옵션</p>
    </section>
  );
}

function SummaryItem({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`px-4 py-3 ${last ? "" : "border-b border-theme sm:border-r lg:border-b-0"}`}>
      <dt className="text-[10px] text-theme-muted">{label}</dt>
      <dd className="mt-1.5 text-[13px] font-bold text-[#102a4c]">{value}</dd>
    </div>
  );
}

function ConversationList({ selectedId, onSelect }: { selectedId: number; onSelect: (id: number) => void }) {
  return (
    <aside className="hidden w-[285px] shrink-0 border-r border-theme md:block">
      <div className="h-[72px] border-b border-theme px-5 py-4">
        <h1 className="text-sm font-bold">메시지</h1>
        <p className="mt-1 text-[11px] text-theme-muted">{conversations.length}개의 대화</p>
      </div>
      {conversations.map((conversation) => {
        const isSelected = conversation.id === selectedId;
        return (
          <button key={conversation.id} type="button" onClick={() => onSelect(conversation.id)} className={`flex w-full gap-2.5 border-b border-[#e7eaf0] px-4 py-3.5 text-left hover:bg-[#f5f8fc] ${isSelected ? "bg-[#edf4fa]" : "bg-surface"}`}>
            <Avatar initials={conversation.initials} active={isSelected} />
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <strong className="truncate text-xs">{conversation.company}</strong>
                <span className="shrink-0 text-[10px] text-[#8d98a8]">{conversation.time}</span>
              </span>
              <span className="mt-1 flex items-center justify-between gap-2">
                <span className="truncate text-[11px] text-[#7b8798]">{conversation.preview}</span>
                {conversation.unread ? <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef2b2d] px-1 text-[9px] font-bold text-white">{conversation.unread}</span> : null}
              </span>
              <span className="mt-2 inline-block rounded bg-surface-subtle px-2 py-1 text-[9px] text-[#9aa3b1]">{conversation.role}</span>
            </span>
          </button>
        );
      })}
    </aside>
  );
}

function ChatRoom({ conversation, messages, draft, onDraftChange, onSubmit }: { conversation: Conversation; messages: ChatMessage[]; draft: string; onDraftChange: (value: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-theme px-5 sm:px-6">
        <Avatar initials={conversation.initials} active />
        <div>
          <h2 className="text-[13px] font-bold">{conversation.company}</h2>
          <p className="mt-1 text-[10px] text-theme-muted">{conversation.role}</p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3 text-[10px] text-[#a2aab6]"><span className="h-px flex-1 bg-[#e4e8ee]" />협상이 시작되었습니다.<span className="h-px flex-1 bg-[#e4e8ee]" /></div>
        <div className="mt-5 space-y-4">
          {messages.map((message) => <MessageBubble key={message.id} message={message} initials={conversation.initials} />)}
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex shrink-0 gap-2.5 border-t border-[#e4e8ee] px-4 py-3">
        <label htmlFor="chat-message" className="sr-only">메시지</label>
        <input id="chat-message" value={draft} onChange={(event) => onDraftChange(event.target.value)} placeholder="메시지를 입력하세요..." className="h-10 min-w-0 flex-1 rounded-lg border border-[#dce1e8] px-3.5 text-xs outline-none placeholder:text-[#9aa3b1] focus:border-[#416f9f]" />
        <button type="submit" aria-label="메시지 보내기" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#102a4c] text-white hover:bg-[#183b67]">
          <SendIcon />
        </button>
      </form>
    </div>
  );
}

function MessageBubble({ message, initials }: { message: ChatMessage; initials: string }) {
  const isMine = message.sender === "me";
  return (
    <div className={`flex items-start gap-3 ${isMine ? "justify-end" : "justify-start"}`}>
      {!isMine ? <Avatar initials={initials} /> : null}
      <div className={`max-w-[80%] ${isMine ? "text-right" : ""}`}>
        <p className={`inline-block rounded-2xl px-3.5 py-2.5 text-left text-xs font-semibold ${isMine ? "rounded-br-md bg-[#102a4c] text-white" : "rounded-bl-md bg-[#f4f5f7] text-theme-primary"}`}>{message.text}</p>
        <p className="mt-1 text-[10px] text-theme-muted">{message.time}</p>
      </div>
    </div>
  );
}

function Avatar({ initials, active = false }: { initials: string; active?: boolean }) {
  return <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${active ? "bg-[#102a4c] text-white" : "bg-[#e9edf3] text-[#7f8a9c]"}`}>{initials}</span>;
}

function SendIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}
