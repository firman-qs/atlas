"use client";

import {
  ArrowDownAZ,
  BookOpen,
  ChevronRight,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateCourseForm } from "@/features/admin-courses/components/create-course-form";
import { useAdminCourses } from "@/features/admin-courses/queries";
import type {
  AdminCourseSortField,
  SortOrder,
} from "@/features/admin-courses/types";

type ActiveFilter = "all" | "active" | "inactive";

function CourseListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-7 w-3/4" />
          </CardHeader>

          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdminCourseManager() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");

  const [sort, setSort] = useState<AdminCourseSortField>("code");

  const [order, setOrder] = useState<SortOrder>("asc");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const coursesQuery = useAdminCourses({
    page: 1,
    pageSize: 100,
    search,
    active: activeFilter === "all" ? undefined : activeFilter === "active",
    sort,
    order,
  });

  const courses = coursesQuery.data?.items ?? [];
  const totalCourses = coursesQuery.data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Courses</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage ATLAS courses and their curriculum.
          </p>
        </div>

        <Button onClick={() => setShowCreateForm((current) => !current)}>
          <Plus />
          {showCreateForm ? "Close form" : "Create course"}
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create course</CardTitle>
          </CardHeader>

          <CardContent>
            <CreateCourseForm
              onCreated={() => setShowCreateForm(false)}
              onCancel={() => setShowCreateForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Course catalog</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_140px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by code or title..."
                className="pl-8"
              />
            </div>

            <Select
              value={activeFilter}
              onValueChange={(value) => {
                if (
                  value === "all" ||
                  value === "active" ||
                  value === "inactive"
                ) {
                  setActiveFilter(value);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <span>
                  {activeFilter === "all"
                    ? "All statuses"
                    : activeFilter === "active"
                      ? "Active"
                      : "Inactive"}
                </span>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sort}
              onValueChange={(value) => {
                if (
                  value === "code" ||
                  value === "title" ||
                  value === "credits"
                ) {
                  setSort(value);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <span>
                  {sort === "code"
                    ? "Sort by code"
                    : sort === "title"
                      ? "Sort by title"
                      : "Sort by credits"}
                </span>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="code">Sort by code</SelectItem>
                <SelectItem value="title">Sort by title</SelectItem>
                <SelectItem value="credits">Sort by credits</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() =>
                setOrder((current) => (current === "asc" ? "desc" : "asc"))
              }
            >
              <ArrowDownAZ />
              {order === "asc" ? "Ascending" : "Descending"}
            </Button>
          </div>

          {coursesQuery.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {coursesQuery.error instanceof Error
                  ? coursesQuery.error.message
                  : "Unable to load courses."}
              </AlertDescription>
            </Alert>
          )}

          {coursesQuery.isPending ? (
            <CourseListSkeleton />
          ) : courses.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <BookOpen className="size-5 text-muted-foreground" />
              </div>

              <h2 className="mt-4 text-lg font-semibold">No courses found</h2>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                No courses match the current search and filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <Card key={course.id}>
                    <CardHeader>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{course.code}</Badge>

                        {course.is_active ? (
                          <Badge>Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>

                      <CardTitle className="mt-2">{course.title}</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {course.description}
                      </p>

                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">
                          {course.credits} credit
                          {course.credits === 1 ? "" : "s"}
                        </p>

                        <Button
                          nativeButton={false}
                          variant="outline"
                          size="sm"
                          render={<Link href={`/admin/courses/${course.id}`} />}
                        >
                          Manage
                          <ChevronRight />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">
                Showing {courses.length} of {totalCourses} course
                {totalCourses === 1 ? "" : "s"}.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
