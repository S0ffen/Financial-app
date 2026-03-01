import { redirect } from "next/navigation";
import SignOutButton from "@/app/dashboard/SignOutButton";
import { getServerSession } from "@/app/src/lib/session";
import { AddExpenseDialog } from "./AddExpenseDialog";
import { prisma } from "@/app/src/lib/prisma";
import ExpensesPieChart from "./ExpensesPieChart";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }
  const userExpenses = await prisma.expense.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const userExpensesByCategory = userExpenses.reduce<Record<string, number>>((acc, expense) => {
    const parsedAmount = Number(expense.amount);
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }

    // console.log("this is acc:", acc);
    // console.log("this is expense:", expense);

    acc[expense.category] += parsedAmount;
    return acc;
  }, {});
  console.log("User expenses by category:", userExpensesByCategory);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 p-6">
      <SignOutButton />
      <p className="text-sm text-zinc-700">Zalogowany jako: {session.user.email}</p>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-zinc-600">To jest przykladowa strona po zalogowaniu.</p>

      <AddExpenseDialog />
      <ExpensesPieChart data={userExpensesByCategory} />
    </main>
  );
}
