"use client";

import { Loader2, Power, PowerOff, Trash2 } from "lucide-react";
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
  useActivateAdminCourse,
  useDeactivateAdminCourse,
  useDeleteAdminCourse,
} from "@/features/admin-courses/queries";
import type { AdminCourse } from "@/features/admin-courses/types";

interface CourseLifecycleActionsProps {
  course: AdminCourse;
}

export function CourseLifecycleActions({
  course,
}: CourseLifecycleActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const activateCourse = useActivateAdminCourse(course.id);
  const deactivateCourse = useDeactivateAdminCourse(course.id);
  const deleteCourse = useDeleteAdminCourse(course.id);

  const lifecycleMutation = course.is_active
    ? deactivateCourse
    : activateCourse;

  const lifecyclePending =
    activateCourse.isPending || deactivateCourse.isPending;

  const lifecycleError = activateCourse.error ?? deactivateCourse.error;

  async function handleLifecycleChange() {
    try {
      await lifecycleMutation.mutateAsync();
    } catch {
      // Mutation state renders the error.
    }
  }

  async function handleDelete() {
    try {
      await deleteCourse.mutateAsync();

      setDeleteOpen(false);
      router.push("/admin/courses");
    } catch {
      // Keep the dialog open so conflicts remain visible.
    }
  }

  return (
    <div className="space-y-3">
      {lifecycleError && (
        <Alert variant="destructive">
          <AlertDescription>
            {lifecycleError instanceof Error
              ? lifecycleError.message
              : "Unable to change course status."}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={handleLifecycleChange}
          disabled={lifecyclePending || deleteCourse.isPending}
        >
          {lifecyclePending ? (
            <Loader2 className="animate-spin" />
          ) : course.is_active ? (
            <PowerOff />
          ) : (
            <Power />
          )}

          {lifecyclePending
            ? course.is_active
              ? "Deactivating..."
              : "Activating..."
            : course.is_active
              ? "Deactivate"
              : "Activate"}
        </Button>

        <Button
          variant="destructive"
          onClick={() => {
            deleteCourse.reset();
            setDeleteOpen(true);
          }}
          disabled={lifecyclePending || deleteCourse.isPending}
        >
          <Trash2 />
          Delete course
        </Button>
      </div>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!deleteCourse.isPending) {
            setDeleteOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete course?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete {course.code} — {course.title}. The
              operation can fail if dependent academic records reference this
              course.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteCourse.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {deleteCourse.error instanceof Error
                  ? deleteCourse.error.message
                  : "Unable to delete course."}
              </AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCourse.isPending}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              disabled={deleteCourse.isPending}
              variant="destructive"
            >
              {deleteCourse.isPending && <Loader2 className="animate-spin" />}

              {deleteCourse.isPending ? "Deleting..." : "Delete course"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
