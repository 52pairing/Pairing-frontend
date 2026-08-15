import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { RoleGuard } from "@/features/auth/components/RoleGuard";
import { AuthSessionGuard } from "@/features/auth/components/AuthSessionGuard";
import { ToastProvider } from "@/features/common/components/Toast";
import { ConditionalFooter } from "@/features/common/components/ConditionalFooter";
import { ThemeProvider } from "@/features/common/theme/ThemeProvider";

const themeInitScript = `
  (() => {
    try {
      const saved = localStorage.getItem("pairing-theme");
      const preference = saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
      const theme = preference === "system"
        ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : preference;
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch {
      document.documentElement.dataset.theme = "light";
    }
  })();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:17000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Pairing",
    template: "%s | Pairing",
  },
  description: "AI 기반 프리랜서 매칭 플랫폼",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script
          id="pairing-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <ThemeProvider>
          <ToastProvider>
            <AuthSessionGuard />
            <RoleGuard>{children}</RoleGuard>
          </ToastProvider>
          <ConditionalFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
