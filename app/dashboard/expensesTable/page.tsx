import { redirect } from "next/navigation";
import { prisma } from "@/app/src/lib/prisma";
import { getServerSession } from "@/app/src/lib/session";
import DeleteExpenseButton from "./DeleteExpenseButton";
import MonthFilter from "../components/MonthFilter";
import CategoryFilter from "../components/CategoryFilter";
import { AddExpenseDialog } from "../components/AddExpenseDialog";
import type { Prisma } from "@/generated/prisma/client";

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

type ExpensesTablePageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const allowedCategories = [
  "Food",
  "Recurring",
  "Investment",
  "Occasional",
  "Entertainment",
] as const;

type AllowedCategory = (typeof allowedCategories)[number];

function parseCategory(categoryParam: string | undefined): AllowedCategory | null {
  if (!categoryParam) {
    return null;
  }

  const normalized = categoryParam.toLowerCase();
  const matched = allowedCategories.find((category) => category.toLowerCase() === normalized);

  return matched ?? null;
}

export default async function ExpensesTablePage({ searchParams }: ExpensesTablePageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const sp = await searchParams;
  const monthRaw = Array.isArray(sp.month) ? sp.month[0] : sp.month;
  const yearRaw = Array.isArray(sp.year) ? sp.year[0] : sp.year;
  const categoryRaw = Array.isArray(sp.category) ? sp.category[0] : sp.category;

  const month = Number(monthRaw);
  const year = Number(yearRaw);

  const selectedMonth =
    Number.isInteger(month) && month >= 1 && month <= 12 ? month : new Date().getMonth() + 1;
  const selectedYear =
    Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : new Date().getFullYear();
  const selectedCategory = parseCategory(categoryRaw);

  const start = new Date(selectedYear, selectedMonth - 1, 1, 0, 0, 0);
  const end = new Date(selectedYear, selectedMonth, 1, 0, 0, 0);

  // Build dynamic Prisma filter: month/year always, category only when selected.
  const where: Prisma.ExpenseWhereInput = {
    userId: session.user.id,
    spentAt: {
      gte: start,
      lt: end,
    },
  };

  if (selectedCategory) {
    where.category = selectedCategory;
  }

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { spentAt: "desc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold text-zinc-100">Expenses Table</h1>
      <MonthFilter />
      <CategoryFilter />

      <AddExpenseDialog />
      <section className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/60">
        <table className="min-w-full text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/60">
            <tr className="text-left text-zinc-300">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Currency</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-zinc-400" colSpan={6}>
                  Brak wydatkow do wyswietlenia.
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-zinc-900/80 text-zinc-200">
                  <td className="px-4 py-3">
                    {expense.spentAt ? dateFormatter.format(expense.spentAt) : "-"}
                  </td>
                  <td className="px-4 py-3">{expense.category}</td>
                  <td className="px-4 py-3 tabular-nums">{Number(expense.amount).toFixed(2)}</td>
                  <td className="px-4 py-3">{expense.currency}</td>
                  <td className="max-w-[24rem] px-4 py-3 text-zinc-300">
                    {expense.description?.trim() ? expense.description : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteExpenseButton expenseId={expense.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
