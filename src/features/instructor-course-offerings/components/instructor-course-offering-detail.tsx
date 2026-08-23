"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstructorEnrollStudent } from "@/features/instructor-course-offerings/components/instructor-enroll-student";
import { InstructorEnrollmentList } from "@/features/instructor-course-offerings/components/instructor-enrollment-list";
import { useInstructorCourseOffering } from "@/features/instructor-course-offerings/queries";
interface InstructorCourseOfferingDetailProps {
  courseOfferingId: string;
}

function formatSemester(semester: string) {
  return semester.charAt(0).toUpperCase() + semester.slice(1);
}

export function InstructorCourseOfferingDetail({
  courseOfferingId,
}: InstructorCourseOfferingDetailProps) {
  const offeringQuery = useInstructorCourseOffering(courseOfferingId);

  if (offeringQuery.isPending) {
    return (
      <div className="space-y-4">
        <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (offeringQuery.isError) {
    return (
      <Card>
        <CardContent>
          <p className="font-medium">Unable to load course offering.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {offeringQuery.error instanceof Error
              ? offeringQuery.error.message
              : "Please try again."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const offering = offeringQuery.data;

  return (
    <div className="space-y-6">
      <Button
        nativeButton={false}
        variant="ghost"
        size="sm"
        render={<Link href="/instructor/course-offerings" />}
      >
        <ArrowLeft />
        Course Offerings
      </Button>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{offering.course.code}</Badge>
          <Badge variant="outline">Section {offering.section}</Badge>
        </div>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {offering.course.title}
          </h1>

          <p className="mt-1 text-muted-foreground">
            {formatSemester(offering.academic_term.semester)} semester{" "}
            {offering.academic_term.year}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Offering</CardTitle>
        </CardHeader>

        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-sm text-muted-foreground">Course code</dt>
              <dd className="mt-1 font-medium">{offering.course.code}</dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">Section</dt>
              <dd className="mt-1 font-medium">Section {offering.section}</dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">Academic term</dt>
              <dd className="mt-1 font-medium">
                {formatSemester(offering.academic_term.semester)}{" "}
                {offering.academic_term.year}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">Credits</dt>
              <dd className="mt-1 font-medium">
                {offering.course.credits} credits
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <InstructorEnrollStudent courseOfferingId={courseOfferingId} />
      <InstructorEnrollmentList courseOfferingId={courseOfferingId} />
    </div>
  );
}
