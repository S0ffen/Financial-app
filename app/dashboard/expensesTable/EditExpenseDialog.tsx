"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { expenseCategories } from "@/lib/constants/ExpenseCategories";

type EditExpenseDialogProps = {
  expenseId: string;
  category: string;
  amount: number;
  currency: string;
  description: string | null;
  spentAt: string | null;
};

const currencies = ["PLN", "USD", "EUR"] as const;

export default function EditExpenseDialog({
  expenseId,
  category,
  amount,
  currency,
  description,
  spentAt,
}: EditExpenseDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categoryValue, setCategoryValue] = useState(category);
  const [amountValue, setAmountValue] = useState(amount.toFixed(2));
  const [currencyValue, setCurrencyValue] = useState(currency);
  const [descriptionValue, setDescriptionValue] = useState(description ?? "");
  const [dateValue, setDateValue] = useState(spentAt ?? new Date().toISOString().slice(0, 10));

  // Przy zamknieciu przywracamy dane z rekordu, zeby dialog nie trzymal starych zmian lokalnych.
  const resetFormValues = () => {
    setCategoryValue(category);
    setAmountValue(amount.toFixed(2));
    setCurrencyValue(currency);
    setDescriptionValue(description ?? "");
    setDateValue(spentAt ?? new Date().toISOString().slice(0, 10));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetFormValues();
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: categoryValue,
          amount: Number(amountValue),
          currency: currencyValue,
          description: descriptionValue,
          date: dateValue,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error ?? "Failed to update expense.");
        return;
      }

      toast.success("Expense updated.");
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Network error while updating expense.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
          aria-label="Edit expense"
          title="Edit expense"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </DialogTrigger>

      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit expense</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Update the selected expense record.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`expense-date-${expenseId}`} className="text-zinc-100">
              Date
            </Label>
            <Input
              id={`expense-date-${expenseId}`}
              type="date"
              value={dateValue}
              onChange={(event) => setDateValue(event.target.value)}
              className="border-zinc-700 bg-zinc-900/60 text-zinc-100"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`expense-category-${expenseId}`} className="text-zinc-100">
              Category
            </Label>
            <select
              id={`expense-category-${expenseId}`}
              value={categoryValue}
              onChange={(event) => setCategoryValue(event.target.value)}
              className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
            >
              {expenseCategories.map((expenseCategory) => (
                <option key={expenseCategory} value={expenseCategory}>
                  {expenseCategory}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_110px]">
            <div className="space-y-2">
              <Label htmlFor={`expense-amount-${expenseId}`} className="text-zinc-100">
                Amount
              </Label>
              <Input
                id={`expense-amount-${expenseId}`}
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={amountValue}
                onChange={(event) => setAmountValue(event.target.value)}
                className="border-zinc-700 bg-zinc-900/60 text-zinc-100"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`expense-currency-${expenseId}`} className="text-zinc-100">
                Currency
              </Label>
              <select
                id={`expense-currency-${expenseId}`}
                value={currencyValue}
                onChange={(event) => setCurrencyValue(event.target.value)}
                className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
              >
                {currencies.map((supportedCurrency) => (
                  <option key={supportedCurrency} value={supportedCurrency}>
                    {supportedCurrency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`expense-description-${expenseId}`} className="text-zinc-100">
              Description
            </Label>
            <Textarea
              id={`expense-description-${expenseId}`}
              maxLength={300}
              value={descriptionValue}
              onChange={(event) => setDescriptionValue(event.target.value)}
              placeholder="Add an optional note for this expense"
              className="min-h-24 border-zinc-700 bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
