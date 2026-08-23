"use client";

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
          Enroll student
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Enroll Student</CardTitle>

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
            Cancel
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Input
          aria-label="Search students"
          placeholder="Search students by name or email"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setSelectedStudentId(null);
          }}
          disabled={createEnrollment.isPending}
        />

        {studentsQuery.isPending && (
          <p className="text-sm text-muted-foreground">Loading students...</p>
        )}

        {studentsQuery.isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {studentsQuery.error instanceof Error
                ? studentsQuery.error.message
                : "Unable to load students."}
            </AlertDescription>
          </Alert>
        )}

        {studentsQuery.data && (
          <div className="space-y-2">
            {studentsQuery.data.items.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="font-medium">No students found</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Try another name or email address.
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
                      aria-label={`Select ${student.full_name}`}
                      onClick={() => {
                        setSelectedStudentId(student.id);
                      }}
                      disabled={createEnrollment.isPending}
                    >
                      {selected ? "Selected" : "Select"}
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
                : "Unable to enroll student."}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 text-sm text-muted-foreground">
            {selectedStudent ? (
              <>
                Selected:{" "}
                <span className="font-medium text-foreground">
                  {selectedStudent.full_name}
                </span>
              </>
            ) : (
              "Select one student to enroll."
            )}
          </div>

          <Button
            type="button"
            onClick={() => {
              void handleEnroll();
            }}
            disabled={selectedStudentId === null || createEnrollment.isPending}
          >
            {createEnrollment.isPending ? "Enrolling..." : "Enroll"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
