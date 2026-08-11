import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { SignupComplete } from "@/features/auth/components/SignupComplete";

interface SignupCompleteScreenProps {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref?: string;
}

export function SignupCompleteScreen({
  title,
  description,
  primaryLabel,
  primaryHref = "/login",
}: SignupCompleteScreenProps) {
  return (
    <div className="min-h-screen bg-surface">
      <AuthHeader />
      <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-5 py-16">
        <section className="w-full max-w-[440px] rounded-lg border border-theme bg-surface px-8 py-9 shadow-sm">
          <SignupComplete
            title={title}
            description={description}
            primaryHref={primaryHref}
            primaryLabel={primaryLabel}
            secondaryHref="/"
            secondaryLabel="홈으로 이동"
          />
        </section>
      </main>
    </div>
  );
}
