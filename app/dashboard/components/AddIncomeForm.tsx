"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AddIncomeFormProps = {
  defaultDate: string;
};

export default function AddIncomeForm({ defaultDate }: AddIncomeFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const salary = Number(formData.get("salary"));
    const minimumWage = Number(formData.get("minimumWage"));
    const period = String(formData.get("period") ?? "");

    setIsSaving(true);

    try {
      const response = await fetch("/api/salary-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salary, minimumWage, period }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error ?? "Failed to save income record.");
        return;
      }

      event.currentTarget.reset();
      toast.success("Income record saved.");
      router.refresh();
    } catch (submitError) {
      console.error(submitError);
      toast.error("Network error while saving income record.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-950/70 text-zinc-100">
      <CardHeader>
        <CardTitle className="text-zinc-100">Add income</CardTitle>
        <CardDescription className="text-zinc-400">
          Save your salary and the minimum wage for the selected month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="salary" className="text-zinc-100">
              Current salary
            </Label>
            <Input
              id="salary"
              name="salary"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              placeholder="e.g. 8500.00"
              className="border-zinc-700 bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimumWage" className="text-zinc-100">
              Minimum wage
            </Label>
            <Input
              id="minimumWage"
              name="minimumWage"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              placeholder="e.g. 4666.00"
              className="border-zinc-700 bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="period" className="text-zinc-100">
              Date
            </Label>
            <Input
              id="period"
              name="period"
              type="date"
              defaultValue={defaultDate}
              className="border-zinc-700 bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-500"
              required
            />
          </div>

          <div className="flex flex-col justify-end gap-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="h-10 bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
            >
              {isSaving ? "Saving..." : "Save income"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
