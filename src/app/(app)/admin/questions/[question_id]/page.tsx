import { AdminQuestionDetail } from "@/features/admin-questions/components/admin-question-detail";

interface AdminQuestionPageProps {
  params: Promise<{
    question_id: string;
  }>;
}

export default async function AdminQuestionPage({
  params,
}: AdminQuestionPageProps) {
  const { question_id } = await params;

  return (
    <div className="mx-auto max-w-7xl">
      <AdminQuestionDetail questionId={question_id} />
    </div>
  );
}
