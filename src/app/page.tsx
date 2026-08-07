import { Header } from "@/features/common/components/header/Header";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header role="guest" />
      <main className="flex-1">
        페이지
      </main>
    </div>
  );
}