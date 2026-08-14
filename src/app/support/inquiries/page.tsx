import { getServerCurrentUser } from "@/features/auth/services/serverCurrentUser";
import { InquiryList } from "@/features/support/components/InquiryList";

export default async function SupportInquiriesPage() {
  const initialUser = await getServerCurrentUser();
  return <InquiryList initialUser={initialUser} />;
}
