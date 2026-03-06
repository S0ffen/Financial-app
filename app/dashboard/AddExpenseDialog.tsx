"use client";

import React from "react";
import { useState } from "react";
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
import { useRouter } from "next/navigation";

const categories = ["Food", "Recurring", "Occasional", "Entertainment"] as const;
const currencies = ["PLN", "USD", "EUR"] as const;

export const AddExpenseDialog: React.FC = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const category = formData.get("category");
    const amount = Number(formData.get("amount"));
    const currency = formData.get("currency");
    const description = formData.get("description");
    const date = formData.get("date");

    console.log("Submitting:", { category, amount, currency, description, date });

    const resp = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, amount, currency, description, date }),
    });
    const data = await resp.json();

    console.log(data);

    if (resp.ok) {
      setOpen(false);
      router.refresh(); // Odśwież stronę, aby pokazać nowy wydatek
    }
    //TODO: zmienić to potem na ładnego toast zamiast alertu
    else {
      alert(`Error: ${data.error || "Unknown error"}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-dark-pill">Test Button</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re done.
            </DialogDescription>
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
                defaultValue="Food"
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                {categories.map((category) => (
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
