"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("admin.concepts");
  const tErrors = useTranslations("admin.errors");
  const common = useTranslations("common");

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
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>

        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {conceptsQuery.error instanceof Error
                ? conceptsQuery.error.message
                : tErrors("loadConcepts")}
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
            <CardTitle>{t("title")}</CardTitle>

            <p className="text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>

          <Button
            onClick={() => setIsCreating((current) => !current)}
            variant={isCreating ? "outline" : "default"}
          >
            <Plus />

            {isCreating ? t("closeForm") : t("createConcept")}
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
            placeholder={t("searchPlaceholder")}
            className="pl-8"
          />
        </div>

        {concepts.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <BookOpenText className="size-4 text-muted-foreground" />
            </div>

            <p className="mt-3 font-medium">
              {search ? t("noMatching") : t("noConcepts")}
            </p>

            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {search
                ? t("noMatchingDescription")
                : t("noConceptsDescription")}
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
                        {t("actions.edit")}
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
                        {t("actions.delete")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <p className="text-sm text-muted-foreground">
              {t("showingCount", {
                count: concepts.length,
                total: conceptsQuery.data.total,
              })}
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
            <AlertDialogTitle>{t("dialog.title")}</AlertDialogTitle>

            <AlertDialogDescription>
              {deleteTarget
                ? t("dialog.description", {
                    code: deleteTarget.code,
                    name: deleteTarget.name,
                  })
                : t("dialog.title")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteConcept.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {deleteConcept.error instanceof Error
                  ? deleteConcept.error.message
                  : tErrors("deleteConcept")}
              </AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteConcept.isPending}>
              {common("cancel")}
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

              {deleteConcept.isPending
                ? t("dialog.deleting")
                : t("dialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
