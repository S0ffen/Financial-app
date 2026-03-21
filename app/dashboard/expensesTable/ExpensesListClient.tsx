"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { getExpenseCategoryMeta } from "@/lib/constants/expenseCategoryMeta";
import BulkDeleteExpensesButton from "./BulkDeleteExpensesButton";
import DeleteExpenseButton from "./DeleteExpenseButton";
import EditExpenseDialog from "./EditExpenseDialog";

type ExpenseListItem = {
  id: string;
  category: string;
  amount: number;
  currency: string;
  description: string | null;
  spentAt: string | null;
};

type ExpensesListClientProps = {
  expenses: ExpenseListItem[];
  totalAmount: number;
};

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const amountFormatter = new Intl.NumberFormat("pl-PL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function ExpensesListClient({
  expenses,
  totalAmount,
}: ExpensesListClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allSelected = expenses.length > 0 && selectedIds.length === expenses.length;
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggleExpense = (expenseId: string) => {
    setSelectedIds((currentIds) => {
      if (currentIds.includes(expenseId)) {
        return currentIds.filter((id) => id !== expenseId);
      }

      return [...currentIds, expenseId];
    });
  };

  const toggleAllExpenses = () => {
    setSelectedIds(allSelected ? [] : expenses.map((expense) => expense.id));
  };

  const checkboxClass = (checked: boolean) =>
    `inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
      checked
        ? "border-zinc-200 bg-zinc-100 text-zinc-900 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
        : "border-zinc-600 bg-zinc-900 text-transparent hover:border-zinc-500 hover:bg-zinc-800"
    }`;

  return (
    <>
      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
          <p className="text-sm text-zinc-300">
            Selected expenses: <span className="font-semibold text-zinc-100">{selectedIds.length}</span>
          </p>
          <BulkDeleteExpensesButton expenseIds={selectedIds} />
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-4 sm:px-5">
          <p className="text-lg font-semibold text-zinc-200">
            Transactions: <span className="text-zinc-100">{expenses.length}</span>
          </p>
          <p className="text-lg font-semibold text-zinc-200">
            Total: <span className="text-emerald-400">{amountFormatter.format(totalAmount)} PLN</span>
          </p>
        </header>

        <div className="flex items-center justify-between gap-4 border-b border-zinc-800 px-4 py-4 sm:px-5">
          <button
            type="button"
            onClick={toggleAllExpenses}
            className="inline-flex items-center gap-3 text-sm font-medium text-zinc-200 transition-colors hover:text-zinc-50"
          >
            <span className={checkboxClass(allSelected)}>
              <Check className="h-3.5 w-3.5" />
            </span>
            Select all visible expenses
          </button>
          <p className="text-sm text-zinc-400">Use checkboxes to bulk delete multiple records.</p>
        </div>

        <div className="divide-y divide-zinc-800">
          {expenses.map((expense) => {
            const amountDisplay = `-${amountFormatter.format(Math.abs(expense.amount))} ${expense.currency}`;
            const spentAtDisplay = expense.spentAt ? dateFormatter.format(new Date(expense.spentAt)) : "-";
            const description = expense.description?.trim() || "No description";
            const categoryMeta = getExpenseCategoryMeta(expense.category);
            const CategoryIcon = categoryMeta.icon;
            const isSelected = selectedIdSet.has(expense.id);

            return (
              <article
                key={expense.id}
                className={`group relative flex items-center gap-4 px-4 py-4 transition-colors sm:px-5 ${
                  isSelected ? "bg-zinc-900/90" : "hover:bg-zinc-900"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleExpense(expense.id)}
                  className={checkboxClass(isSelected)}
                  aria-label={isSelected ? "Unselect expense" : "Select expense"}
                  title={isSelected ? "Unselect expense" : "Select expense"}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${categoryMeta.iconWrapperClass}`}
                >
                  <CategoryIcon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-1">
                    <p className="truncate text-lg font-medium text-zinc-100">{expense.category}</p>
                    <p className="text-right text-lg font-semibold tabular-nums text-zinc-100">{amountDisplay}</p>

                    <p className="truncate text-sm text-zinc-400">{description}</p>
                    <p className="text-right text-sm tabular-nums text-zinc-400">{spentAtDisplay}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <EditExpenseDialog
                    expenseId={expense.id}
                    category={expense.category}
                    amount={expense.amount}
                    currency={expense.currency}
                    description={expense.description}
                    spentAt={expense.spentAt ? expense.spentAt.slice(0, 10) : null}
                  />
                  <DeleteExpenseButton expenseId={expense.id} />
                </div>

                <div className={`absolute right-0 top-0 h-full w-1 ${categoryMeta.accentClass}`} />
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
