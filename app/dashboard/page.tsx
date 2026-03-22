import { redirect } from "next/navigation";
import { prisma } from "@/app/src/lib/prisma";
import { getServerSession } from "@/app/src/lib/session";
import ExpensesBarChart from "./components/ExpensesBarChart";
import MonthFilter from "./components/MonthFilter";
import MonthlySummaryCards from "./components/MonthlySummaryCards";
import SalaryChartCard from "./components/SalaryChartCard";

type SalaryChartComparison = {
  currentLabel: string;
  previousLabel: string;
  currentTotal: number;
  previousTotal: number;
};

type SavingsSummary = {
  income: number;
  expenses: number;
};

async function getSalaryChartComparison(
  userId: string,
  selectedMonthStart: Date,
  nextMonthStart: Date,
): Promise<SalaryChartComparison> {
  const previousMonthStart = new Date(
    selectedMonthStart.getFullYear(),
    selectedMonthStart.getMonth() - 1,
    1,
    0,
    0,
    0,
  );

  const salaryRecords = await prisma.salaryRecord.findMany({
    where: {
      userId,
      period: { gte: previousMonthStart, lt: nextMonthStart },
    },
    orderBy: { period: "asc" },
  });

  const currentTotal = salaryRecords
    .filter((record) => {
      const periodDate = record.period ?? record.createdAt;
      return periodDate >= selectedMonthStart && periodDate < nextMonthStart;
    })
    .reduce((sum, record) => sum + Number(record.salary), 0);

  const previousTotal = salaryRecords
    .filter((record) => {
      const periodDate = record.period ?? record.createdAt;
      return periodDate >= previousMonthStart && periodDate < selectedMonthStart;
    })
    .reduce((sum, record) => sum + Number(record.salary), 0);

  const labelFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  });

  // Zwracamy gotowe podsumowanie wybranego miesiaca kontra poprzedni,
  // zeby karta nie musiala sama odtwarzac logiki zakresow dat.
  return {
    currentLabel: labelFormatter.format(selectedMonthStart),
    previousLabel: labelFormatter.format(previousMonthStart),
    currentTotal: Number(currentTotal.toFixed(2)),
    previousTotal: Number(previousTotal.toFixed(2)),
  };
}

function getSavingsSummary(
  incomeTotal: number,
  userExpenses: Array<{ amount: unknown }>,
): SavingsSummary {
  const expenses = userExpenses.reduce((sum, expense) => {
    const parsedAmount = Number(expense.amount);
    return Number.isFinite(parsedAmount) ? sum + parsedAmount : sum;
  }, 0);

  return {
    income: Number(incomeTotal.toFixed(2)),
    expenses: Number(expenses.toFixed(2)),
  };
}

function getSingleSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseMonth(monthParam: string | undefined): number {
  const month = Number(monthParam);
  if (Number.isInteger(month) && month >= 1 && month <= 12) {
    return month;
  }

  return new Date().getMonth() + 1;
}

function parseYear(yearParam: string | undefined): number {
  const year = Number(yearParam);
  if (Number.isInteger(year) && year >= 2000 && year <= 2100) {
    return year;
  }

  return new Date().getFullYear();
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const sp = await searchParams;
  const selectedMonth = parseMonth(getSingleSearchParam(sp.month));
  const selectedYear = parseYear(getSingleSearchParam(sp.year));

  const start = new Date(selectedYear, selectedMonth - 1, 1, 0, 0, 0);
  const end = new Date(selectedYear, selectedMonth, 1, 0, 0, 0);

  const [userExpenses, salaryComparison] = await Promise.all([
    prisma.expense.findMany({
      where: {
        userId: session.user.id,
        spentAt: { gte: start, lt: end },
      },
      orderBy: { spentAt: "desc" },
    }),
    getSalaryChartComparison(session.user.id, start, end),
  ]);

  const userExpensesByCategory = userExpenses.reduce<Record<string, number>>((acc, expense) => {
    const parsedAmount = Number(expense.amount);
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }

    acc[expense.category] += parsedAmount;
    return acc;
  }, {});

  const expensesBarChartData = Object.entries(userExpensesByCategory).map(([category, amount]) => ({
    category,
    amount: Number(amount.toFixed(2)),
  }));

  const savingsSummary = getSavingsSummary(salaryComparison.currentTotal, userExpenses);

  return (
    <main
      // style={{ backgroundImage: "url('/dashboard.jpg')" }}
      className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6"
    >
      <h1 className="text-2xl font-semibold text-zinc-100">Dashboard</h1>
      <MonthFilter />
      <MonthlySummaryCards income={savingsSummary.income} expenses={savingsSummary.expenses} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SalaryChartCard data={salaryComparison} />
        <ExpensesBarChart data={expensesBarChartData} />
      </div>
    </main>
  );
}
