import { auth } from "@/lib/auth";
import DMDashboard from "@/components/dashboard/DMDashboard";
import PlayerDashboard from "@/components/dashboard/PlayerDashboard";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const isDM = session.user.role === 'dm';

  return isDM ? <DMDashboard /> : <PlayerDashboard />;
}
