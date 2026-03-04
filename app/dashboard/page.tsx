import { redirect } from "next/navigation";
import { getServerSession } from "@/app/src/lib/session";
import { AddExpenseDialog } from "./AddExpenseDialog";
import { prisma } from "@/app/src/lib/prisma";
import ExpensesPieChart from "./ExpensesPieChart";
import Navbar from "./Navbar";
import { Button } from "@/components/ui/button";

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

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentMonthIndex = new Date().getMonth();

  return (
    <div className="min-h-screen">
      <Navbar userEmail={session.user.email} />
      <main className="mx-auto flex w-full max-w-2/4 flex-col gap-4 p-6">
        <h1 className="text-2xl font-semibold text-zinc-100">Dashboard</h1>
        <p className="text-sm text-zinc-400">To jest przykladowa strona po zalogowaniu.</p>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
          <p className="mb-3 text-xs font-medium tracking-wide text-zinc-400 uppercase">
            Month Filter
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-12">
            {months.map((month, index) => {
              const isCurrentMonth = index === currentMonthIndex;

              return (
                <Button
                  key={month}
                  type="button"
                  variant={isCurrentMonth ? "default" : "outline"}
                  className={
                    isCurrentMonth
                      ? "h-9 bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                      : "h-9 border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50"
                  }
                >
                  {month}
                </Button>
              );
            })}
          </div>
        </section>

        <AddExpenseDialog />
        <div>
          <ExpensesPieChart data={pieChartData} />
        </div>
      </main>
    </div>
  );
}
