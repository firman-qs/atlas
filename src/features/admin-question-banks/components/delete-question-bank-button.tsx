"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("admin.questionBanks.detail");
  const tErrors = useTranslations("admin.errors");
  const common = useTranslations("common");

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
        ? tErrors("deleteQuestionBank")
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
            {t("deleteBank")}
          </Button>
        }
      />

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("dialog.title")}</AlertDialogTitle>

          <AlertDialogDescription>
            {t("dialog.description", { name: bank.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteQuestionBank.isPending}>
            {common("cancel")}
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
              ? t("dialog.deleting")
              : t("dialog.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
