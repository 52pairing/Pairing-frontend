// 이메일 인증 링크 클릭 후 도착 화면

import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { TempPasswordIssued } from "@/features/auth/components/TempPasswordIssued";

export default function FindPasswordVerifyPage() {
  // TODO: 이메일 인증 링크의 토큰을 검증하고 실제 발급된 임시 비밀번호를 받아와야 합니다.
  const tempPassword = "Tmp#1234!";

  return (
    <div className="min-h-screen">
      <AuthHeader />

      <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-5 py-16">
        <section className="w-full max-w-[440px] rounded-lg border border-gray-200 bg-white px-8 py-9 shadow-sm">
          <TempPasswordIssued tempPassword={tempPassword} />
        </section>
      </main>
    </div>
  );
}
