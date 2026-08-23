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
        ? "Unable to cancel assessment."
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
            Cancel assessment
          </Button>
        }
      />

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this assessment?</AlertDialogTitle>

          <AlertDialogDescription>
            The assessment will stop immediately. Submitted attempts remain in
            your assessment history, but you will not be able to continue this
            assessment after cancellation.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancelAssessment.isPending}>
            Keep assessment
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

            {cancelAssessment.isPending ? "Canceling..." : "Cancel assessment"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
