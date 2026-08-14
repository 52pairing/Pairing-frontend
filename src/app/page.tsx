import { getServerCurrentUser } from "@/features/auth/services/serverCurrentUser";
import { Header } from "@/features/common/components/header/Header";
import { GuestLanding } from "@/features/common/components/GuestLanding";

export default async function Home() {
  const initialUser = await getServerCurrentUser();
  return (
    <div className="flex min-h-screen flex-col">
      <Header role="guest" initialUser={initialUser} />
      <main className="flex-1">
        <GuestLanding />
      </main>
    </div>
  );
}