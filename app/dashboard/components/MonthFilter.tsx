"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

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
] as const;

function parseMonth(monthParam: string | null): number {
  const month = Number(monthParam);
  if (Number.isInteger(month) && month >= 1 && month <= 12) {
    return month;
  }

  return new Date().getMonth() + 1;
}

function parseYear(yearParam: string | null): number {
  const year = Number(yearParam);
  if (Number.isInteger(year) && year >= 2000 && year <= 2100) {
    return year;
  }

  return new Date().getFullYear();
}

export default function MonthFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read month/year from URL. If invalid or missing, fallback to current date.
  const selectedMonth = parseMonth(searchParams.get("month"));
  const selectedYear = parseYear(searchParams.get("year"));
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, index) => currentYear + 2 - index);

  if (!yearOptions.includes(selectedYear)) {
    yearOptions.push(selectedYear);
    yearOptions.sort((a, b) => b - a);
  }

  const onMonthClick = (month: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("month", String(month));
    nextParams.set("year", String(selectedYear));
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  const onYearChange = (year: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("month", String(selectedMonth));
    nextParams.set("year", String(year));
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Month Filter</p>
          <p className="text-xs text-zinc-500">
            Selected: {months[selectedMonth - 1]} {selectedYear}
          </p>
        </div>

        <div className="w-full sm:w-44">
          <label
            htmlFor="year-select"
            className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-400"
          >
            Year
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(event) => onYearChange(Number(event.target.value))}
            className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none transition-colors focus:border-zinc-500"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {months.map((month, index) => {
          const monthNumber = index + 1;
          const isActive = monthNumber === selectedMonth;

          return (
            <Button
              key={month}
              type="button"
              variant={isActive ? "default" : "outline"}
              onClick={() => onMonthClick(monthNumber)}
              className={
                isActive
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
  );
}
