"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteQuestionBank } from "@/features/admin-question-banks/queries";
import type { QuestionBank } from "@/features/admin-question-banks/types";
import { ApiError } from "@/lib/api/api-error";

interface DeleteQuestionBankButtonProps {
  bank: QuestionBank;
}

export function DeleteQuestionBankButton({
  bank,
}: DeleteQuestionBankButtonProps) {
  const router = useRouter();
  const deleteQuestionBank = useDeleteQuestionBank();
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    try {
      await deleteQuestionBank.mutateAsync(bank.id);
      setOpen(false);
      router.replace("/admin/question-banks");
    } catch {
      // Mutation error remains visible in the confirmation dialog.
    }
  }

  const errorMessage =
    deleteQuestionBank.error instanceof ApiError
      ? deleteQuestionBank.error.message
      : deleteQuestionBank.isError
        ? "Unable to delete question bank."
        : null;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!deleteQuestionBank.isPending) {
          setOpen(nextOpen);

          if (!nextOpen) {
            deleteQuestionBank.reset();
          }
        }
      }}
    >
      <AlertDialogTrigger
        render={
          <Button variant="destructive">
            <Trash2 />
            Delete bank
          </Button>
        }
      />

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete question bank?</AlertDialogTitle>

          <AlertDialogDescription>
            This will permanently delete &quot;{bank.name}&quot;. Attached
            question membership will be removed, but the questions themselves
            will not be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteQuestionBank.isPending}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
            disabled={deleteQuestionBank.isPending}
            variant={"destructive"}
          >
            {deleteQuestionBank.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Trash2 />
            )}

            {deleteQuestionBank.isPending
              ? "Deleting..."
              : "Delete question bank"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
