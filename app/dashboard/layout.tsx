import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/app/src/lib/session";
import Navbar from "./Navbar";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const sessionUser = session.user as {
    role?: string;
    username?: string | null;
    displayUsername?: string | null;
    email: string;
  };
  const isAdmin = sessionUser.role === "admin";
  // W sidebarze pokazujemy publiczna nazwe usera, a email zostawiamy tylko jako fallback.
  const userLabel =
    sessionUser.displayUsername?.trim() ||
    sessionUser.username?.trim() ||
    sessionUser.email;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(36,44,64,0.35),_transparent_40%),linear-gradient(180deg,_#09090b_0%,_#050507_100%)]">
      <Navbar userLabel={userLabel} isAdmin={isAdmin} />
      <div className="lg:pl-72">
        {children}
      </div>
    </div>
  );
}
