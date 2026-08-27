"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateInstructorEnrollment } from "@/features/instructor-course-offerings/queries";
import { useInstructorStudents } from "@/features/instructor-students/queries";

interface InstructorEnrollStudentProps {
  courseOfferingId: string;
}

export function InstructorEnrollStudent({
  courseOfferingId,
}: InstructorEnrollStudentProps) {
  const t = useTranslations("instructor.enrollment");
  const tErrors = useTranslations("instructor.errors");
  const common = useTranslations("common");

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );

  const studentsQuery = useInstructorStudents({
    page: 1,
    pageSize: 20,
    search,
  });

  const createEnrollment = useCreateInstructorEnrollment(courseOfferingId);

  const selectedStudent = studentsQuery.data?.items.find(
    (student) => student.id === selectedStudentId,
  );

  async function handleEnroll() {
    if (!selectedStudentId) {
      return;
    }

    try {
      await createEnrollment.mutateAsync({
        student_id: selectedStudentId,
      });

      setSelectedStudentId(null);
      setSearch("");
      setOpen(false);
    } catch {
      // Mutation state renders the backend error.
    }
  }

  if (!open) {
    return (
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => {
            createEnrollment.reset();
            setOpen(true);
          }}
        >
          {t("enrollStudent")}
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>{t("enrollStudentTitle")}</CardTitle>

          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSelectedStudentId(null);
              setSearch("");
              createEnrollment.reset();
              setOpen(false);
            }}
            disabled={createEnrollment.isPending}
          >
            {common("cancel")}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Input
          aria-label={t("searchAria")}
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setSelectedStudentId(null);
          }}
          disabled={createEnrollment.isPending}
        />

        {studentsQuery.isPending && (
          <p className="text-sm text-muted-foreground">{t("loadingStudents")}</p>
        )}

        {studentsQuery.isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {studentsQuery.error instanceof Error
                ? studentsQuery.error.message
                : tErrors("loadStudents")}
            </AlertDescription>
          </Alert>
        )}

        {studentsQuery.data && (
          <div className="space-y-2">
            {studentsQuery.data.items.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="font-medium">{t("noStudentsFound")}</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {t("noStudentsDescription")}
                </p>
              </div>
            ) : (
              studentsQuery.data.items.map((student) => {
                const selected = student.id === selectedStudentId;

                return (
                  <div
                    key={student.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{student.full_name}</p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {student.email}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant={selected ? "secondary" : "outline"}
                      aria-label={t("selectStudentAria", { name: student.full_name })}
                      onClick={() => {
                        setSelectedStudentId(student.id);
                      }}
                      disabled={createEnrollment.isPending}
                    >
                      {selected ? t("selected") : t("select")}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {createEnrollment.isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {createEnrollment.error instanceof Error
                ? createEnrollment.error.message
                : tErrors("enrollStudent")}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 text-sm text-muted-foreground">
            {selectedStudent ? (
              <>
                {t("selectedLabel")}
                <span className="font-medium text-foreground">
                  {selectedStudent.full_name}
                </span>
              </>
            ) : (
              t("selectOnePrompt")
            )}
          </div>

          <Button
            type="button"
            onClick={() => {
              void handleEnroll();
            }}
            disabled={selectedStudentId === null || createEnrollment.isPending}
          >
            {createEnrollment.isPending ? t("enrolling") : t("enroll")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
