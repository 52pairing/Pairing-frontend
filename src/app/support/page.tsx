import { getServerCurrentUser } from "@/features/auth/services/serverCurrentUser";
import { Support } from "@/features/support/components/Support";

export default async function SupportPage() {
  const initialUser = await getServerCurrentUser();
  return <Support initialUser={initialUser} />;
}
