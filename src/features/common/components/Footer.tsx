import Image from "next/image";
import Link from "next/link";

// Footer
export function Footer() {
  return (
    <footer className="bg-[#071c33]">
      <div className="mx-auto flex min-h-[60px] max-w-[1440px] px-8 pt-3 md:flex-row md:items-center md:justify-between">
        <Link href="/" aria-label="Pairing 홈" className="flex items-center">
          <Image
            src="/images/Pairing_Logo_White.png"
            alt="Pairing"
            width={90}
            height={24}
            className="h-auto w-auto"
          />
        </Link>

        <nav className="flex flex-col gap-2 text-sm font-semibold text-slate-300 md:flex-row md:items-center md:gap-10">
          <Link href="/terms/freelancer" className="hover:text-white">
            프리랜서 이용약관
          </Link>
          <Link href="/terms/client" className="hover:text-white">
            클라이언트 이용약관
          </Link>
          <Link href="/privacy" className="hover:text-white">
            개인정보 처리방침
          </Link>
        </nav>

        <p className="text-sm font-semibold text-slate-300">
          © 2026 페어링 주식회사
        </p>
      </div>
    </footer>
  );
}