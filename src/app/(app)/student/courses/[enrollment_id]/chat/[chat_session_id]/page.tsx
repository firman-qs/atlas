import { StudentChatWorkspace } from "@/features/student-chat/components/student-chat-workspace";

interface StudentChatSessionPageProps {
  params: Promise<{
    enrollment_id: string;
    chat_session_id: string;
  }>;
}

export default async function StudentChatSessionPage({
  params,
}: StudentChatSessionPageProps) {
  const { enrollment_id, chat_session_id } = await params;

  return (
    <div className="mx-auto max-w-7xl">
      <StudentChatWorkspace
        enrollmentId={enrollment_id}
        selectedChatSessionId={chat_session_id}
      />
    </div>
  );
}
