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

  return <StudentChatWorkspace enrollmentId={enrollment_id} />;
}
