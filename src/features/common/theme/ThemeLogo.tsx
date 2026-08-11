import Image from "next/image";

interface ThemeLogoProps {
  width?: number;
  height?: number;
  priority?: boolean;
}

export function ThemeLogo({
  width = 110,
  height = 32,
  priority = false,
}: ThemeLogoProps) {
  return (
    <span className="relative block h-8" style={{ width }}>
      <Image
        src="/images/Pairing_Logo.png"
        alt="Pairing"
        width={width}
        height={height}
        priority={priority}
        className="theme-logo-light h-8 w-auto object-contain"
      />
      <Image
        src="/images/Pairing_Logo_White.png"
        alt=""
        width={width}
        height={height}
        priority={priority}
        aria-hidden="true"
        className="theme-logo-dark h-8 w-auto object-contain"
      />
    </span>
  );
}
