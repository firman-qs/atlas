"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("admin.courses.lifecycle");
  const tCourses = useTranslations("admin.courses");
  const tErrors = useTranslations("admin.errors");
  const common = useTranslations("common");

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
              : course.is_active
                ? tErrors("deactivateCourse")
                : tErrors("activateCourse")}
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
              ? t("deactivating")
              : t("activating")
            : course.is_active
              ? tCourses("inactive")
              : tCourses("active")}
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
          {t("delete")}
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
            <AlertDialogTitle>{t("dialog.deleteTitle")}</AlertDialogTitle>

            <AlertDialogDescription>
              {t("dialog.deleteDescription", {
                code: course.code,
                title: course.title,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteCourse.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {deleteCourse.error instanceof Error
                  ? deleteCourse.error.message
                  : tErrors("deleteCourse")}
              </AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCourse.isPending}>
              {common("cancel")}
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

              {deleteCourse.isPending ? t("deleting") : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
