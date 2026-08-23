import { AdminQuestionEdit } from "@/features/admin-questions/components/admin-question-edit";

interface AdminQuestionEditPageProps {
  params: Promise<{
    question_id: string;
  }>;
}

export default async function AdminQuestionEditPage({
  params,
}: AdminQuestionEditPageProps) {
  const { question_id } = await params;

  return (
    <div className="mx-auto max-w-7xl">
      <AdminQuestionEdit questionId={question_id} />
    </div>
  );
}
