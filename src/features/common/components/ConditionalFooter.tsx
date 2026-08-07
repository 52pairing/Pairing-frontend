"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/features/common/components/Footer";

const FOOTER_HIDDEN_PATHS = [
  "/client/projects/new/complete",
  "/client/payments/complete",
];

export function ConditionalFooter() {
  const pathname = usePathname();

  if (FOOTER_HIDDEN_PATHS.includes(pathname)) {
    return null;
  }

  return <Footer />;
}
