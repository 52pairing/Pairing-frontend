import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // ANALYZE=true npm run build 실측 결과, 특정 무거운 의존성 없이 번들이 이미 건강함.
  //  - @stomp/stompjs(gzip 6.6KB)는 /chat 라우트에만 국한, 공유 번들 미포함
  //  - lucide-react는 Next 기본 optimizePackageImports로 이미 per-icon 트리셰이킹
  // 따라서 코드 분할용 config는 불필요하고, 아래 프로덕션 하이진 설정만 명시한다.

  // 응답에서 프레임워크 노출 헤더 제거(보안 하이진).
  poweredByHeader: false,

  // 클라이언트 소스맵을 프로덕션 번들에 포함하지 않는다(기본값이나 의도를 명시).
  productionBrowserSourceMaps: false,

  // 매칭 후보 프로필 이미지 등 실제 CDN 호스트 확정 완료.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.52pairing.kro.kr",
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
