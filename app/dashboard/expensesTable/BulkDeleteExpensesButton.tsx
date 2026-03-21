"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";

type BulkDeleteExpensesButtonProps = {
  expenseIds: string[];
};

export default function BulkDeleteExpensesButton({ expenseIds }: BulkDeleteExpensesButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch("/api/expenses/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: expenseIds }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error ?? "Failed to delete selected expenses.");
        return;
      }

      toast.success(`Deleted ${payload?.deletedCount ?? 0} expenses.`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Network error while deleting selected expenses.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ConfirmDeleteDialog
      title="Delete selected expenses"
      description={`This action will permanently remove ${expenseIds.length} selected expense records.`}
      isLoading={isDeleting}
      triggerAriaLabel="Delete selected expenses"
      triggerTitle="Delete selected expenses"
      triggerLabel={`Delete selected (${expenseIds.length})`}
      onConfirm={onDelete}
    />
  );
}
