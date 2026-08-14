import { getServerCurrentUser } from "@/features/auth/services/serverCurrentUser";
import { InquiryDetail } from "@/features/support/components/InquiryDetail";

export default async function SupportInquiryDetailPage() {
  const initialUser = await getServerCurrentUser();
  return <InquiryDetail initialUser={initialUser} />;
}
