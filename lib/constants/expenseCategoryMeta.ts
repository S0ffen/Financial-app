import type { LucideIcon } from "lucide-react";
import {
  Beef,
  Clapperboard,
  Coins,
  Landmark,
  Repeat,
} from "lucide-react";
import type { ExpenseCategory } from "./ExpenseCategories";

type ExpenseCategoryMeta = {
  icon: LucideIcon;
  accentClass: string;
  iconWrapperClass: string;
};

// Central category metadata used by UI components.
export const expenseCategoryMeta: Record<ExpenseCategory, ExpenseCategoryMeta> = {
  Food: {
    icon: Beef,
    accentClass: "bg-orange-400",
    iconWrapperClass: "bg-orange-500/20 text-orange-300",
  },
  Recurring: {
    icon: Repeat,
    accentClass: "bg-sky-400",
    iconWrapperClass: "bg-sky-500/20 text-sky-300",
  },
  Investment: {
    icon: Landmark,
    accentClass: "bg-cyan-300",
    iconWrapperClass: "bg-cyan-500/20 text-cyan-200",
  },
  Occasional: {
    icon: Coins,
    accentClass: "bg-amber-300",
    iconWrapperClass: "bg-amber-500/20 text-amber-200",
  },
  Entertainment: {
    icon: Clapperboard,
    accentClass: "bg-emerald-400",
    iconWrapperClass: "bg-emerald-500/20 text-emerald-300",
  },
};

export function getExpenseCategoryMeta(category: string): ExpenseCategoryMeta {
  return (
    expenseCategoryMeta[category as ExpenseCategory] ?? {
      icon: Coins,
      accentClass: "bg-zinc-500",
      iconWrapperClass: "bg-zinc-700 text-zinc-200",
    }
  );
}
