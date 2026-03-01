import { redirect } from "next/navigation";
import SignOutButton from "@/app/dashboard/SignOutButton";
import { getServerSession } from "@/app/src/lib/session";
import { AddExpenseDialog } from "./AddExpenseDialog";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 p-6">
      <SignOutButton />
      <p className="text-sm text-zinc-700">Zalogowany jako: {session.user.email}</p>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-zinc-600">To jest przykladowa strona po zalogowaniu.</p>

      <AddExpenseDialog />
    </main>
  );
}
