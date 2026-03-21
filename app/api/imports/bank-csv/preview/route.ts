import { NextResponse } from "next/server";
import { prisma } from "@/app/src/lib/prisma";
import { getServerSession } from "@/app/src/lib/session";
import { buildBankImportHash, decodeIngCsvBuffer, normalizeImportText, parseIngBankCsv, type ParsedIngCsvRow } from "@/lib/import/bankCsv/ing";

type PreviewRow = ParsedIngCsvRow & {
  previewId: string;
  importSource: "ing_csv";
  importHash: string;
  duplicate: boolean;
  validationStatus: "ready" | "needs_review" | "duplicate";
  validationMessage: string | null;
};

type HistoricalCategoryMatch = {
  category: string;
  sourceDescription: string;
};

function buildCategoryLookupKeys(value: string): string[] {
  const keys = new Set<string>();
  const normalizedValue = normalizeImportText(value);

  if (normalizedValue) {
    keys.add(normalizedValue);
  }

  const primaryPart = value.split(" - ")[0]?.trim();
  if (primaryPart && primaryPart !== value) {
    const normalizedPrimaryPart = normalizeImportText(primaryPart);
    if (normalizedPrimaryPart) {
      keys.add(normalizedPrimaryPart);
    }
  }

  return [...keys];
}

// Budujemy lookup z poprzednich wydatkow usera, zeby preview korzystal z jego wczesniejszych recznych kategoryzacji.
function buildHistoricalCategoryLookup(
  expenses: Array<{ category: string; description: string | null }>,
): Map<string, HistoricalCategoryMatch> {
  const lookup = new Map<string, HistoricalCategoryMatch>();

  for (const expense of expenses) {
    if (!expense.description) {
      continue;
    }

    for (const key of buildCategoryLookupKeys(expense.description)) {
      if (!lookup.has(key)) {
        lookup.set(key, {
          category: expense.category,
          sourceDescription: expense.description,
        });
      }
    }
  }

  return lookup;
}

function findHistoricalCategory(
  row: Pick<ParsedIngCsvRow, "description" | "counterparty" | "title">,
  lookup: Map<string, HistoricalCategoryMatch>,
): HistoricalCategoryMatch | null {
  const candidateKeys = new Set<string>([
    ...buildCategoryLookupKeys(row.description),
    ...buildCategoryLookupKeys(row.counterparty),
    ...buildCategoryLookupKeys(`${row.counterparty} - ${row.title}`),
  ]);

  for (const key of candidateKeys) {
    const match = lookup.get(key);
    if (match) {
      return match;
    }
  }

  return null;
}

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
  }

  try {
    const csvBuffer = await file.arrayBuffer();
    const csvText = decodeIngCsvBuffer(csvBuffer);
    const parsed = parseIngBankCsv(csvText);

    const previewRowsBase = parsed.rows.map((row, index) => {
      const importHash = buildBankImportHash(session.user.id, row);

      return {
        ...row,
        previewId: `${importHash}:${index}`,
        importSource: "ing_csv" as const,
        importHash,
      };
    });

    const uniqueHashes = [...new Set(previewRowsBase.map((row) => row.importHash))];
    const [existingExpenses, existingIncome, previousCategorizedExpenses] = await Promise.all([
      uniqueHashes.length
        ? prisma.expense.findMany({
            where: { importHash: { in: uniqueHashes } },
            select: { importHash: true },
          })
        : Promise.resolve([]),
      uniqueHashes.length
        ? prisma.salaryRecord.findMany({
            where: { importHash: { in: uniqueHashes } },
            select: { importHash: true },
          })
        : Promise.resolve([]),
      prisma.expense.findMany({
        where: {
          userId: session.user.id,
          category: { not: "Uncategorized" },
        },
        orderBy: { spentAt: "desc" },
        take: 2000,
        select: {
          category: true,
          description: true,
        },
      }),
    ]);

    const existingHashSet = new Set(
      [...existingExpenses, ...existingIncome].map((record) => record.importHash).filter(Boolean),
    );
    const historicalCategoryLookup = buildHistoricalCategoryLookup(previousCategorizedExpenses);

    // Preview pokazuje duplikaty i wiersze wymagajace review jeszcze przed zapisem do bazy.
    const previewRows: PreviewRow[] = previewRowsBase.map((row) => {
      if (existingHashSet.has(row.importHash)) {
        return {
          ...row,
          duplicate: true,
          validationStatus: "duplicate",
          validationMessage: "This transaction was already imported.",
        };
      }

      if (row.kind === "expense" && row.suggestedCategory === "Uncategorized") {
        const historicalMatch = findHistoricalCategory(row, historicalCategoryLookup);

        if (historicalMatch) {
          return {
            ...row,
            suggestedCategory: historicalMatch.category as PreviewRow["suggestedCategory"],
            duplicate: false,
            validationStatus: "ready",
            validationMessage: `Matched from your previous category: ${historicalMatch.sourceDescription}`,
          };
        }

        return {
          ...row,
          duplicate: false,
          validationStatus: "needs_review",
          validationMessage: "Category could not be matched automatically.",
        };
      }

      return {
        ...row,
        duplicate: false,
        validationStatus: "ready",
        validationMessage: null,
      };
    });

    const summary = {
      totalRows: parsed.totalRows,
      expenseRows: parsed.expenseRows,
      incomeRows: parsed.incomeRows,
      ignoredRows: parsed.ignoredRows,
      duplicateRows: previewRows.filter((row) => row.duplicate).length,
      uncategorizedRows: previewRows.filter(
        (row) => row.kind === "expense" && row.suggestedCategory === "Uncategorized",
      ).length,
      readyRows: previewRows.filter((row) => row.validationStatus === "ready").length,
    };

    return NextResponse.json({
      fileName: file.name,
      summary,
      rows: previewRows,
    });
  } catch (error) {
    console.error("Error building CSV preview:", error);
    const message = error instanceof Error ? error.message : "Failed to parse CSV file";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
