import { StudentChatWorkspace } from "@/features/student-chat/components/student-chat-workspace";

interface StudentChatPageProps {
  params: Promise<{
    enrollment_id: string;
  }>;
}

export default async function StudentChatPage({
  params,
}: StudentChatPageProps) {
  const { enrollment_id } = await params;

  return (
    <div className="mx-auto max-w-7xl">
      <StudentChatWorkspace enrollmentId={enrollment_id} />
    </div>
  );
}
