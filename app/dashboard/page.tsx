import { redirect } from "next/navigation";
import { getServerSession } from "@/app/src/lib/session";
import { AddExpenseDialog } from "./components/AddExpenseDialog";
import { prisma } from "@/app/src/lib/prisma";
import ExpensesPieChart from "./components/ExpensesPieChart";
import MonthFilter from "./components/MonthFilter";
import SalaryChartCard from "./components/SalaryChartCard";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession();

  const sp = await searchParams;
  console.log("Search params in dashboard page:", sp);

  //Sprawdzenie, czy parametry month i year są tablicami (co może się zdarzyć, jeśli w URL jest więcej niż jeden parametr o tej samej nazwie) i pobranie pierwszej wartości lub null
  const monthRaw = Array.isArray(sp.month) ? sp.month[0] : sp.month;
  const yearRaw = Array.isArray(sp.year) ? sp.year[0] : sp.year;

  //Validacja parametrów month i year, z domyślnymi wartościami jeśli są nieprawidłowe lub nieobecne
  const monthValidate = () => {
    let month = Number(monthRaw);
    if (Number.isInteger(month) && month >= 1 && month <= 12) {
      return month;
    }
    return new Date().getMonth() + 1;
  };
  const yearValidate = () => {
    let year = Number(yearRaw);
    if (year >= 2000 && year <= 2100) {
      return year;
    }
    return (year = new Date().getFullYear());
  };

  const selectedMonth = monthValidate();
  const selectedYear = yearValidate();

  console.log("Month param:", selectedMonth);
  console.log("Year param:", selectedYear);

  if (!session) {
    redirect("/login");
  }

  //TODO: czemu jest raz 23 raz 22 , a raz 21? chyba timezone, trzeba to ogarnąć
  const start = new Date(selectedYear, selectedMonth - 1, 1, 0, 0, 0);
  const end = new Date(selectedYear, selectedMonth, 1, 0, 0, 0);

  console.log("Start date:", start);
  console.log("End date:", end);

  const userExpenses = await prisma.expense.findMany({
    where: { userId: session.user.id, spentAt: { gte: start, lt: end } },
    orderBy: { spentAt: "desc" },
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
    <main className="mx-auto flex w-full flex-col gap-4 px-4 py-6 lg:w-[75%]">
      <h1 className="text-2xl font-semibold text-zinc-100">Dashboard</h1>
      <p className="text-sm text-zinc-400">To jest przykladowa strona po zalogowaniu.</p>
      <MonthFilter />

      <AddExpenseDialog />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SalaryChartCard />
        <ExpensesPieChart data={pieChartData} />
      </div>
    </main>
  );
}
