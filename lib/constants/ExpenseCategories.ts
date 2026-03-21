// Single source of truth for expense categories used by API and UI.
export const expenseCategories = [
  "Food",
  "Shopping",
  "Recurring",
  "Health",
  "Transport",
  "Entertainment",
  "Investment",
  "Occasional",
  "Uncategorized",
] as const;

// Union type created directly from expenseCategories.
export type ExpenseCategory = (typeof expenseCategories)[number];

// Normalizes input (for example " food " -> "Food") and returns a valid category or null.
export function parseExpenseCategory(value: string | null | undefined): ExpenseCategory | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  const matched = expenseCategories.find((category) => category.toLowerCase() === normalized);

  return matched ?? null;
}

// Type guard used in forms and APIs.
export function isExpenseCategory(value: unknown): value is ExpenseCategory {
  return typeof value === "string" && parseExpenseCategory(value) !== null;
}