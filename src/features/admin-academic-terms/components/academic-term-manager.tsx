"use client";

import { CalendarDays, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { CreateAcademicTermForm } from "@/features/admin-academic-terms/components/create-academic-term-form";
import { EditAcademicTermForm } from "@/features/admin-academic-terms/components/edit-academic-term-form";
import {
  useAdminAcademicTerms,
  useDeleteAdminAcademicTerm,
} from "@/features/admin-academic-terms/queries";
import {
  academicSemesterOptions,
  formatAcademicSemester,
  isAcademicSemester,
} from "@/features/admin-academic-terms/semester";
import type {
  AcademicSemester,
  AdminAcademicTerm,
} from "@/features/admin-academic-terms/types";

type SemesterFilter = AcademicSemester | "all";

function AcademicTermListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AcademicTermCard({
  academicTerm,
  onEdit,
}: {
  academicTerm: AdminAcademicTerm;
  onEdit: () => void;
}) {
  const deleteAcademicTerm = useDeleteAdminAcademicTerm(academicTerm.id);

  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleDelete() {
    try {
      await deleteAcademicTerm.mutateAsync();

      setDeleteOpen(false);
    } catch {
      // Mutation error is rendered in the dialog.
    }
  }

  return (
    <>
      <Card>
        <CardContent>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">
                  {formatAcademicSemester(academicTerm.semester)}{" "}
                  {academicTerm.year}
                </p>

                <Badge variant="outline">{academicTerm.semester}</Badge>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                {academicTerm.starts_at} — {academicTerm.ends_at}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onEdit}
                aria-label={`Edit ${formatAcademicSemester(
                  academicTerm.semester,
                )} ${academicTerm.year}`}
              >
                <Pencil />
                Edit
              </Button>

              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => {
                  deleteAcademicTerm.reset();
                  setDeleteOpen(true);
                }}
                aria-label={`Delete ${formatAcademicSemester(
                  academicTerm.semester,
                )} ${academicTerm.year}`}
              >
                <Trash2 />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!deleteAcademicTerm.isPending) {
            setDeleteOpen(open);

            if (!open) {
              deleteAcademicTerm.reset();
            }
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete academic term?</AlertDialogTitle>

            <AlertDialogDescription>
              Delete {formatAcademicSemester(academicTerm.semester)}{" "}
              {academicTerm.year}? Academic terms referenced by course offerings
              cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteAcademicTerm.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {deleteAcademicTerm.error instanceof Error
                  ? deleteAcademicTerm.error.message
                  : "Unable to delete academic term."}
              </AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAcademicTerm.isPending}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={deleteAcademicTerm.isPending}
              onClick={(event) => {
                event.preventDefault();

                void handleDelete();
              }}
            >
              {deleteAcademicTerm.isPending && (
                <Loader2 className="animate-spin" />
              )}

              {deleteAcademicTerm.isPending
                ? "Deleting..."
                : "Delete academic term"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function AcademicTermManager() {
  const [semesterFilter, setSemesterFilter] = useState<SemesterFilter>("all");

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [editingTerm, setEditingTerm] = useState<AdminAcademicTerm | null>(
    null,
  );

  const academicTermsQuery = useAdminAcademicTerms({
    page: 1,
    pageSize: 100,
    semester: semesterFilter === "all" ? undefined : semesterFilter,
  });

  const academicTerms = academicTermsQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Academic Terms
          </h1>

          <p className="mt-1 text-muted-foreground">
            Manage academic periods used by ATLAS course offerings.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => {
            setEditingTerm(null);
            setShowCreateForm((current) => !current);
          }}
        >
          <Plus />
          New academic term
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Academic Term</CardTitle>
          </CardHeader>

          <CardContent>
            <CreateAcademicTermForm
              onCreated={() => setShowCreateForm(false)}
              onCancel={() => setShowCreateForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {editingTerm && (
        <Card>
          <CardHeader>
            <CardTitle>
              Edit {formatAcademicSemester(editingTerm.semester)}{" "}
              {editingTerm.year}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <EditAcademicTermForm
              academicTerm={editingTerm}
              onSaved={() => setEditingTerm(null)}
              onCancel={() => setEditingTerm(null)}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Academic Term Directory</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={semesterFilter}
              onValueChange={(value) => {
                if (value === "all") {
                  setSemesterFilter("all");
                  return;
                }

                if (isAcademicSemester(value)) {
                  setSemesterFilter(value);
                }
              }}
            >
              <SelectTrigger aria-label="Filter academic semester">
                <span>
                  {semesterFilter === "all"
                    ? "All semesters"
                    : formatAcademicSemester(semesterFilter)}
                </span>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All semesters</SelectItem>

                {academicSemesterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {academicTermsQuery.isPending ? (
        <AcademicTermListSkeleton />
      ) : academicTermsQuery.isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            {academicTermsQuery.error instanceof Error
              ? academicTermsQuery.error.message
              : "Unable to load academic terms."}
          </AlertDescription>
        </Alert>
      ) : academicTerms.length === 0 ? (
        <Card>
          <CardContent>
            <div className="flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <CalendarDays className="size-5 text-muted-foreground" />
              </div>

              <p className="mt-3 font-medium">No academic terms</p>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Create an academic term before creating course offerings.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {academicTerms.map((academicTerm) => (
            <AcademicTermCard
              key={academicTerm.id}
              academicTerm={academicTerm}
              onEdit={() => {
                setShowCreateForm(false);
                setEditingTerm(academicTerm);
              }}
            />
          ))}

          <p className="text-sm text-muted-foreground">
            Showing {academicTerms.length} of{" "}
            {academicTermsQuery.data?.total ?? 0} academic terms.
          </p>
        </div>
      )}
    </div>
  );
}
