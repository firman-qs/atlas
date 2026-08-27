import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, BookOpen, ClipboardCheck } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StudentEnrollment } from "@/features/student-courses/types";
import {
  formatDomainCode,
  semesterMessageKey,
} from "@/features/student-course/labels";
import { useTranslations } from "next-intl";

interface CourseCardProps {
  enrollment: StudentEnrollment;
}

export function CourseCard({ enrollment }: CourseCardProps) {
  const courseMessages = useTranslations("course");
  const assessmentMessages = useTranslations("assessment");
  const offering = enrollment.course_offering;
  const course = offering.course;
  const learningRecord = enrollment.learning_record;
  const activeAssessment = learningRecord?.active_assessment ?? null;
  const semesterKey = semesterMessageKey(offering.academic_term.semester);
  const semester = semesterKey
    ? courseMessages(`semesters.${semesterKey}`)
    : formatDomainCode(offering.academic_term.semester);

  let stateLabel = courseMessages("states.notStarted");
  let stateVariant: "secondary" | "default" | "outline" = "secondary";

  if (activeAssessment) {
    stateLabel = courseMessages("states.assessmentInProgress");
    stateVariant = "default";
  } else if (learningRecord?.completed_at) {
    stateLabel = courseMessages("states.completed");
    stateVariant = "outline";
  } else if (learningRecord) {
    stateLabel = courseMessages("states.learningInProgress");
    stateVariant = "outline";
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 basis-48">
            <p className="text-sm font-medium text-muted-foreground">
              {course.code}
            </p>

            <CardTitle className="mt-1 text-xl">{course.title}</CardTitle>
          </div>

          <Badge className="max-w-full" variant={stateVariant}>
            {stateLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">
              {courseMessages("labels.credits")}
            </span>
            <span>{course.credits}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">
              {courseMessages("labels.section")}
            </span>
            <span>{offering.section}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">
              {courseMessages("labels.instructor")}
            </span>
            <span className="text-right">{offering.instructor.full_name}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">
              {courseMessages("labels.academicTerm")}
            </span>

            <span className="text-right">
              {semester} {offering.academic_term.year}
            </span>
          </div>
        </div>

        {activeAssessment && (
          <div className="rounded-lg border bg-muted/40 p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ClipboardCheck className="size-4" />
              {courseMessages("activeAssessment")}
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {assessmentMessages(`modeAssessment.${activeAssessment.mode}`)}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Link
          href={`/student/courses/${enrollment.id}`}
          className={cn(
            buttonVariants({
              variant: activeAssessment ? "default" : "outline",
            }),
            "w-full",
          )}
        >
          {activeAssessment ? (
            <>
              <ClipboardCheck />
              {courseMessages("continueAssessment")}
            </>
          ) : (
            <>
              <BookOpen />
              {courseMessages("openCourse")}
            </>
          )}

          <ArrowRight className="ml-auto" />
        </Link>
      </CardFooter>
    </Card>
  );
}
