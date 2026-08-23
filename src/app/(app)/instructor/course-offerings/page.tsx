import { InstructorCourseOfferingList } from "@/features/instructor-course-offerings/components/instructor-course-offering-list";

export default function InstructorCourseOfferingsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Course Offerings
        </h1>

        <p className="mt-1 text-muted-foreground">
          Manage your assigned course offerings, enrolled students, and their
          learning activity.
        </p>
      </div>

      <InstructorCourseOfferingList />
    </div>
  );
}
