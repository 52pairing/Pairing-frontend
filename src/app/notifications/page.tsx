import { getServerCurrentUser } from "@/features/auth/services/serverCurrentUser";
import { Notifications } from "@/features/notification/components/Notifications";

export default async function NotificationsPage() {
  const initialUser = await getServerCurrentUser();
  return <Notifications initialUser={initialUser} />;
}
