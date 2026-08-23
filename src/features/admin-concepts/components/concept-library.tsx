"use client";

import {
  BookOpenText,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateConceptForm } from "@/features/admin-concepts/components/create-concept-form";
import { EditConceptForm } from "@/features/admin-concepts/components/edit-concept-form";
import {
  useConcepts,
  useDeleteConcept,
} from "@/features/admin-concepts/queries";
import type { AdminConcept } from "@/features/admin-concepts/types";

interface ConceptLibraryProps {
  courseId: string;
}

function ConceptLibrarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>

      <CardContent className="space-y-3">
        <Skeleton className="h-8 w-full" />

        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ConceptLibrary({ courseId }: ConceptLibraryProps) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminConcept | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const conceptsQuery = useConcepts({
    courseId,
    page: 1,
    pageSize: 100,
    search,
  });

  const deleteConcept = useDeleteConcept(courseId);

  if (conceptsQuery.isPending) {
    return <ConceptLibrarySkeleton />;
  }

  if (conceptsQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Concept Library</CardTitle>
        </CardHeader>

        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {conceptsQuery.error instanceof Error
                ? conceptsQuery.error.message
                : "Unable to load concepts."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const concepts = conceptsQuery.data.items;

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteConcept.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // Keep dialog open and render mutation error.
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>Concept Library</CardTitle>

            <p className="text-sm text-muted-foreground">
              Manage reusable concepts defined for this course.
            </p>
          </div>

          <Button
            onClick={() => setIsCreating((current) => !current)}
            variant={isCreating ? "outline" : "default"}
          >
            <Plus />

            {isCreating ? "Close form" : "Create concept"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isCreating && (
          <CreateConceptForm
            courseId={courseId}
            onCancel={() => setIsCreating(false)}
            onCreated={() => setIsCreating(false)}
          />
        )}

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search concepts by code or name..."
            className="pl-8"
          />
        </div>

        {concepts.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <BookOpenText className="size-4 text-muted-foreground" />
            </div>

            <p className="mt-3 font-medium">
              {search ? "No matching concepts" : "No concepts yet"}
            </p>

            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {search
                ? "No course concepts match the current search."
                : "Create the first reusable concept for this course."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {concepts.map((concept) => (
              <div
                key={concept.id}
                className="rounded-lg border bg-background p-4"
              >
                {editingId === concept.id ? (
                  <EditConceptForm
                    concept={concept}
                    onCancel={() => setEditingId(null)}
                    onSaved={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{concept.code}</Badge>

                        <p className="font-medium">{concept.name}</p>
                      </div>

                      <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                        {concept.description}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(concept.id)}
                      >
                        <Pencil />
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          deleteConcept.reset();
                          setDeleteTarget(concept);
                        }}
                      >
                        <Trash2 />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <p className="text-sm text-muted-foreground">
              Showing {concepts.length} of {conceptsQuery.data.total} concept
              {conceptsQuery.data.total === 1 ? "" : "s"}.
            </p>
          </div>
        )}
      </CardContent>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleteConcept.isPending) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete concept?</AlertDialogTitle>

            <AlertDialogDescription>
              {deleteTarget
                ? `This permanently deletes ${deleteTarget.code} — ${deleteTarget.name} from the course concept library. This is different from detaching the concept from a single learning objective.`
                : "This concept will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteConcept.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {deleteConcept.error instanceof Error
                  ? deleteConcept.error.message
                  : "Unable to delete concept."}
              </AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteConcept.isPending}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={deleteConcept.isPending}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {deleteConcept.isPending && <Loader2 className="animate-spin" />}

              {deleteConcept.isPending ? "Deleting..." : "Delete concept"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
