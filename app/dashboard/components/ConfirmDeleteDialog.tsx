"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ConfirmDeleteDialogProps = {
  title: string;
  description: string;
  isLoading: boolean;
  triggerAriaLabel: string;
  triggerTitle: string;
  triggerLabel?: string;
  onConfirm: () => void;
};

export default function ConfirmDeleteDialog({
  title,
  description,
  isLoading,
  triggerAriaLabel,
  triggerTitle,
  triggerLabel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {triggerLabel ? (
          <button
            type="button"
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center rounded-md border border-red-500/30 bg-red-500/10 px-4 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={triggerAriaLabel}
            title={triggerTitle}
          >
            {triggerLabel}
          </button>
        ) : (
          <button
            type="button"
            disabled={isLoading}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-300 transition-colors hover:bg-red-500/20 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={triggerAriaLabel}
            title={triggerTitle}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-zinc-400">{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50"
            >
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              type="button"
              variant="destructive"
              disabled={isLoading}
              onClick={onConfirm}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
