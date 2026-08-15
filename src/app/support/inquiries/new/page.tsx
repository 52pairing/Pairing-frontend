import { getServerCurrentUser } from "@/features/auth/services/serverCurrentUser";
import { InquiryForm } from "@/features/support/components/InquiryForm";

export default async function NewSupportInquiryPage() {
  const initialUser = await getServerCurrentUser();
  return <InquiryForm initialUser={initialUser} />;
}
