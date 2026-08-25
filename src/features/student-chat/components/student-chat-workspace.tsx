"use client";

import { ArrowLeft, Bot } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { ChatConversation } from "@/features/student-chat/components/chat-conversation";
import { ChatEmptyState } from "@/features/student-chat/components/chat-empty-state";
import { ChatSessionSidebar } from "@/features/student-chat/components/chat-session-sidebar";
import {
  useChatSessions,
  useCreateChatSession,
} from "@/features/student-chat/queries";

import { useStudentEnrollment } from "@/features/student-course/queries";

import { cn } from "@/lib/utils";

interface StudentChatWorkspaceProps {
  enrollmentId: string;
  selectedChatSessionId?: string;
}

export function StudentChatWorkspace({
  enrollmentId,
  selectedChatSessionId,
}: StudentChatWorkspaceProps) {
  const router = useRouter();
  const enrollmentQuery = useStudentEnrollment(enrollmentId);
  const learningRecordId = enrollmentQuery.data?.learning_record?.id ?? "";
  const sessionsQuery = useChatSessions(learningRecordId);
  const createSession = useCreateChatSession(learningRecordId);

  async function handleCreateSession() {
    if (!learningRecordId) {
      return;
    }

    const session = await createSession.mutateAsync();

    router.push(`/student/courses/${enrollmentId}/chat/${session.id}`);
  }

  if (enrollmentQuery.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-[38rem] w-full" />
      </div>
    );
  }

  if (enrollmentQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {enrollmentQuery.error instanceof Error
            ? enrollmentQuery.error.message
            : "Unable to load this course."}
        </AlertDescription>
      </Alert>
    );
  }

  const enrollment = enrollmentQuery.data;
  const learningRecord = enrollment.learning_record;

  if (!learningRecord) {
    return (
      <div className="space-y-4">
        <Link
          href={`/student/courses/${enrollmentId}`}
          className={cn(
            buttonVariants({
              variant: "ghost",
              size: "sm",
            }),
            "-ml-3",
          )}
        >
          <ArrowLeft />
          Back to course
        </Link>

        <Alert>
          <AlertDescription>
            Start learning in this course before using the AI Tutor.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (sessionsQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {sessionsQuery.error instanceof Error
            ? sessionsQuery.error.message
            : "Unable to load your chat sessions."}
        </AlertDescription>
      </Alert>
    );
  }

  const course = enrollment.course_offering.course;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            href={`/student/courses/${enrollmentId}`}
            className={cn(
              buttonVariants({
                variant: "ghost",
                size: "icon",
              }),
              "mt-0.5",
            )}
            aria-label="Back to course"
          >
            <ArrowLeft />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <Bot className="size-5" />

              <h1 className="text-2xl font-semibold tracking-tight">
                AI Tutor
              </h1>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {course.code} · {course.title}
            </p>
          </div>
        </div>
      </div>

      {createSession.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {createSession.error instanceof Error
              ? createSession.error.message
              : "Unable to create a new chat session."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid min-h-[38rem] overflow-hidden rounded-xl border bg-background md:grid-cols-[17rem_minmax(0,1fr)]">
        {sessionsQuery.isPending ? (
          <div className="space-y-3 border-r p-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-8 w-3/4" />
          </div>
        ) : (
          <ChatSessionSidebar
            enrollmentId={enrollmentId}
            sessions={sessionsQuery.data.pages.flatMap((page) => page.items)}
            selectedChatSessionId={selectedChatSessionId}
            isCreating={createSession.isPending}
            hasMoreSessions={sessionsQuery.hasNextPage}
            isLoadingMoreSessions={sessionsQuery.isFetchingNextPage}
            onLoadMoreSessions={() => {
              void sessionsQuery.fetchNextPage();
            }}
            onCreateSession={() => {
              void handleCreateSession();
            }}
          />
        )}

        {selectedChatSessionId ? (
          <ChatConversation
            key={selectedChatSessionId}
            enrollmentId={enrollmentId}
            chatSessionId={selectedChatSessionId}
            learningRecordId={learningRecord.id}
          />
        ) : (
          <ChatEmptyState
            isCreating={createSession.isPending}
            onCreateSession={() => {
              void handleCreateSession();
            }}
          />
        )}
      </div>
    </div>
  );
}
