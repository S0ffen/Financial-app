import { createHash } from "crypto";
import { expenseImportRules } from "@/lib/constants/expenseImportRules";
import type { ExpenseCategory } from "@/lib/constants/ExpenseCategories";

const HEADER_PREFIX = '"Data transakcji"';
const AMOUNT_INDEX_CANDIDATES = [8, 10, 12] as const;
const CURRENCY_INDEX_CANDIDATES = [9, 11, 13] as const;
const INCOME_KEYWORDS = ["WYNAGRODZEN", "WYPLATA", "PENSJ", "SALARY", "PAYROLL"];
const INTERNAL_TRANSFER_KEYWORDS = ["PRZELEW WŁASNY", "PRZELEW WLASNE", "TRANSFER WEWNETRZNY"];

export type ParsedIngCsvRow = {
  kind: "expense" | "income";
  transactionDate: string | null;
  bookingDate: string | null;
  counterparty: string;
  title: string;
  details: string;
  accountName: string;
  externalTransactionId: string | null;
  amount: number;
  currency: string;
  spentAt: string;
  description: string;
  suggestedCategory: ExpenseCategory | null;
  matchedRuleId: string | null;
  matchedKeyword: string | null;
};

export type ParsedIngCsvResult = {
  totalRows: number;
  expenseRows: number;
  incomeRows: number;
  ignoredRows: number;
  rows: ParsedIngCsvRow[];
};

// Dekodujemy eksport ING z fallbackiem na windows-1250, bo pliki bankowe czesto nie sa UTF-8.
export function decodeIngCsvBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  for (const encoding of ["utf-8", "windows-1250"]) {
    try {
      const decoded = new TextDecoder(encoding, { fatal: true }).decode(bytes);
      if (decoded.includes("Data transakcji")) {
        return decoded;
      }
    } catch {
      // Probujemy kolejne wspierane kodowanie.
    }
  }

  return new TextDecoder("windows-1250").decode(bytes);
}

export function splitIngCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ";" && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

export function normalizeImportText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[*'`"\/]/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

function cleanCsvValue(value: string | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function parseAmount(rawValue: string | undefined): number | null {
  const cleaned = cleanCsvValue(rawValue).replace(/\s/g, "").replace(",", ".");
  if (!cleaned) {
    return null;
  }

  const numericValue = Number(cleaned);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function toIsoDate(rawValue: string | undefined): string | null {
  const cleaned = cleanCsvValue(rawValue);
  if (!cleaned) {
    return null;
  }

  const parsed = new Date(cleaned);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function pickAmountAndCurrency(columns: string[]): { amount: number | null; currency: string } {
  for (let index = 0; index < AMOUNT_INDEX_CANDIDATES.length; index += 1) {
    const amountIndex = AMOUNT_INDEX_CANDIDATES[index];
    const parsedAmount = parseAmount(columns[amountIndex]);

    if (parsedAmount !== null) {
      const currency = cleanCsvValue(columns[CURRENCY_INDEX_CANDIDATES[index]]) || "PLN";
      return { amount: parsedAmount, currency };
    }
  }

  return { amount: null, currency: "PLN" };
}

function isGenericTitle(title: string): boolean {
  const normalized = normalizeImportText(title);
  return ["PLATNOSC KARTA", "PLATNOSC BLIK", "PRZELEW", "NR KARTY", "NR TRANSAKCJI"].some(
    (fragment) => normalized.includes(fragment),
  );
}

function buildImportDescription(counterparty: string, title: string): string {
  const normalizedCounterparty = cleanCsvValue(counterparty);
  const normalizedTitle = cleanCsvValue(title);

  if (!normalizedTitle || isGenericTitle(normalizedTitle)) {
    return normalizedCounterparty;
  }

  if (normalizeImportText(normalizedTitle).includes(normalizeImportText(normalizedCounterparty))) {
    return normalizedCounterparty;
  }

  return `${normalizedCounterparty} - ${normalizedTitle}`.slice(0, 300);
}

function matchExpenseCategory(
  counterparty: string,
  title: string,
  details: string,
): {
  category: ExpenseCategory;
  matchedRuleId: string | null;
  matchedKeyword: string | null;
} {
  const haystack = normalizeImportText(`${counterparty} ${title} ${details}`);

  for (const rule of expenseImportRules) {
    for (const keyword of rule.keywords) {
      if (haystack.includes(keyword)) {
        return {
          category: rule.category,
          matchedRuleId: rule.id,
          matchedKeyword: keyword,
        };
      }
    }
  }

  return {
    category: "Uncategorized",
    matchedRuleId: null,
    matchedKeyword: null,
  };
}

function isSalaryLikeIncome(counterparty: string, title: string, details: string): boolean {
  const haystack = normalizeImportText(`${counterparty} ${title} ${details}`);
  return INCOME_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

// Pomijamy przelewy wlasne, bo nie sa realnym wydatkiem ani przychodem do sledzenia.
function isInternalTransfer(counterparty: string, title: string, details: string): boolean {
  const haystack = normalizeImportText(`${counterparty} ${title} ${details}`);
  return INTERNAL_TRANSFER_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

// Hash zawiera typ rekordu i userId, zeby import byl idempotentny per user i per kolekcja danych.
export function buildBankImportHash(
  userId: string,
  row: Pick<
    ParsedIngCsvRow,
    | "kind"
    | "spentAt"
    | "amount"
    | "currency"
    | "counterparty"
    | "title"
    | "details"
    | "accountName"
  >,
): string {
  const payload = [
    userId,
    row.kind,
    row.spentAt,
    row.amount.toFixed(2),
    row.currency,
    normalizeImportText(row.counterparty),
    normalizeImportText(row.title),
    normalizeImportText(row.details),
    normalizeImportText(row.accountName),
  ].join("|");

  return createHash("sha256").update(payload).digest("hex");
}

export function parseIngBankCsv(csvText: string): ParsedIngCsvResult {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trimEnd());

  const headerIndex = lines.findIndex((line) => line.startsWith(HEADER_PREFIX));
  if (headerIndex === -1) {
    throw new Error("Unsupported CSV format. ING transaction header was not found.");
  }

  const dataLines = lines.slice(headerIndex + 1).filter((line) => line.trim().length > 0);
  const rows: ParsedIngCsvRow[] = [];
  let expenseRows = 0;
  let incomeRows = 0;

  for (const line of dataLines) {
    const columns = splitIngCsvLine(line);
    const transactionDate = toIsoDate(columns[0]);
    const bookingDate = toIsoDate(columns[1]);
    const counterparty = cleanCsvValue(columns[2]);
    const title = cleanCsvValue(columns[3]);
    const details = cleanCsvValue(columns[6]);
    const externalTransactionId = cleanCsvValue(columns[7]) || null;
    const accountName = cleanCsvValue(columns[14]);
    const { amount, currency } = pickAmountAndCurrency(columns);

    if (amount === null) {
      continue;
    }

    const spentAt = transactionDate ?? bookingDate;
    if (!spentAt) {
      continue;
    }

    const description = buildImportDescription(counterparty, title);

    if (isInternalTransfer(counterparty, title, details)) {
      continue;
    }

    if (amount < 0) {
      expenseRows += 1;
      const matched = matchExpenseCategory(counterparty, title, details);

      rows.push({
        kind: "expense",
        transactionDate,
        bookingDate,
        counterparty,
        title,
        details,
        accountName,
        externalTransactionId,
        amount: Math.abs(amount),
        currency,
        spentAt,
        description,
        suggestedCategory: matched.category,
        matchedRuleId: matched.matchedRuleId,
        matchedKeyword: matched.matchedKeyword,
      });
      continue;
    }

    if (isSalaryLikeIncome(counterparty, title, details)) {
      incomeRows += 1;
      rows.push({
        kind: "income",
        transactionDate,
        bookingDate,
        counterparty,
        title,
        details,
        accountName,
        externalTransactionId,
        amount,
        currency,
        spentAt,
        description,
        suggestedCategory: null,
        matchedRuleId: null,
        matchedKeyword: null,
      });
    }
  }

  return {
    totalRows: dataLines.length,
    expenseRows,
    incomeRows,
    ignoredRows: dataLines.length - expenseRows - incomeRows,
    rows,
  };
}
