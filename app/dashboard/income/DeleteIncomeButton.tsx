"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";

type DeleteIncomeButtonProps = {
  recordId: string;
};

export default function DeleteIncomeButton({ recordId }: DeleteIncomeButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/salary-records/${recordId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        toast.error(payload?.error ?? "Failed to delete income record.");
        return;
      }

      toast.success("Income record deleted.");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Network error while deleting income record.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ConfirmDeleteDialog
      title="Delete income record"
      description="This action will permanently remove the selected income record."
      isLoading={isDeleting}
      triggerAriaLabel="Delete income record"
      triggerTitle="Delete income record"
      onConfirm={onDelete}
    />
  );
}
