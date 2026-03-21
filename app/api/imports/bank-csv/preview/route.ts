import { NextResponse } from "next/server";
import { prisma } from "@/app/src/lib/prisma";
import { getServerSession } from "@/app/src/lib/session";
import { buildBankImportHash, decodeIngCsvBuffer, parseIngBankCsv, type ParsedIngCsvRow } from "@/lib/import/bankCsv/ing";

type PreviewRow = ParsedIngCsvRow & {
  previewId: string;
  importSource: "ing_csv";
  importHash: string;
  duplicate: boolean;
  validationStatus: "ready" | "needs_review" | "duplicate";
  validationMessage: string | null;
};

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
    const [existingExpenses, existingIncome] = await Promise.all([
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
    ]);

    const existingHashSet = new Set(
      [...existingExpenses, ...existingIncome].map((record) => record.importHash).filter(Boolean),
    );

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
