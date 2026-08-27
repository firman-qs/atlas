"use client";

import { Ban, LoaderCircle } from "lucide-react";
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
import { useCancelAssessment } from "@/features/student-course/queries";
import { ApiError } from "@/lib/api/api-error";
import { useTranslations } from "next-intl";

interface CancelAssessmentButtonProps {
  assessmentId: string;
  learningRecordId: string;
  size?: "default" | "sm" | "lg" | "icon";
  onCanceled?: () => void;
}

export function CancelAssessmentButton({
  assessmentId,
  learningRecordId,
  size = "default",
  onCanceled,
}: CancelAssessmentButtonProps) {
  const messages = useTranslations("assessment.cancel");
  const errors = useTranslations("errors");
  const cancelAssessment = useCancelAssessment();
  const [open, setOpen] = useState(false);

  async function handleCancel() {
    try {
      await cancelAssessment.mutateAsync({
        assessmentId,
        learningRecordId,
      });

      setOpen(false);
      onCanceled?.();
    } catch {
      // Mutation error remains visible in the dialog.
    }
  }

  const errorMessage =
    cancelAssessment.error instanceof ApiError
      ? cancelAssessment.error.message
      : cancelAssessment.isError
        ? errors("cancelAssessment")
        : null;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (cancelAssessment.isPending) {
          return;
        }

        setOpen(nextOpen);

        if (!nextOpen) {
          cancelAssessment.reset();
        }
      }}
    >
      <AlertDialogTrigger
        render={
          <Button variant="outline" size={size}>
            <Ban />
            {messages("action")}
          </Button>
        }
      />

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{messages("title")}</AlertDialogTitle>

          <AlertDialogDescription>
            {messages("description")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancelAssessment.isPending}>
            {messages("keep")}
          </AlertDialogCancel>

          <AlertDialogAction
            variant="destructive"
            disabled={cancelAssessment.isPending}
            onClick={(event) => {
              event.preventDefault();
              void handleCancel();
            }}
          >
            {cancelAssessment.isPending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Ban />
            )}

            {cancelAssessment.isPending
              ? messages("canceling")
              : messages("action")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
