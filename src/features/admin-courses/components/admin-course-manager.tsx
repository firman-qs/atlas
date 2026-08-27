"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("admin.courses");
  const tErrors = useTranslations("admin.errors");

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
          <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <Button onClick={() => setShowCreateForm((current) => !current)}>
          <Plus />
          {showCreateForm ? t("closeForm") : t("createCourse")}
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>{t("createCourse")}</CardTitle>
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
          <CardTitle>{t("catalog")}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_140px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t("searchPlaceholder")}
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
                    ? t("allStatuses")
                    : activeFilter === "active"
                      ? t("active")
                      : t("inactive")}
                </span>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">{t("allStatuses")}</SelectItem>
                <SelectItem value="active">{t("active")}</SelectItem>
                <SelectItem value="inactive">{t("inactive")}</SelectItem>
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
                    ? t("sortByCode")
                    : sort === "title"
                      ? t("sortByTitle")
                      : t("sortByCredits")}
                </span>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="code">{t("sortByCode")}</SelectItem>
                <SelectItem value="title">{t("sortByTitle")}</SelectItem>
                <SelectItem value="credits">{t("sortByCredits")}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() =>
                setOrder((current) => (current === "asc" ? "desc" : "asc"))
              }
            >
              <ArrowDownAZ />
              {order === "asc" ? t("ascending") : t("descending")}
            </Button>
          </div>

          {coursesQuery.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {coursesQuery.error instanceof Error
                  ? coursesQuery.error.message
                  : tErrors("loadCourses")}
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

              <h2 className="mt-4 text-lg font-semibold">{t("noCourses")}</h2>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {t("noCoursesDescription")}
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
                          <Badge>{t("active")}</Badge>
                        ) : (
                          <Badge variant="secondary">{t("inactive")}</Badge>
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
                          {t("credits", { count: course.credits })}
                        </p>

                        <Button
                          nativeButton={false}
                          variant="outline"
                          size="sm"
                          render={<Link href={`/admin/courses/${course.id}`} />}
                        >
                          {t("manage")}
                          <ChevronRight />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">
                {t("showingCount", {
                  count: courses.length,
                  total: totalCourses,
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
