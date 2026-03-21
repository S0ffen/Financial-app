import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/app/src/lib/prisma";
import { getServerSession } from "@/app/src/lib/session";
import { parseExpenseCategory } from "@/lib/constants/ExpenseCategories";
import { AddExpenseDialog } from "../components/AddExpenseDialog";
import CategoryFilter from "../components/CategoryFilter";
import MonthFilter from "../components/MonthFilter";
import ExpensesListClient from "./ExpensesListClient";


type ExpensesTablePageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

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
  const selectedCategory = parseExpenseCategory(categoryRaw);

  const start = new Date(selectedYear, selectedMonth - 1, 1, 0, 0, 0);
  const end = new Date(selectedYear, selectedMonth, 1, 0, 0, 0);

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
    orderBy: [{ spentAt: "desc" }, { createdAt: "desc" }],
  });

  const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  // Normalizujemy dane dla komponentu klienta, zeby nie przerzucac Decimal i Date bezposrednio do propsow.
  const normalizedExpenses = expenses.map((expense) => ({
    id: expense.id,
    category: expense.category,
    amount: Number(expense.amount),
    currency: expense.currency,
    description: expense.description,
    spentAt: expense.spentAt ? expense.spentAt.toISOString() : null,
  }));

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold text-zinc-100">Expenses</h1>
      <MonthFilter />
      <CategoryFilter />
      <div className="flex flex-wrap gap-3">
        <AddExpenseDialog />
        <Link
          href="/dashboard/expenses/import"
          className="btn-dark-pill inline-flex items-center justify-center"
        >
          Import CSV
        </Link>
      </div>

      {normalizedExpenses.length === 0 ? (
        <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="px-5 py-10 text-center text-zinc-400">
            No expenses found for the selected filters.
          </div>
        </section>
      ) : (
        <ExpensesListClient
          expenses={normalizedExpenses}
          totalAmount={totalAmount}
        />
      )}
    </main>
  );
}
