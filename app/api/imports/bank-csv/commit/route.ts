import { NextResponse } from "next/server";
import { prisma } from "@/app/src/lib/prisma";
import { getServerSession } from "@/app/src/lib/session";
import { parseExpenseCategory } from "@/lib/constants/ExpenseCategories";
import { buildBankImportHash, type ParsedIngCsvRow } from "@/lib/import/bankCsv/ing";

type CommitRowInput = ParsedIngCsvRow & {
  previewId: string;
  importSource: "ing_csv";
  importHash: string;
  include: boolean;
};

type CommitRequestBody = {
  rows?: CommitRowInput[];
};

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as CommitRequestBody | null;
  const submittedRows = Array.isArray(body?.rows) ? body.rows : [];
  const includedRows = submittedRows.filter((row) => row.include);

  if (includedRows.length === 0) {
    return NextResponse.json({ error: "Select at least one row to import." }, { status: 400 });
  }

  let normalizedRows:
    | Array<
        | {
            kind: "expense";
            category: string;
            amount: number;
            currency: string;
            description: string;
            occurredAt: Date;
            importHash: string;
            importSource: "ing_csv";
            externalTransactionId: string | null;
          }
        | {
            kind: "income";
            salary: number;
            currency: string;
            description: string;
            occurredAt: Date;
            importHash: string;
            importSource: "ing_csv";
            externalTransactionId: string | null;
          }
      >;

  try {
    // Normalizujemy i walidujemy payload przed jakimkolwiek zapisem do bazy.
    normalizedRows = includedRows.map((row) => {
      const amount = Number(row.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error(`Invalid amount for row ${row.previewId}`);
      }

      const occurredAt = new Date(row.spentAt);
      if (Number.isNaN(occurredAt.getTime())) {
        throw new Error(`Invalid date for row ${row.previewId}`);
      }

      const description = typeof row.description === "string" ? row.description.trim() : "";
      if (description.length > 300) {
        throw new Error(`Description is too long for row ${row.previewId}`);
      }

      const importHash = buildBankImportHash(session.user.id, row);

      if (row.kind === "expense") {
        const category = parseExpenseCategory(row.suggestedCategory);
        if (!category) {
          throw new Error(`Invalid category for row ${row.previewId}`);
        }

        return {
          kind: "expense" as const,
          category,
          amount,
          currency: row.currency,
          description: description || row.counterparty.trim(),
          occurredAt,
          importHash,
          importSource: "ing_csv" as const,
          externalTransactionId: row.externalTransactionId,
        };
      }

      return {
        kind: "income" as const,
        salary: amount,
        currency: row.currency,
        description: description || row.counterparty.trim(),
        occurredAt,
        importHash,
        importSource: "ing_csv" as const,
        externalTransactionId: row.externalTransactionId,
      };
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid import payload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const hashes = normalizedRows.map((row) => row.importHash);
  const [existingExpenses, existingIncome] = await Promise.all([
    prisma.expense.findMany({
      where: { importHash: { in: hashes } },
      select: { importHash: true },
    }),
    prisma.salaryRecord.findMany({
      where: { importHash: { in: hashes } },
      select: { importHash: true },
    }),
  ]);
  const existingHashSet = new Set(
    [...existingExpenses, ...existingIncome].map((row) => row.importHash).filter(Boolean),
  );

  const rowsToCreate = normalizedRows.filter((row) => !existingHashSet.has(row.importHash));

  if (rowsToCreate.length === 0) {
    return NextResponse.json({
      importedExpenseCount: 0,
      importedIncomeCount: 0,
      duplicateCount: normalizedRows.length,
      selectedCount: normalizedRows.length,
    });
  }

  const expenseRows = rowsToCreate.filter((row) => row.kind === "expense");
  const incomeRows = rowsToCreate.filter((row) => row.kind === "income");

  try {
    const [expenseResult, incomeResult] = await Promise.all([
      expenseRows.length
        ? prisma.expense.createMany({
            data: expenseRows.map((row) => ({
              userId: session.user.id,
              category: row.category,
              amount: row.amount,
              currency: row.currency,
              description: row.description,
              spentAt: row.occurredAt,
              importHash: row.importHash,
              importSource: row.importSource,
              externalTransactionId: row.externalTransactionId,
            })),
            skipDuplicates: true,
          })
        : Promise.resolve({ count: 0 }),
      incomeRows.length
        ? prisma.salaryRecord.createMany({
            data: incomeRows.map((row) => ({
              userId: session.user.id,
              salary: row.salary,
              description: row.description,
              period: row.occurredAt,
              importHash: row.importHash,
              importSource: row.importSource,
              externalTransactionId: row.externalTransactionId,
            })),
            skipDuplicates: true,
          })
        : Promise.resolve({ count: 0 }),
    ]);

    const importedCount = expenseResult.count + incomeResult.count;

    return NextResponse.json({
      importedExpenseCount: expenseResult.count,
      importedIncomeCount: incomeResult.count,
      duplicateCount: normalizedRows.length - importedCount,
      selectedCount: normalizedRows.length,
    });
  } catch (error) {
    console.error("Error committing CSV import:", error);
    return NextResponse.json({ error: "Database error while importing transactions." }, { status: 500 });
  }
}
