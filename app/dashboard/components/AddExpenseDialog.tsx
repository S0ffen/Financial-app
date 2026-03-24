"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { expenseCategories } from "@/lib/constants/ExpenseCategories";

const currencies = ["PLN", "USD", "EUR"] as const;

export const AddExpenseDialog: React.FC = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const category = formData.get("category");
    const amount = Number(formData.get("amount"));
    const currency = formData.get("currency");
    const description = formData.get("description");
    const date = formData.get("date");

    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, amount, currency, description, date }),
    });

    const data = await response.json();

    if (response.ok) {
      setOpen(false);
      toast.success("Expense saved.");
      router.refresh();
      return;
    }

    toast.error(data.error || "Unknown error");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="btn-dark-pill inline-flex h-9 min-w-[11rem] items-center justify-center px-4 text-sm font-medium"
        >
          Add new expense
        </button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Add new expense</DialogTitle>
            <DialogDescription className="text-zinc-400">Fill in the details for the new expense.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="date" className="text-zinc-100">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="border-zinc-700 bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-500"
              />
            </Field>
            <Field>
              <Label htmlFor="category" className="text-zinc-100">Category</Label>
              <select
                id="category"
                name="category"
                defaultValue={expenseCategories[0]}
                className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-1 text-sm text-zinc-100 shadow-xs outline-none focus-visible:border-zinc-500 focus-visible:ring-zinc-500/40 focus-visible:ring-[3px]"
              >
                {expenseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>
            <Field>
              <Label htmlFor="amount" className="text-zinc-100">Amount</Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  name="amount"
                  defaultValue="0.00"
                  type="number"
                  step={0.01}
                  min={0.01}
                  inputMode="decimal"
                  className="border-zinc-700 bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-500"
                />
                <select
                  id="currency"
                  name="currency"
                  defaultValue="PLN"
                  className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-1 text-sm text-zinc-100 shadow-xs outline-none focus-visible:border-zinc-500 focus-visible:ring-zinc-500/40 focus-visible:ring-[3px]"
                >
                  {currencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            </Field>
            <Field>
              <Label htmlFor="description" className="text-zinc-100">Description</Label>
              <Input
                id="description"
                name="description"
                defaultValue=""
                className="mb-4 border-zinc-700 bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-500"
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
