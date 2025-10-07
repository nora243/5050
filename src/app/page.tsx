import GameInterface from "@/components/GameInterface";
import AdminPanel from "@/components/AdminPanel";
import PlayerHistory from "@/components/PlayerHistory";

export default function Home() {
  return (
    <div className="min-h-screen py-8 space-y-8">
      <GameInterface />
      <PlayerHistory />
      <AdminPanel />
    </div>
  );
}
