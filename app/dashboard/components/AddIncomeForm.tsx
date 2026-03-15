"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type AddIncomeFormProps = {
  defaultDate: string;
  defaultMinimumWage?: string;
};

export default function AddIncomeForm({
  defaultDate,
  defaultMinimumWage = "",
}: AddIncomeFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [minimumWageValue, setMinimumWageValue] = useState(defaultMinimumWage);

  useEffect(() => {
    if (defaultMinimumWage) {
      setMinimumWageValue(defaultMinimumWage);
      return;
    }

    let isMounted = true;

    async function loadLatestMinimumWage() {
      try {
        const response = await fetch("/api/salary-records", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          salaryRecords?: Array<{ minimumWage: number }>;
        };

        const latestRecord = payload.salaryRecords?.[0];
        if (isMounted && latestRecord) {
          setMinimumWageValue(Number(latestRecord.minimumWage).toFixed(2));
        }
      } catch (error) {
        console.error("Failed to prefill minimum wage:", error);
      }
    }

    void loadLatestMinimumWage();

    return () => {
      isMounted = false;
    };
  }, [defaultMinimumWage]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const salary = Number(formData.get("salary"));
    const minimumWage = Number(formData.get("minimumWage"));
    const period = String(formData.get("period") ?? "");
    // Odczytujemy opis jako zwykly string z formularza i wysylamy go do API.
    const description = String(formData.get("description") ?? "");

    setIsSaving(true);

    try {
      const response = await fetch("/api/salary-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salary, minimumWage, period, description }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error ?? "Failed to save income record.");
        return;
      }

      form.reset();
      setMinimumWageValue(minimumWage.toFixed(2));
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
          Save your salary, description and the minimum wage for the selected month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="salary" className="text-zinc-100">
              Add income
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
              value={minimumWageValue}
              onChange={(event) => setMinimumWageValue(event.target.value)}
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

          <div className="space-y-2 md:col-span-2 xl:col-span-4">
            <Label htmlFor="description" className="text-zinc-100">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              maxLength={300}
              placeholder="Add an optional note for this income record"
              className="min-h-24 border-zinc-700 bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
