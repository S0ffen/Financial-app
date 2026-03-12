"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type ExpenseBarItem = {
  category: string;
  amount: number;
};

type ExpensesBarChartProps = {
  data: ExpenseBarItem[];
};

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

type BarLabelProps = {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  value?: number | string;
  index?: number | string;
};

export default function ExpensesBarChart({ data }: ExpensesBarChartProps) {
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

  // Empty-state card keeps the layout stable before user adds first expense.
  if (!data.length) {
    return (
      <Card className="border-zinc-800 bg-zinc-950/60 text-zinc-100">
        <CardHeader>
          <CardTitle className="text-zinc-100">Wydatki wedlug kategorii</CardTitle>
          <CardDescription className="text-zinc-400">
            Dodaj pierwszy wydatek, aby zobaczyc wykres.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Sort categories by amount so bars are easier to compare.
  const chartData = [...data].sort((a, b) => b.amount - a.amount);
  const totalAmount = chartData.reduce((sum, entry) => sum + entry.amount, 0);
  const chartDataWithShare = chartData.map((entry) => ({
    ...entry,
    share: totalAmount > 0 ? entry.amount / totalAmount : 0,
  }));

  const renderBarLabel = ({ x = 0, y = 0, width = 0, value = 0, index = 0 }: BarLabelProps) => {
    const safeX = typeof x === "number" ? x : Number(x);
    const safeY = typeof y === "number" ? y : Number(y);
    const safeWidth = typeof width === "number" ? width : Number(width);
    const safeIndex = typeof index === "number" ? index : Number(index);

    const amount = typeof value === "number" ? value : Number(value);
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    const share = chartDataWithShare[safeIndex]?.share ?? 0;
    const percentValue = Math.round(share * 100);

    return (
      <text
        x={safeX + safeWidth / 2}
        y={safeY - 10}
        fill="#f4f4f5"
        fontSize={12}
        fontWeight={500}
        textAnchor="middle"
      >
        {`${safeAmount.toFixed(2)} (${percentValue}%)`}
      </text>
    );
  };

  return (
    <Card className="flex flex-col border-zinc-800 bg-zinc-950/60 text-zinc-100">
      <CardHeader className="pb-0">
        <CardTitle className="text-zinc-100">Wydatki wedlug kategorii</CardTitle>
        <CardDescription className="text-zinc-400">Podsumowanie Twoich wydatkow</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-[360px] w-full [&_.recharts-text]:fill-zinc-100"
        >
          <BarChart data={chartDataWithShare} margin={{ top: 28, right: 14, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#71717a", fontSize: 11 }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  nameKey="category"
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
            <Bar
              dataKey="amount"
              radius={[8, 8, 0, 0]}
              maxBarSize={56}
            >
              <LabelList dataKey="amount" content={renderBarLabel} />
              {chartDataWithShare.map((entry, index) => (
                <Cell
                  key={`${entry.category}-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
