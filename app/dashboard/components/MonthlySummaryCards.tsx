"use client";

import { ArrowDownLeft, ArrowUpRight, PiggyBank } from "lucide-react";

type MonthlySummaryCardsProps = {
  income: number;
  expenses: number;
};

const formatCurrency = (value: number) =>
  value.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function MonthlySummaryCards({ income, expenses }: MonthlySummaryCardsProps) {
  const savings = income - expenses;

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <article className="rounded-2xl border border-emerald-500/25 bg-zinc-950/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div className="mb-3 inline-flex rounded-xl bg-emerald-500/15 p-2 text-emerald-400">
          <ArrowDownLeft size={18} />
        </div>
        <p className="text-sm text-zinc-400">Income</p>
        <p className="mt-1 text-3xl font-semibold text-emerald-400">{formatCurrency(income)} PLN</p>
      </article>

      <article className="rounded-2xl border border-red-500/25 bg-zinc-950/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div className="mb-3 inline-flex rounded-xl bg-red-500/15 p-2 text-red-400">
          <ArrowUpRight size={18} />
        </div>
        <p className="text-sm text-zinc-400">Expenses</p>
        <p className="mt-1 text-3xl font-semibold text-red-400">{formatCurrency(expenses)} PLN</p>
      </article>

      <article className="rounded-2xl border border-amber-500/25 bg-zinc-950/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:col-span-2 xl:col-span-1">
        <div className="mb-3 inline-flex rounded-xl bg-amber-500/15 p-2 text-amber-400">
          <PiggyBank size={18} />
        </div>
        <p className="text-sm text-zinc-400">Savings</p>
        <p
          className={`mt-1 text-3xl font-semibold ${savings >= 0 ? "text-amber-400" : "text-red-400"}`}
        >
          {formatCurrency(savings)} PLN
        </p>
      </article>
    </section>
  );
}
