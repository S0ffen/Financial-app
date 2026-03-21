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

type EditIncomeDialogProps = {
  recordId: string;
  salary: number;
  description: string | null;
  period: string;
};

export default function EditIncomeDialog({
  recordId,
  salary,
  description,
  period,
}: EditIncomeDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [salaryValue, setSalaryValue] = useState(salary.toFixed(2));
  // Trzymamy opis w osobnym stanie, zeby dialog edycji mial pelny prefill rekordu.
  const [descriptionValue, setDescriptionValue] = useState(description ?? "");
  const [periodValue, setPeriodValue] = useState(period);

  // Przy zamknieciu albo ponownym otwarciu przywracamy dane z rekordu,
  // zeby dialog zawsze startowal od aktualnych wartosci z bazy.
  const resetFormValues = () => {
    setSalaryValue(salary.toFixed(2));
    setDescriptionValue(description ?? "");
    setPeriodValue(period);
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
      const response = await fetch(`/api/salary-records/${recordId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salary: Number(salaryValue),
          description: descriptionValue,
          period: periodValue,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error ?? "Failed to update income record.");
        return;
      }

      toast.success("Income record updated.");
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Network error while updating income record.");
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
          aria-label="Edit income record"
          title="Edit income record"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </DialogTrigger>

      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit income</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Update the selected income record for this month.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`salary-${recordId}`} className="text-zinc-100">
              Income amount
            </Label>
            <Input
              id={`salary-${recordId}`}
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={salaryValue}
              onChange={(event) => setSalaryValue(event.target.value)}
              className="border-zinc-700 bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`description-${recordId}`} className="text-zinc-100">
              Description
            </Label>
            <Textarea
              id={`description-${recordId}`}
              maxLength={300}
              value={descriptionValue}
              onChange={(event) => setDescriptionValue(event.target.value)}
              placeholder="Add an optional note for this income record"
              className="min-h-24 border-zinc-700 bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`period-${recordId}`} className="text-zinc-100">
              Date
            </Label>
            <Input
              id={`period-${recordId}`}
              type="date"
              value={periodValue}
              onChange={(event) => setPeriodValue(event.target.value)}
              className="border-zinc-700 bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-500"
              required
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
