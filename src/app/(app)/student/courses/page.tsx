import { CourseList } from "@/features/student-courses/components/course-list";
import { getTranslations } from "next-intl/server";

export default async function StudentCoursesPage() {
  const messages = await getTranslations("student");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {messages("myCourses")}
        </h1>

        <p className="mt-1 text-muted-foreground">
          {messages("myCoursesDescription")}
        </p>
      </div>

      <CourseList />
    </div>
  );
}
