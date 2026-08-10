import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RoleGuard } from "@/features/auth/components/RoleGuard";
import { ToastProvider } from "@/features/common/components/Toast";
import { ConditionalFooter } from "@/features/common/components/ConditionalFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pairing",
  description: "AI 기반 프리랜서 매칭 플랫폼",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <RoleGuard>{children}</RoleGuard>
        </ToastProvider>
        <ConditionalFooter />
      </body>
    </html>
  );
}
