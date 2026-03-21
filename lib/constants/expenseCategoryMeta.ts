import type { LucideIcon } from "lucide-react";
import {
  Beef,
  CarFront,
  CircleHelp,
  Clapperboard,
  HeartPulse,
  Landmark,
  Repeat,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import type { ExpenseCategory } from "./ExpenseCategories";

type ExpenseCategoryMeta = {
  icon: LucideIcon;
  accentClass: string;
  iconWrapperClass: string;
};

// Central category metadata used by charts, filters and lists.
export const expenseCategoryMeta: Record<ExpenseCategory, ExpenseCategoryMeta> = {
  Food: {
    icon: Beef,
    accentClass: "bg-orange-400",
    iconWrapperClass: "bg-orange-500/20 text-orange-300",
  },
  Shopping: {
    icon: ShoppingBag,
    accentClass: "bg-fuchsia-400",
    iconWrapperClass: "bg-fuchsia-500/20 text-fuchsia-300",
  },
  Recurring: {
    icon: Repeat,
    accentClass: "bg-sky-400",
    iconWrapperClass: "bg-sky-500/20 text-sky-300",
  },
  Health: {
    icon: HeartPulse,
    accentClass: "bg-rose-400",
    iconWrapperClass: "bg-rose-500/20 text-rose-300",
  },
  Transport: {
    icon: CarFront,
    accentClass: "bg-indigo-400",
    iconWrapperClass: "bg-indigo-500/20 text-indigo-300",
  },
  Entertainment: {
    icon: Clapperboard,
    accentClass: "bg-emerald-400",
    iconWrapperClass: "bg-emerald-500/20 text-emerald-300",
  },
  Investment: {
    icon: Landmark,
    accentClass: "bg-cyan-300",
    iconWrapperClass: "bg-cyan-500/20 text-cyan-200",
  },
  Occasional: {
    icon: Sparkles,
    accentClass: "bg-amber-300",
    iconWrapperClass: "bg-amber-500/20 text-amber-200",
  },
  Uncategorized: {
    icon: CircleHelp,
    accentClass: "bg-zinc-500",
    iconWrapperClass: "bg-zinc-700 text-zinc-200",
  },
};

export function getExpenseCategoryMeta(category: string): ExpenseCategoryMeta {
  return (
    expenseCategoryMeta[category as ExpenseCategory] ?? {
      icon: CircleHelp,
      accentClass: "bg-zinc-500",
      iconWrapperClass: "bg-zinc-700 text-zinc-200",
    }
  );
}