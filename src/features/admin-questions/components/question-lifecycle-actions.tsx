"use client";

import { Loader2, Pencil, Send, Trash2, Undo2 } from "lucide-react";
import Link from "next/link";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  useDeleteAdminQuestion,
  usePublishAdminQuestion,
  useUnpublishAdminQuestion,
} from "@/features/admin-questions/queries";
import type { AdminQuestionSummary } from "@/features/admin-questions/types";

interface QuestionLifecycleActionsProps {
  question: AdminQuestionSummary;
}

export function QuestionLifecycleActions({
  question,
}: QuestionLifecycleActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const publishQuestion = usePublishAdminQuestion(question.id);
  const unpublishQuestion = useUnpublishAdminQuestion(question.id);
  const deleteQuestion = useDeleteAdminQuestion();

  const lifecycleMutation =
    question.status === "published" ? unpublishQuestion : publishQuestion;

  const lifecyclePending =
    publishQuestion.isPending || unpublishQuestion.isPending;

  const lifecycleError = publishQuestion.error ?? unpublishQuestion.error;

  async function handleLifecycleChange() {
    try {
      await lifecycleMutation.mutateAsync();
    } catch {
      // Mutation state renders the error.
    }
  }

  async function handleDelete() {
    try {
      await deleteQuestion.mutateAsync(question.id);

      setDeleteOpen(false);
      router.push("/admin/questions");
    } catch {
      // Keep dialog open so backend conflicts remain visible.
    }
  }

  return (
    <div className="space-y-3">
      {lifecycleError && (
        <Alert variant="destructive">
          <AlertDescription>
            {lifecycleError instanceof Error
              ? lifecycleError.message
              : "Unable to change question status."}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        {question.status === "draft" && (
          <Button
            nativeButton={false}
            variant="outline"
            disabled={lifecyclePending || deleteQuestion.isPending}
            render={<Link href={`/admin/questions/${question.id}/edit`} />}
          >
            <Pencil />
            Edit question
          </Button>
        )}
        <Button
          variant="outline"
          onClick={handleLifecycleChange}
          disabled={lifecyclePending || deleteQuestion.isPending}
        >
          {lifecyclePending ? (
            <Loader2 className="animate-spin" />
          ) : question.status === "published" ? (
            <Undo2 />
          ) : (
            <Send />
          )}

          {lifecyclePending
            ? question.status === "published"
              ? "Unpublishing..."
              : "Publishing..."
            : question.status === "published"
              ? "Unpublish"
              : "Publish"}
        </Button>

        {question.status === "draft" && (
          <Button
            variant="destructive"
            onClick={() => {
              deleteQuestion.reset();
              setDeleteOpen(true);
            }}
            disabled={lifecyclePending || deleteQuestion.isPending}
          >
            <Trash2 />
            Delete question
          </Button>
        )}
      </div>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!deleteQuestion.isPending) {
            setDeleteOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete question?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete this draft question and its
              question-specific content. This action cannot be undone and may
              fail if the question is referenced by dependent assessment data.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteQuestion.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {deleteQuestion.error instanceof Error
                  ? deleteQuestion.error.message
                  : "Unable to delete question."}
              </AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteQuestion.isPending}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              disabled={deleteQuestion.isPending}
              variant="destructive"
            >
              {deleteQuestion.isPending && <Loader2 className="animate-spin" />}

              {deleteQuestion.isPending
                ? "Deleting..."
                : "Delete question permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
