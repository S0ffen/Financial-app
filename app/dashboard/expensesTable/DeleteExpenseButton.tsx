"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

type DeleteExpenseButtonProps = {
  expenseId: string;
};

export default function DeleteExpenseButton({ expenseId }: DeleteExpenseButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    const confirmed = window.confirm("Usunac ten wpis?");
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: "DELETE",
      });

      console.log("Delete response:", expenseId, response);

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        alert(payload?.error ?? "Nie udalo sie usunac wpisu.");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Blad sieci podczas usuwania wpisu.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={isDeleting}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-300 transition-colors hover:bg-red-500/20 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="Delete expense"
      title="Delete expense"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
