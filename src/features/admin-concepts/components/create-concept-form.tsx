"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateConcept } from "@/features/admin-concepts/queries";

const createConceptSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Concept code is required.")
    .max(50, "Concept code must be at most 50 characters."),

  name: z
    .string()
    .trim()
    .min(1, "Concept name is required.")
    .max(255, "Concept name must be at most 255 characters."),

  description: z.string().trim().min(1, "Concept description is required."),
});

type CreateConceptFormValues = z.infer<typeof createConceptSchema>;

interface CreateConceptFormProps {
  courseId: string;
  onCancel: () => void;
  onCreated: () => void;
}

export function CreateConceptForm({
  courseId,
  onCancel,
  onCreated,
}: CreateConceptFormProps) {
  const createConcept = useCreateConcept(courseId);

  const form = useForm<CreateConceptFormValues>({
    resolver: zodResolver(createConceptSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
    },
  });

  async function onSubmit(values: CreateConceptFormValues) {
    try {
      await createConcept.mutateAsync({
        code: values.code.trim(),
        name: values.name.trim(),
        description: values.description.trim(),
      });

      form.reset();
      onCreated();
    } catch {
      // Mutation state renders the API error below.
    }
  }

  return (
    <form
      className="space-y-5 rounded-lg border bg-muted/20 p-4"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {createConcept.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {createConcept.error instanceof Error
              ? createConcept.error.message
              : "Unable to create concept."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="concept-code">Code</Label>

          <Input
            id="concept-code"
            placeholder="e.g. em-c003"
            disabled={createConcept.isPending}
            {...form.register("code")}
          />

          {form.formState.errors.code && (
            <p className="text-sm text-destructive">
              {form.formState.errors.code.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="concept-name">Name</Label>

          <Input
            id="concept-name"
            placeholder="e.g. Electric Potential"
            disabled={createConcept.isPending}
            {...form.register("name")}
          />

          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="concept-description">Description</Label>

        <Textarea
          id="concept-description"
          rows={4}
          placeholder="Describe the conceptual content represented by this concept."
          disabled={createConcept.isPending}
          {...form.register("description")}
        />

        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={createConcept.isPending}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={createConcept.isPending}>
          {createConcept.isPending && <Loader2 className="animate-spin" />}

          {createConcept.isPending ? "Creating..." : "Create concept"}
        </Button>
      </div>
    </form>
  );
}
