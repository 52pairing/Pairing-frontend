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
    <div className="min-h-screen bg-[#F7F8FA]">
      <AuthHeader />

      <main className="mx-auto max-w-[560px] px-5 py-12">
        <SignupStepper
          title={title}
          currentStep={currentStep}
          labels={labels}
        />

        <section className="mt-8 rounded-lg border border-gray-200 bg-white px-8 py-9 shadow-sm">
          {children}
        </section>
      </main>
    </div>
  );
}
