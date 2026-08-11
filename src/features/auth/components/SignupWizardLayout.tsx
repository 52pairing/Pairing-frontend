import type { ReactNode } from "react";

import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { SignupStepper } from "@/features/auth/components/SignupStepper";

interface SignupWizardLayoutProps {
  title: string;
  currentStep: number;
  labels: readonly string[];
  children: ReactNode;
}

export function SignupWizardLayout({
  title,
  currentStep,
  labels,
  children,
}: SignupWizardLayoutProps) {
  return (
    <div className="min-h-screen bg-surface-subtle">
      <AuthHeader />

      <main className="mx-auto max-w-[560px] px-5 py-12">
        <SignupStepper
          title={title}
          currentStep={currentStep}
          labels={labels}
        />

        <section className="mt-8 rounded-lg border border-theme bg-surface px-8 py-9 shadow-sm">
          {children}
        </section>
      </main>
    </div>
  );
}
