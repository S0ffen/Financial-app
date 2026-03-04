"use client";

import { LabelList, Pie, PieChart, Cell } from "recharts";
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

export default function ExpensesPieChart({ data }: ExpensesPieChartProps) {
  const chartConfig = {
    amount: {
      label: "Amount",
    },
  } satisfies ChartConfig;

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wydatki wedlug kategorii</CardTitle>
          <CardDescription>Dodaj pierwszy wydatek, aby zobaczyc wykres.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Wydatki wedlug kategorii</CardTitle>
        <CardDescription>Podsumowanie Twoich wydatkow</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="category" />} />
            <Pie data={data} dataKey="amount" nameKey="category" outerRadius={90} labelLine={false}>
              {data.map((entry, index) => (
                <Cell
                  key={`${entry.category}-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
              <LabelList
                dataKey="category"
                className="fill-background"
                stroke="none"
                fontSize={12}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
