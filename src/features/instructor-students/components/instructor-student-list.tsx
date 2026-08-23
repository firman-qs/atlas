"use client";

import { Search, Users } from "lucide-react";
import { FormEvent, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstructorStudents } from "@/features/instructor-students/queries";

function StudentListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-36" />
      </CardHeader>

      <CardContent className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border p-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-4 w-56" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function InstructorStudentList() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const studentsQuery = useInstructorStudents({
    page: 1,
    pageSize: 20,
    search: search || undefined,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  if (studentsQuery.isPending) {
    return <StudentListSkeleton />;
  }

  return (
    <div className="space-y-6">
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleSubmit}>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            aria-label="Search students"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search students by name or email..."
            className="pl-9"
          />
        </div>

        <Button type="submit">Search</Button>

        {search && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearchInput("");
              setSearch("");
            }}
          >
            Clear
          </Button>
        )}
      </form>

      {studentsQuery.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {studentsQuery.error instanceof Error
              ? studentsQuery.error.message
              : "Unable to load students."}
          </AlertDescription>
        </Alert>
      )}

      {!studentsQuery.isError && studentsQuery.data && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Students</CardTitle>

              <Badge variant="outline">
                {studentsQuery.data.total} student
                {studentsQuery.data.total === 1 ? "" : "s"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            {studentsQuery.data.items.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <Users className="size-4 text-muted-foreground" />
                </div>

                <p className="mt-3 font-medium">No students found</p>

                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  No active student account matches the current search.
                </p>
              </div>
            ) : (
              <div className="divide-y rounded-lg border">
                {studentsQuery.data.items.map((student) => (
                  <div
                    key={student.id}
                    className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{student.full_name}</p>

                      <p className="text-sm text-muted-foreground">
                        {student.email}
                      </p>
                    </div>

                    <span
                      className="mt-2 font-mono text-xs text-muted-foreground sm:mt-0"
                      title={student.id}
                    >
                      {student.id.slice(0, 8)}…
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
