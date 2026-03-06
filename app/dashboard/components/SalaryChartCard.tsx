"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SalaryChartCard() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const today = new Date().toISOString().split("T")[0];

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
        alert(payload?.error ?? "Failed to save salary record.");
        return;
      }

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Network error while saving salary record.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-950/60 text-zinc-100">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-zinc-100">Salary Overview</CardTitle>
            <CardDescription className="text-zinc-400">
              Porownanie Twojej wyplaty z najnizsza krajowa.
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50"
              >
                Add new
              </Button>
            </DialogTrigger>

            <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-md">
              <form onSubmit={handleSubmit} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Add salary data</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Enter your current salary and the current minimum wage.
                  </DialogDescription>
                </DialogHeader>

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
                    Current minimum wage
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
                    defaultValue={today}
                    className="border-zinc-700 bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-500"
                    required
                  />
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSaving}
                      className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50"
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex h-[260px] items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-900/40">
          <p className="text-sm text-zinc-400">Brak danych do wykresu.</p>
        </div>
      </CardContent>
    </Card>
  );
}
