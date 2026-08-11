import { Header } from "@/features/common/components/header/Header";
import { GuestLanding } from "@/features/common/components/GuestLanding";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header role="guest" />
      <main className="flex-1">
        <GuestLanding />
      </main>
    </div>
  );
}