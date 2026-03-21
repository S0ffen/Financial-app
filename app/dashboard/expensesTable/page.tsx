import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/app/src/lib/prisma";
import { getServerSession } from "@/app/src/lib/session";
import { parseExpenseCategory } from "@/lib/constants/ExpenseCategories";
import { getExpenseCategoryMeta } from "@/lib/constants/expenseCategoryMeta";
import { AddExpenseDialog } from "../components/AddExpenseDialog";
import CategoryFilter from "../components/CategoryFilter";
import MonthFilter from "../components/MonthFilter";
import DeleteExpenseButton from "./DeleteExpenseButton";

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const amountFormatter = new Intl.NumberFormat("pl-PL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

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

      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-4 sm:px-5">
          <p className="text-lg font-semibold text-zinc-200">
            Transactions: <span className="text-zinc-100">{expenses.length}</span>
          </p>
          <p className="text-lg font-semibold text-zinc-200">
            Total:{" "}
            <span className="text-emerald-400">
              {amountFormatter.format(totalAmount)} PLN
            </span>
          </p>
        </header>

        {expenses.length === 0 ? (
          <div className="px-5 py-10 text-center text-zinc-400">
            No expenses found for the selected filters.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {expenses.map((expense) => {
              const amount = Number(expense.amount);
              const amountDisplay = `${amount < 0 ? "" : "-"}${amountFormatter.format(Math.abs(amount))} ${expense.currency}`;
              const spentAtDisplay = expense.spentAt ? dateFormatter.format(expense.spentAt) : "-";
              const description = expense.description?.trim() || "No description";
              const categoryMeta = getExpenseCategoryMeta(expense.category);
              const CategoryIcon = categoryMeta.icon;

              return (
                <article
                  key={expense.id}
                  className="group relative flex items-center gap-4 px-4 py-4 transition-colors hover:bg-zinc-900 sm:px-5"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${categoryMeta.iconWrapperClass}`}
                  >
                    <CategoryIcon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-1">
                      <p className="truncate text-lg font-medium text-zinc-100">
                        {expense.category}
                      </p>
                      <p className="text-right text-lg font-semibold tabular-nums text-zinc-100">
                        {amountDisplay}
                      </p>

                      <p className="truncate text-sm text-zinc-400">{description}</p>
                      <p className="text-right text-sm tabular-nums text-zinc-400">
                        {spentAtDisplay}
                      </p>
                    </div>
                  </div>

                  <DeleteExpenseButton expenseId={expense.id} />

                  <div
                    className={`absolute right-0 top-0 h-full w-1 ${categoryMeta.accentClass}`}
                  />
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}