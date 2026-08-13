import { Suspense } from "react";

import { Chat } from "@/features/chat/components/Chat";

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-60px)] items-center justify-center text-sm text-theme-muted">채팅을 불러오고 있습니다.</div>}>
      <Chat />
    </Suspense>
  );
}
