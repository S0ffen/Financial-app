"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { expenseCategories, type ExpenseCategory, parseExpenseCategory } from "@/lib/constants/ExpenseCategories";

type PreviewRow = {
  previewId: string;
  importSource: "ing_csv";
  importHash: string;
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
  duplicate: boolean;
  validationStatus: "ready" | "needs_review" | "duplicate";
  validationMessage: string | null;
  include: boolean;
};

type PreviewResponse = {
  fileName: string;
  summary: {
    totalRows: number;
    expenseRows: number;
    incomeRows: number;
    ignoredRows: number;
    duplicateRows: number;
    uncategorizedRows: number;
    readyRows: number;
  };
  rows: Array<Omit<PreviewRow, "include">>;
};

function resolvePreviewStatus(row: PreviewRow): Pick<PreviewRow, "validationStatus" | "validationMessage" | "include"> {
  if (row.duplicate) {
    return {
      validationStatus: "duplicate",
      validationMessage: "This transaction was already imported.",
      include: false,
    };
  }

  if (row.kind === "expense" && row.suggestedCategory === "Uncategorized") {
    return {
      validationStatus: "needs_review",
      validationMessage: "Category could not be matched automatically.",
      include: false,
    };
  }


  return {
    validationStatus: "ready",
    validationMessage: null,
    include: true,
  };
}

export default function ExpenseCsvImportClient() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isCommitLoading, setIsCommitLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [serverSummary, setServerSummary] = useState<PreviewResponse["summary"] | null>(null);
  const [rows, setRows] = useState<PreviewRow[]>([]);

  const derivedSummary = useMemo(() => {
    return {
      selectedRows: rows.filter((row) => row.include).length,
      selectedExpenseRows: rows.filter((row) => row.include && row.kind === "expense").length,
      selectedIncomeRows: rows.filter((row) => row.include && row.kind === "income").length,
      reviewRows: rows.filter((row) => row.validationStatus === "needs_review").length,
      selectedExpenseAmount: rows
        .filter((row) => row.include && row.kind === "expense")
        .reduce((sum, row) => sum + row.amount, 0),
      selectedIncomeAmount: rows
        .filter((row) => row.include && row.kind === "income")
        .reduce((sum, row) => sum + row.amount, 0),
    };
  }, [rows]);

  const reviewRows = useMemo(() => rows.filter((row) => row.validationStatus === "needs_review"), [rows]);

  // Usuwamy wiersz z lokalnego preview, zeby nie byl juz widoczny ani wyslany do importu.
  const dropRow = (previewId: string) => {
    setRows((currentRows) => currentRows.filter((row) => row.previewId !== previewId));
  };

  const updateRow = (previewId: string, patch: Partial<PreviewRow>) => {
    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.previewId !== previewId) {
          return row;
        }

        const updatedRow = { ...row, ...patch };
        const nextStatus = resolvePreviewStatus(updatedRow);

        return {
          ...updatedRow,
          validationStatus: nextStatus.validationStatus,
          validationMessage: nextStatus.validationMessage,
          include: nextStatus.validationStatus === "ready" ? true : updatedRow.include && nextStatus.validationStatus !== "needs_review",
        };
      }),
    );
  };

  const handlePreview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      toast.error("Choose a CSV file first.");
      return;
    }

    setIsPreviewLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/imports/bank-csv/preview", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => null)) as PreviewResponse | { error?: string } | null;

      if (!response.ok || !payload || !("rows" in payload)) {
        toast.error(payload && "error" in payload ? payload.error ?? "Failed to preview CSV." : "Failed to preview CSV.");
        return;
      }

      setFileName(payload.fileName);
      setServerSummary(payload.summary);
      setRows(
        payload.rows.map((row) => {
          const nextStatus = resolvePreviewStatus({ ...row, include: false });
          return {
            ...row,
            include: nextStatus.include,
            validationStatus: nextStatus.validationStatus,
            validationMessage: nextStatus.validationMessage,
          };
        }),
      );
      toast.success("CSV preview generated.");
    } catch (error) {
      console.error(error);
      toast.error("Network error while generating preview.");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleCommit = async () => {
    const selectedRows = rows.filter((row) => row.include);

    if (selectedRows.length === 0) {
      toast.error("Select at least one row to import.");
      return;
    }

    setIsCommitLoading(true);

    try {
      const response = await fetch("/api/imports/bank-csv/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            importedExpenseCount?: number;
            importedIncomeCount?: number;
            duplicateCount?: number;
            selectedCount?: number;
            error?: string;
          }
        | null;

      if (!response.ok) {
        toast.error(payload?.error ?? "Failed to import CSV.");
        return;
      }

      toast.success(
        `Imported ${payload?.importedExpenseCount ?? 0} expenses and ${payload?.importedIncomeCount ?? 0} income rows. Skipped ${payload?.duplicateCount ?? 0} duplicates.`,
      );
      router.push("/dashboard/expensesTable");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Network error while importing transactions.");
    } finally {
      setIsCommitLoading(false);
    }
  };

  const resetPreview = () => {
    setFileName(null);
    setServerSummary(null);
    setRows([]);
    setSelectedFile(null);
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Import bank CSV</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Upload an ING CSV file, fix only the rows that need review, then import all ready transactions.
          </p>
        </div>
        <Link
          href="/dashboard/expensesTable"
          className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-800"
        >
          Back to expenses
        </Link>
      </div>

      <Card className="border-zinc-800 bg-zinc-950/70 text-zinc-100">
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
          <CardDescription className="text-zinc-400">
            Supported format: ING export with transactions in semicolon-separated CSV.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePreview} className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-zinc-100" htmlFor="csv-file">
                CSV file
              </label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                className="border-zinc-700 bg-zinc-900/60 text-zinc-100 file:mr-4 file:border-0 file:bg-transparent file:text-zinc-300"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isPreviewLoading} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                {isPreviewLoading ? "Generating preview..." : "Generate preview"}
              </Button>
              {rows.length > 0 ? (
                <Button type="button" variant="outline" onClick={resetPreview} className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50">
                  Reset
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      {serverSummary ? (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          <SummaryCard label="File rows" value={String(serverSummary.totalRows)} />
          <SummaryCard label="Expenses" value={String(serverSummary.expenseRows)} />
          <SummaryCard label="Income" value={String(serverSummary.incomeRows)} />
          <SummaryCard label="Ignored" value={String(serverSummary.ignoredRows)} />
          <SummaryCard label="Duplicates" value={String(serverSummary.duplicateRows)} />
          <SummaryCard label="Needs review" value={String(derivedSummary.reviewRows)} />
          <SummaryCard
            label="Selected total"
            value={`${derivedSummary.selectedExpenseAmount.toFixed(2)} out / ${derivedSummary.selectedIncomeAmount.toFixed(2)} in`}
          />
          <SummaryCard label="Preview rows left" value={String(rows.length)} />
        </section>
      ) : null}

      {rows.length > 0 ? (
        <Card className="border-zinc-800 bg-zinc-950/70 text-zinc-100">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Preview{fileName ? `: ${fileName}` : ""}</CardTitle>
              <CardDescription className="text-zinc-400">
                Only rows that still need review are shown below. Ready rows are already selected for import.
              </CardDescription>
            </div>
            <Button onClick={handleCommit} disabled={isCommitLoading} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
              {isCommitLoading ? "Importing..." : `Import selected (${derivedSummary.selectedRows})`}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviewRows.length === 0 ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-200">
                No rows require manual review. You can import the ready transactions now.
              </div>
            ) : null}

            {reviewRows.map((row) => {
              const statusClass =
                row.kind === "income" ? "border-sky-500/20 bg-sky-500/5" : "border-amber-500/40 bg-amber-500/5";

              return (
                <article key={row.previewId} className={`rounded-xl border p-4 ${statusClass}`}>
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => dropRow(row.previewId)}
                          className="h-8 border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Drop row
                        </Button>
                        <label className="inline-flex items-center gap-2 text-sm font-medium text-zinc-100">
                          <input
                            type="checkbox"
                            checked={row.include}
                            onChange={(event) => updateRow(row.previewId, { include: event.target.checked })}
                            className="h-4 w-4 rounded border-zinc-600 bg-zinc-900"
                          />
                          Include row after fix
                        </label>
                        <StatusBadge label={row.kind === "income" ? "Income" : "Expense"} tone={row.kind === "income" ? "sky" : "amber"} />
                        <StatusBadge label="Needs review" tone="amber" />
                        {row.kind === "expense" && row.matchedKeyword ? <StatusBadge label={`Rule: ${row.matchedKeyword}`} tone="sky" /> : null}
                      </div>

                      <div>
                        <p className="truncate text-base font-semibold text-zinc-100">{row.counterparty}</p>
                        <p className="truncate text-sm text-zinc-400">{row.title || "No title"}</p>
                      </div>

                      <div className={`grid gap-3 ${row.kind === "income" ? "md:grid-cols-2 xl:grid-cols-[180px_170px_170px_minmax(0,1fr)]" : "md:grid-cols-2 xl:grid-cols-[180px_170px_minmax(0,1fr)]"}`}>
                        <div className="space-y-1">
                          <label className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                            {row.kind === "expense" ? "Category" : "Type"}
                          </label>
                          {row.kind === "expense" ? (
                            <select
                              value={row.suggestedCategory ?? "Uncategorized"}
                              onChange={(event) => {
                                const nextCategory = parseExpenseCategory(event.target.value);
                                if (nextCategory) {
                                  updateRow(row.previewId, { suggestedCategory: nextCategory });
                                }
                              }}
                              className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
                            >
                              {expenseCategories.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="flex h-10 items-center rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-sky-200">
                              Income
                            </div>
                          )}
                        </div>

                                                <div className="space-y-1">
                          <label className="text-xs font-medium uppercase tracking-wide text-zinc-400">Date</label>
                          <Input
                            type="date"
                            value={row.spentAt}
                            onChange={(event) => updateRow(row.previewId, { spentAt: event.target.value })}
                            className="border-zinc-700 bg-zinc-900/60 text-zinc-100"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium uppercase tracking-wide text-zinc-400">Description</label>
                          <Input
                            value={row.description}
                            onChange={(event) => updateRow(row.previewId, { description: event.target.value })}
                            className="border-zinc-700 bg-zinc-900/60 text-zinc-100"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right xl:min-w-40">
                      <p className={row.kind === "income" ? "text-lg font-semibold text-sky-300" : "text-lg font-semibold text-zinc-100"}>
                        {row.amount.toFixed(2)} {row.currency}
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">{row.accountName}</p>
                      {row.validationMessage ? <p className="mt-2 text-xs text-zinc-400">{row.validationMessage}</p> : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
};

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

type StatusBadgeProps = {
  label: string;
  tone: "amber" | "sky";
};

function StatusBadge({ label, tone }: StatusBadgeProps) {
  const toneClass =
    tone === "amber"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
      : "border-sky-500/30 bg-sky-500/10 text-sky-200";

  return <span className={`rounded-full border px-2 py-1 text-xs font-medium ${toneClass}`}>{label}</span>;
}
