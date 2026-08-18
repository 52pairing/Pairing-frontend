import { ClientMain } from "@/features/client/components/ClientMain";
import { getServerCurrentUser } from "@/features/auth/services/serverCurrentUser";
import { getServerClientMyGrade } from "@/features/client/mypage/services/serverClientGrade";

export default async function ClientHomePage() {
  const [initialUser, initialGrade] = await Promise.all([
    getServerCurrentUser(),
    getServerClientMyGrade(),
  ]);

  return <ClientMain initialUser={initialUser} initialGrade={initialGrade} />;
}
