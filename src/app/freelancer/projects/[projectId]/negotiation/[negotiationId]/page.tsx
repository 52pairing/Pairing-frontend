import { NegotiationRoom } from "@/features/negotiation/components/NegotiationRoom";

export default function FreelancerNegotiationRoomPage() {
  // 협상방은 공용 컴포넌트. viewerRole(FREELANCER)은 서버 응답으로 결정되고,
  // 뒤로가기 경로는 현재 URL(/freelancer)로 판별한다.
  return <NegotiationRoom />;
}
