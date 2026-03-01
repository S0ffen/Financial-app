"use client";

import React from "react";
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

const categories = ["Food", "Recurring", "Occasional", "Entertainment"] as const;
const currencies = ["PLN", "USD", "EUR"] as const;

export const AddExpenseDialog: React.FC = () => {
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const category = formData.get("category");
    const amount = Number(formData.get("amount"));
    const currency = formData.get("currency");
    const description = formData.get("description");

    console.log("Submitting:", { category, amount, currency, description });

    const resp = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, amount, currency, description }),
    });
    const data = await resp.json();
    console.log(data);
  };

  return (
    <Dialog>
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
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" defaultValue="" />
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
              <div className="flex gap-2 mb-2">
                <Input id="amount" name="amount" defaultValue="0" type="number" />
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
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="submit">Save changes</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
