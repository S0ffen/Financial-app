import { redirect } from "next/navigation";
import { HandCoins } from "lucide-react";
import { prisma } from "@/app/src/lib/prisma";
import { getServerSession } from "@/app/src/lib/session";
import AddIncomeForm from "../components/AddIncomeForm";
import MonthFilter from "../components/MonthFilter";
import DeleteIncomeButton from "./DeleteIncomeButton";
import EditIncomeDialog from "./EditIncomeDialog";

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const amountFormatter = new Intl.NumberFormat("pl-PL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type IncomePageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

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

export default async function IncomePage({ searchParams }: IncomePageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const sp = await searchParams;
  const selectedMonth = parseMonth(getSingleSearchParam(sp.month));
  const selectedYear = parseYear(getSingleSearchParam(sp.year));

  const start = new Date(selectedYear, selectedMonth - 1, 1, 0, 0, 0);
  const end = new Date(selectedYear, selectedMonth, 1, 0, 0, 0);

  const records = await prisma.salaryRecord.findMany({
    where: {
      userId: session.user.id,
      period: {
        gte: start,
        lt: end,
      },
    },
    orderBy: [{ period: "desc" }, { createdAt: "desc" }],
  });

  const totalIncome = records.reduce((sum, record) => sum + Number(record.salary), 0);
  const today = new Date();
  // Gdy user jest na biezacym miesiacu, domyslnie podstawiamy dzisiejsza date.
  // Dla innych miesiecy zostawiamy pierwszy dzien wybranego miesiaca.
  const isCurrentSelectedMonth =
    today.getFullYear() === selectedYear && today.getMonth() + 1 === selectedMonth;
  const defaultDate = isCurrentSelectedMonth
    ? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
        today.getDate(),
      ).padStart(2, "0")}`
    : `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold text-zinc-100">Income</h1>
      <MonthFilter />
      <AddIncomeForm defaultDate={defaultDate} />

      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-4 sm:px-5">
          <p className="text-lg font-semibold text-zinc-200">
            Records: <span className="text-zinc-100">{records.length}</span>
          </p>
          <p className="text-lg font-semibold text-zinc-200">
            Total income:{" "}
            <span className="text-emerald-400">{amountFormatter.format(totalIncome)} PLN</span>
          </p>
        </header>

        {records.length === 0 ? (
          <div className="px-5 py-10 text-center text-zinc-400">
            No income records found for the selected month.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {records.map((record) => {
              const periodDate = record.period ?? record.createdAt;

              return (
                <article
                  key={record.id}
                  className="relative flex items-center gap-4 px-4 py-4 sm:px-5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                    <HandCoins className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-1">
                      <p className="truncate text-lg font-medium text-zinc-100">Income</p>
                      <p className="text-right text-lg font-semibold tabular-nums text-emerald-300">
                        {amountFormatter.format(Number(record.salary))} PLN
                      </p>

                      <p className="truncate text-sm text-zinc-300">
                        {record.description?.trim() ? record.description : "No description"}
                      </p>
                      <p className="text-right text-sm tabular-nums text-zinc-400">
                        {dateFormatter.format(periodDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <EditIncomeDialog
                      recordId={record.id}
                      salary={Number(record.salary)}
                      description={record.description}
                      period={periodDate.toISOString().slice(0, 10)}
                    />
                    <DeleteIncomeButton recordId={record.id} />
                  </div>

                  <div className="absolute right-0 top-0 h-full w-1 bg-emerald-400" />
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
