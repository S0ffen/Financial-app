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
// Funkcja parseMonth sprawdza, czy przekazany parametr month jest liczbą całkowitą w zakresie od 1 do 12. Jeśli tak, zwraca tę wartość, w przeciwnym razie zwraca bieżący miesiąc (1-12).
function parseMonth(monthParam: string | null): number {
  const month = Number(monthParam);
  if (Number.isInteger(month) && month >= 1 && month <= 12) {
    return month;
  }

  return new Date().getMonth() + 1;
}
// Funkcja parseYear sprawdza, czy przekazany parametr year jest liczbą całkowitą w rozsądnym zakresie (2000-2100). Jeśli tak, zwraca tę wartość, w przeciwnym razie zwraca bieżący rok.
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

  // Pobieranie i parsowanie wartości month i year z query params, z domyślnymi wartościami jeśli są nieprawidłowe lub nieobecne
  const selectedMonth = parseMonth(searchParams.get("month"));
  const selectedYear = parseYear(searchParams.get("year"));

  const onMonthClick = (month: number) => {
    //Stare query params są kopiowane do nowego obiektu, a następnie aktualizowane o nowe wartości month i year
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("month", String(month));
    nextParams.set("year", String(selectedYear));
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-400">Month Filter</p>
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
