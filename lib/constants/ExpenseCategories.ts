// Jedno źródło prawdy dla kategorii wydatków używanych w całej aplikacji (UI + API).
export const expenseCategories = [
  "Food",
  "Recurring",
  "Investment",
  "Occasional",
  "Entertainment",
] as const;

// Union typu: "Food" | "Recurring" | "Investment" | ...
// Powstaje automatycznie na bazie expenseCategories.
export type ExpenseCategory = (typeof expenseCategories)[number];

// Normalizuje wejście (np. " food " -> "Food") i zwraca poprawną kategorię albo null.
export function parseExpenseCategory(value: string | null | undefined): ExpenseCategory | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  const matched = expenseCategories.find((category) => category.toLowerCase() === normalized);

  return matched ?? null;
}

// Type guard: pozwala TypeScriptowi zawęzić typ po sprawdzeniu.
// Po if (isExpenseCategory(x)) zmienna x ma typ ExpenseCategory.
export function isExpenseCategory(value: unknown): value is ExpenseCategory {
  return typeof value === "string" && parseExpenseCategory(value) !== null;
}
