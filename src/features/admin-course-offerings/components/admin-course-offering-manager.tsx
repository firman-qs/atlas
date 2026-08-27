"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, GraduationCap } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { CreateCourseOfferingForm } from "@/features/admin-course-offerings/components/create-course-offering-form";
import { useAdminCourseOfferings } from "@/features/admin-course-offerings/queries";
import { isAcademicSemester } from "@/features/admin-academic-terms/semester";

function CourseOfferingListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-28 w-full" />
      ))}
    </div>
  );
}

export function AdminCourseOfferingManager() {
  const t = useTranslations("admin.courseOfferings");
  const tSemesters = useTranslations("course.semesters");
  const tErrors = useTranslations("admin.errors");

  function getSemesterLabel(semester: string) {
    if (isAcademicSemester(semester)) {
      return tSemesters(semester);
    }
    return semester;
  }

  const offeringsQuery = useAdminCourseOfferings({
    page: 1,
    pageSize: 100,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("title")}
        </h1>

        <p className="mt-1 text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <CreateCourseOfferingForm />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>{t("configured")}</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                {t("configuredDescription")}
              </p>
            </div>

            {!offeringsQuery.isPending && !offeringsQuery.isError && (
              <Badge variant="outline">
                {t("count", { count: offeringsQuery.data?.total ?? 0 })}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {offeringsQuery.isPending ? (
            <CourseOfferingListSkeleton />
          ) : offeringsQuery.isError ? (
            <Alert variant="destructive">
              <AlertDescription>
                {offeringsQuery.error instanceof Error
                  ? offeringsQuery.error.message
                  : tErrors("loadCourseOfferings")}
              </AlertDescription>
            </Alert>
          ) : offeringsQuery.data.items.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <GraduationCap className="size-4 text-muted-foreground" />
              </div>

              <p className="mt-3 font-medium">{t("noOfferings")}</p>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {t("noOfferingsDescription")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {offeringsQuery.data.items.map((offering) => (
                <div
                  key={offering.id}
                  className="flex flex-col justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{offering.course.code}</Badge>

                      <Badge variant="outline">
                        {t("section", { section: offering.section })}
                      </Badge>

                      <Badge variant="outline">
                        {getSemesterLabel(offering.academic_term.semester)}{" "}
                        {offering.academic_term.year}
                      </Badge>
                    </div>

                    <div>
                      <p className="font-medium">{offering.course.title}</p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {offering.instructor.full_name}
                        {" · "}
                        {offering.instructor.email}
                      </p>
                    </div>
                  </div>

                  <Button
                    nativeButton={false}
                    variant="outline"
                    render={
                      <Link href={`/admin/course-offerings/${offering.id}`} />
                    }
                  >
                    {t("manage")}
                    <ArrowRight />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
