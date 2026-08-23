"use client";

import { Loader2, Plus } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAdminAcademicTerms } from "@/features/admin-academic-terms/queries";
import { useCreateAdminCourseOffering } from "@/features/admin-course-offerings/queries";
import { useAdminCourses } from "@/features/admin-courses/queries";
import { useAdminUsers } from "@/features/admin-users/queries";

function formatSemester(semester: string) {
  return semester
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function CreateCourseOfferingForm() {
  const coursesQuery = useAdminCourses({
    page: 1,
    pageSize: 100,
    active: true,
  });

  const usersQuery = useAdminUsers({
    page: 1,
    pageSize: 100,
    isActive: true,
  });

  const academicTermsQuery = useAdminAcademicTerms({
    page: 1,
    pageSize: 100,
  });

  const createOffering = useCreateAdminCourseOffering();

  const [courseId, setCourseId] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [academicTermId, setAcademicTermId] = useState("");
  const [section, setSection] = useState("");

  const instructors = useMemo(
    () =>
      (usersQuery.data?.items ?? []).filter(
        (user) =>
          user.is_active &&
          user.deleted_at === null &&
          user.roles.includes("instructor"),
      ),
    [usersQuery.data],
  );

  const loadingDependencies =
    coursesQuery.isPending ||
    usersQuery.isPending ||
    academicTermsQuery.isPending;

  const dependencyError =
    coursesQuery.isError || usersQuery.isError || academicTermsQuery.isError;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      courseId === "" ||
      instructorId === "" ||
      academicTermId === "" ||
      section.trim() === ""
    ) {
      return;
    }

    try {
      await createOffering.mutateAsync({
        course_id: courseId,
        instructor_id: instructorId,
        academic_term_id: academicTermId,
        section: section.trim(),
      });

      setCourseId("");
      setInstructorId("");
      setAcademicTermId("");
      setSection("");
    } catch {
      // Mutation state renders the backend error.
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Course Offering</CardTitle>
      </CardHeader>

      <CardContent>
        {dependencyError ? (
          <Alert variant="destructive">
            <AlertDescription>
              Unable to load the courses, instructors, or academic terms
              required to create a course offering.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="course-offering-course">Course</Label>

                <select
                  id="course-offering-course"
                  value={courseId}
                  onChange={(event) => setCourseId(event.target.value)}
                  disabled={loadingDependencies || createOffering.isPending}
                  className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select course</option>

                  {(coursesQuery.data?.items ?? []).map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} — {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-offering-term">Academic term</Label>

                <select
                  id="course-offering-term"
                  value={academicTermId}
                  onChange={(event) => setAcademicTermId(event.target.value)}
                  disabled={loadingDependencies || createOffering.isPending}
                  className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select academic term</option>

                  {(academicTermsQuery.data?.items ?? []).map((term) => (
                    <option key={term.id} value={term.id}>
                      {formatSemester(term.semester)} {term.year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-offering-instructor">Instructor</Label>

                <select
                  id="course-offering-instructor"
                  value={instructorId}
                  onChange={(event) => setInstructorId(event.target.value)}
                  disabled={loadingDependencies || createOffering.isPending}
                  className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select instructor</option>

                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.full_name} — {instructor.email}
                    </option>
                  ))}
                </select>

                {!loadingDependencies && instructors.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No active users with the instructor role are available.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-offering-section">Section</Label>

                <Input
                  id="course-offering-section"
                  value={section}
                  onChange={(event) => setSection(event.target.value)}
                  placeholder="A"
                  disabled={createOffering.isPending}
                />
              </div>
            </div>

            {createOffering.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {createOffering.error instanceof Error
                    ? createOffering.error.message
                    : "Unable to create course offering."}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={
                  loadingDependencies ||
                  dependencyError ||
                  createOffering.isPending ||
                  courseId === "" ||
                  instructorId === "" ||
                  academicTermId === "" ||
                  section.trim() === ""
                }
              >
                {createOffering.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Plus />
                )}

                {createOffering.isPending
                  ? "Creating..."
                  : "Create course offering"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
