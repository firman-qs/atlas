import { QuestionBankDetail } from "@/features/admin-question-banks/components/question-bank-detail";

interface AdminQuestionBankPageProps {
  params: Promise<{
    question_bank_id: string;
  }>;
}

export default async function AdminQuestionBankPage({
  params,
}: AdminQuestionBankPageProps) {
  const { question_bank_id } = await params;

  return (
    <div className="mx-auto max-w-7xl">
      <QuestionBankDetail questionBankId={question_bank_id} />
    </div>
  );
}
