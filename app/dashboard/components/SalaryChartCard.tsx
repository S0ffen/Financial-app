import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SalaryChartCard() {
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
          <Button
            type="button"
            variant="outline"
            className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50"
          >
            Add new
          </Button>
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
