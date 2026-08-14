import { getServerCurrentUser } from "@/features/auth/services/serverCurrentUser";
import { SupportChatbot } from "@/features/support/components/SupportChatbot";

export default async function SupportChatbotPage() {
  const initialUser = await getServerCurrentUser();
  return <SupportChatbot initialUser={initialUser} />;
}
