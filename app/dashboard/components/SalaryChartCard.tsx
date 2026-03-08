"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis } from "recharts";
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type SalaryChartDataPoint = {
  period: string;
  salary: number;
  minimumWage: number;
};

type SalaryChartCardProps = {
  data: SalaryChartDataPoint[];
};

export default function SalaryChartCard({ data }: SalaryChartCardProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const formatAmount = (value: number) =>
    value.toLocaleString("pl-PL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const latestRecord = data.length ? data[data.length - 1] : null;
  const chartConfig = {
    amount: {
      label: "Amount",
    },
  } satisfies ChartConfig;

  // Percent above minimum wage for the latest record in selected period.
  const percentAboveMinimum =
    latestRecord && latestRecord.minimumWage > 0
      ? ((latestRecord.salary - latestRecord.minimumWage) / latestRecord.minimumWage) * 100
      : null;

  const barChartData = latestRecord
    ? [
        {
          label: "Your salary",
          amount: latestRecord.salary,
          fill: "#7fb5ef",
        },
        {
          label: "Minimum wage",
          amount: latestRecord.minimumWage,
          fill: "#5f91c7",
        },
      ]
    : [];

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
    <Card className="rounded-2xl border-zinc-800 bg-gradient-to-b from-zinc-950 to-zinc-900/80 text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-2xl font-semibold text-zinc-100">Salary Overview</CardTitle>
            <CardDescription className="mt-1 text-zinc-400">
              Comparison of your salary against the minimum wage.
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
        {percentAboveMinimum !== null ? (
          <p className="mx-auto mt-3 w-full rounded-md border border-zinc-700 bg-zinc-900/70 px-3 py-1 text-center text-sm font-semibold text-zinc-100 sm:max-w-[60%]">
            {percentAboveMinimum >= 0 ? "+" : ""}
            {percentAboveMinimum.toFixed(1)}% vs minimum
          </p>
        ) : null}
      </CardHeader>

      <CardContent>
        <div className="flex h-[280px] items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3">
          {data.length === 0 ? (
            <p className="text-sm text-zinc-400">No salary data for selected period.</p>
          ) : (
            <ChartContainer
              config={chartConfig}
              className="h-full w-full px-1 [&_.recharts-text]:fill-zinc-200"
            >
              <BarChart
                data={barChartData}
                margin={{ top: 18, right: 10, left: 10, bottom: 8 }}
                barCategoryGap="42%"
              >
                <CartesianGrid vertical={false} stroke="rgba(113,113,122,0.22)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={8} />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      nameKey="label"
                      formatter={(value) => {
                        const numericValue = typeof value === "number" ? value : Number(value);

                        return (
                          <div className="flex min-w-[9rem] items-center justify-between gap-3">
                            <span className="text-zinc-300">Amount</span>
                            <span className="font-mono tabular-nums text-zinc-100">
                              {Number.isFinite(numericValue) ? formatAmount(numericValue) : "-"}
                            </span>
                          </div>
                        );
                      }}
                      className="border-zinc-700 bg-zinc-900 text-zinc-100 [&_*]:text-zinc-100"
                    />
                  }
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={40}>
                  {barChartData.map((entry) => (
                    <Cell key={entry.label} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="amount"
                    position="top"
                    className="fill-zinc-100"
                    formatter={(value: number) => value.toFixed(2)}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
