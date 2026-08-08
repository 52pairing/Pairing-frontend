// 프리랜서 일반 회원가입 완료
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { SignupComplete } from "@/features/auth/components/SignupComplete";

export default function FreelancerSignupCompletePage() {
  return (
    <div className="min-h-screen">
      <AuthHeader />

      <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-5 py-16">
        <section className="w-full max-w-[440px] rounded-lg border border-gray-200 bg-white px-8 py-9 shadow-sm">
          <SignupComplete
            title="프리랜서 회원가입이 완료되었습니다."
            description="프로필을 등록하면 적합한 프로젝트를 추천받을 수 있습니다."
            primaryHref="/login"
            primaryLabel="로그인하러 가기"
            secondaryHref="/"
            secondaryLabel="홈으로 가기"
          />
        </section>
      </main>
    </div>
  );
}
