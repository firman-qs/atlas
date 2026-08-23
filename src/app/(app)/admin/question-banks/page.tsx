import { CreateQuestionBankForm } from "@/features/admin-question-banks/components/create-question-bank-form";
import { QuestionBankList } from "@/features/admin-question-banks/components/question-bank-list";

export default function AdminQuestionBanksPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Question Banks
        </h1>

        <p className="mt-1 text-muted-foreground">
          Organize assessment questions into controlled question pools and
          manage which banks students may select.
        </p>
      </div>

      <CreateQuestionBankForm />

      <QuestionBankList />
    </div>
  );
}
