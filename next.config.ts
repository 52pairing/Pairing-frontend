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

  // NOTE(이미지 최적화, 보류): 채팅 아바타(next/image)가 unoptimized 상태다.
  // 실제 이미지 호스트(S3/CDN 도메인) 확정 후 아래처럼 등록하고 unoptimized 제거 예정.
  // images: { remotePatterns: [{ protocol: "https", hostname: "<확정 필요>" }] },
};

export default withBundleAnalyzer(nextConfig);