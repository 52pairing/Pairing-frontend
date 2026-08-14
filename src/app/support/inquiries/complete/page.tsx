import { getServerCurrentUser } from "@/features/auth/services/serverCurrentUser";
import { InquiryComplete } from "@/features/support/components/InquiryComplete";

export default async function SupportInquiryCompletePage() {
  const initialUser = await getServerCurrentUser();
  return <InquiryComplete initialUser={initialUser} />;
}
