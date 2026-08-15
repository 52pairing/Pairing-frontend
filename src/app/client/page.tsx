import { ClientMain } from "@/features/client/components/ClientMain";
import { getServerCurrentUser } from "@/features/auth/services/serverCurrentUser";

export default async function ClientHomePage() {
  const initialUser = await getServerCurrentUser();
  return <ClientMain initialUser={initialUser} />;
}
