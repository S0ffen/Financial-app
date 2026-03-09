"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const categories = ["Food", "Recurring", "Investment", "Occasional", "Entertainment"] as const;
type Category = (typeof categories)[number];

function parseCategory(value: string | null): Category | null {
  if (!value) {
    return null;
  }

  // Normalize from query param and accept only known categories.
  const normalized = value.toLowerCase();
  const matched = categories.find((category) => category.toLowerCase() === normalized);
  return matched ?? null;
}

export default function CategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategory = parseCategory(searchParams.get("category"));

  const onCategoryClick = (category: Category | null) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    // "All" means no category filter in URL.
    if (category === null) {
      nextParams.delete("category");
    } else {
      nextParams.set("category", category);
    }

    router.push(`${pathname}?${nextParams.toString()}`);
  };

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-400">
        Category Filter
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Button
          type="button"
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => onCategoryClick(null)}
          className={
            selectedCategory === null
              ? "h-9 bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
              : "h-9 border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50"
          }
        >
          All
        </Button>

        {categories.map((category) => {
          const isActive = selectedCategory === category;

          return (
            <Button
              key={category}
              type="button"
              variant={isActive ? "default" : "outline"}
              onClick={() => onCategoryClick(category)}
              className={
                isActive
                  ? "h-9 bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                  : "h-9 border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50"
              }
            >
              {category}
            </Button>
          );
        })}
      </div>
    </section>
  );
}
