"use client";

import { Pie, PieChart, Cell } from "recharts";
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

type PieExpense = {
  category: string;
  amount: number;
};

type ExpensesPieChartProps = {
  data: PieExpense[];
};

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

// Recharts returns label angles in degrees; Math trig uses radians.
const RADIAN = Math.PI / 180;

type PieLabelProps = {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  percent?: number;
  value?: number | string;
  name?: string;
};

export default function ExpensesPieChart({ data }: ExpensesPieChartProps) {
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

  const renderPieLabel = ({
    cx = 0,
    cy = 0,
    midAngle = 0,
    outerRadius = 0,
    percent = 0,
    value = 0,
    name = "",
  }: PieLabelProps) => {
    // Move labels outside the slice and align text by chart side.
    const radius = outerRadius + 24;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const textAnchor = x > cx ? "start" : "end";

    const amount = typeof value === "number" ? value : Number(value);
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    // "percent" from Recharts is a ratio (0..1), convert it to XX%.
    const percentValue = `${Math.round(percent * 100)}%`;

    return (
      <text
        x={x}
        y={y}
        fill="#f4f4f5"
        fontSize={13}
        fontWeight={500}
        textAnchor={textAnchor}
        dominantBaseline="central"
      >
        {`${name} ${safeAmount.toFixed(2)} (${percentValue})`}
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
          className="mx-auto aspect-square max-h-[360px] w-full [&_.recharts-text]:fill-zinc-100"
        >
          <PieChart margin={{ top: 18, right: 52, left: 52, bottom: 18 }}>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="category"
                  className="border-zinc-700 bg-zinc-900 text-zinc-100"
                />
              }
            />
            <Pie
              data={data}
              // "amount" defines slice size, "category" is used for labels/tooltip name.
              dataKey="amount"
              nameKey="category"
              outerRadius={95}
              labelLine={{ stroke: "#a1a1aa", strokeWidth: 1 }}
              label={renderPieLabel}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`${entry.category}-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
