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

  const isAdmin = (session.user as { role?: string }).role === "admin";

  return (
    <div className="min-h-screen">
      <Navbar userEmail={session.user.email} isAdmin={isAdmin} />
      {children}
    </div>
  );
}
