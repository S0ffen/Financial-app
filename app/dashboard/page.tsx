import { redirect } from "next/navigation";
import { getServerSession } from "@/app/src/lib/session";
import { AddExpenseDialog } from "./AddExpenseDialog";
import { prisma } from "@/app/src/lib/prisma";
import ExpensesPieChart from "./ExpensesPieChart";
import Navbar from "./Navbar";

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

    acc[expense.category] += parsedAmount;
    return acc;
  }, {});

  const pieChartData = Object.entries(userExpensesByCategory).map(([category, amount]) => ({
    category,
    amount: Number(amount.toFixed(2)),
  }));

  return (
    <div className="min-h-screen">
      <Navbar userEmail={session.user.email} />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6">
        <h1 className="text-2xl font-semibold text-zinc-100">Dashboard</h1>
        <p className="text-sm text-zinc-400">To jest przykladowa strona po zalogowaniu.</p>

        <AddExpenseDialog />
        <ExpensesPieChart data={pieChartData} />
      </main>
    </div>
  );
}
