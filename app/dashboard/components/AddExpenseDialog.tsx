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
        <Button className="btn-dark-pill">Add new expense</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add new expense</DialogTitle>
            <DialogDescription>Fill in the details for the new expense.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </Field>
            <Field>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                defaultValue={expenseCategories[0]}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                {expenseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>
            <Field>
              <Label htmlFor="amount">Amount</Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  name="amount"
                  defaultValue="0.00"
                  type="number"
                  step={0.01}
                  min={0.01}
                  inputMode="decimal"
                />
                <select
                  id="currency"
                  name="currency"
                  defaultValue="PLN"
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
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
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" defaultValue="" className="mb-4" />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
