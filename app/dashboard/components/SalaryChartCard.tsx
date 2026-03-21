"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type SalaryChartComparison = {
  currentLabel: string;
  previousLabel: string;
  currentTotal: number;
  previousTotal: number;
};

type SalaryChartCardProps = {
  data: SalaryChartComparison;
};

export default function SalaryChartCard({ data }: SalaryChartCardProps) {
  const formatAmount = (value: number) =>
    value.toLocaleString("pl-PL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const chartConfig = {
    amount: {
      label: "Amount",
    },
  } satisfies ChartConfig;

  const percentChange =
    data.previousTotal > 0 ? ((data.currentTotal - data.previousTotal) / data.previousTotal) * 100 : null;

  const barChartData = [
    {
      label: data.previousLabel,
      amount: data.previousTotal,
      fill: "#5f91c7",
    },
    {
      label: data.currentLabel,
      amount: data.currentTotal,
      fill: "#7fb5ef",
    },
  ];

  return (
    <Card className="rounded-2xl border-zinc-800 bg-gradient-to-b from-zinc-950 to-zinc-900/80 text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <CardHeader className="pb-4">
        <div>
          <CardTitle className="text-2xl font-semibold text-zinc-100">Income Overview</CardTitle>
          <CardDescription className="mt-1 text-zinc-400">
            Comparison of the selected month income against the previous month.
          </CardDescription>
        </div>
        {percentChange !== null ? (
          <p className="mx-auto mt-3 w-full rounded-md border border-zinc-700 bg-zinc-900/70 px-3 py-1 text-center text-sm font-semibold text-zinc-100 sm:max-w-[60%]">
            {percentChange >= 0 ? "+" : ""}
            {percentChange.toFixed(1)}% vs previous month
          </p>
        ) : (
          <p className="mx-auto mt-3 w-full rounded-md border border-zinc-700 bg-zinc-900/70 px-3 py-1 text-center text-sm font-semibold text-zinc-100 sm:max-w-[60%]">
            No previous month data
          </p>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex h-[280px] items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3">
          {barChartData.every((entry) => entry.amount === 0) ? (
            <p className="text-sm text-zinc-400">No income data for selected period.</p>
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
