import { NegotiationRoom } from "@/features/negotiation/components/NegotiationRoom";

export default function ProjectNegotiationRoomPage() {
  // negotiationId 는 동적 라우트 파라미터로 전달된다 (NegotiationRoom 에서 useParams 로 읽음).
  return <NegotiationRoom />;
}
