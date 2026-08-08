// 클라이언트 회원가입 완료
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { SignupComplete } from "@/features/auth/components/SignupComplete";

export default function ClientSignupCompletePage() {
  return (
    <div className="min-h-screen">
      <AuthHeader />

      <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-5 py-16">
        <section className="w-full max-w-[440px] rounded-lg border border-gray-200 bg-white px-8 py-9 shadow-sm">
          <SignupComplete
            title="클라이언트 회원가입이 완료되었습니다."
            description="이제 프로젝트를 등록하고 적합한 개발자를 찾아보세요."
            primaryHref="/login"
            primaryLabel="로그인으로 이동"
            secondaryHref="/"
            secondaryLabel="홈으로 이동"
          />
        </section>
      </main>
    </div>
  );
}
