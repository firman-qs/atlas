import { ArrowRight, BookOpen, ClipboardCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

interface CourseCardProps {
  enrollment: StudentEnrollment;
}

function formatSemester(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function CourseCard({ enrollment }: CourseCardProps) {
  const offering = enrollment.course_offering;
  const course = offering.course;
  const learningRecord = enrollment.learning_record;
  const activeAssessment = learningRecord?.active_assessment ?? null;

  let stateLabel = "Not started";
  let stateVariant: "secondary" | "default" | "outline" = "secondary";

  if (activeAssessment) {
    stateLabel = "Assessment in progress";
    stateVariant = "default";
  } else if (learningRecord?.completed_at) {
    stateLabel = "Completed";
    stateVariant = "outline";
  } else if (learningRecord) {
    stateLabel = "Learning in progress";
    stateVariant = "outline";
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">
              {course.code}
            </p>

            <CardTitle className="mt-1 text-xl">{course.title}</CardTitle>
          </div>

          <Badge variant={stateVariant}>{stateLabel}</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Credits</span>
            <span>{course.credits}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Section</span>
            <span>{offering.section}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Instructor</span>
            <span className="text-right">{offering.instructor.full_name}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Academic term</span>

            <span className="text-right">
              {formatSemester(offering.academic_term.semester)}{" "}
              {offering.academic_term.year}
            </span>
          </div>
        </div>

        {activeAssessment && (
          <div className="rounded-lg border bg-muted/40 p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ClipboardCheck className="size-4" />
              Active assessment
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {activeAssessment.mode === "progress"
                ? "Progress assessment"
                : "Review assessment"}
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
              Continue assessment
            </>
          ) : (
            <>
              <BookOpen />
              Open course
            </>
          )}

          <ArrowRight className="ml-auto" />
        </Link>
      </CardFooter>
    </Card>
  );
}
