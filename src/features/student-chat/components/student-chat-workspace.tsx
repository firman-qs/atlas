"use client";

import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ChatConversation } from "@/features/student-chat/components/chat-conversation";
import { ChatEmptyState } from "@/features/student-chat/components/chat-empty-state";
import { ChatSessionSidebar } from "@/features/student-chat/components/chat-session-sidebar";
import {
  useChatSessions,
  useCreateChatSession,
} from "@/features/student-chat/queries";
import { useStudentEnrollment } from "@/features/student-course/queries";
import { cn } from "@/lib/utils";
import { useChatFullscreen } from "./chat-fullscreen-provider";

interface StudentChatWorkspaceProps {
  enrollmentId: string;
  selectedChatSessionId?: string;
}

export function StudentChatWorkspace({
  enrollmentId,
  selectedChatSessionId,
}: StudentChatWorkspaceProps) {
  const t = useTranslations("chat");
  const router = useRouter();

  const [sessionsOpen, setSessionsOpen] = useState(false);
  const { isFullscreen, toggleFullscreen } = useChatFullscreen();

  const enrollmentQuery = useStudentEnrollment(enrollmentId);

  const learningRecordId = enrollmentQuery.data?.learning_record?.id ?? "";

  const sessionsQuery = useChatSessions(learningRecordId);
  const createSession = useCreateChatSession(learningRecordId);

  async function handleCreateSession() {
    if (!learningRecordId) {
      return;
    }

    const session = await createSession.mutateAsync();

    setSessionsOpen(false);

    router.push(`/student/courses/${enrollmentId}/chat/${session.id}`);
  }

  if (enrollmentQuery.isPending) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <Skeleton className="min-h-0 flex-1 rounded-xl" />
      </div>
    );
  }

  if (enrollmentQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {enrollmentQuery.error instanceof Error
            ? enrollmentQuery.error.message
            : t("errors.loadCourse")}
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
          {t("backToCourse")}
        </Link>

        <Alert>
          <AlertDescription>
            {t("startLearningFirst")}
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
            : t("errors.loadSessions")}
        </AlertDescription>
      </Alert>
    );
  }

  const course = enrollment.course_offering.course;

  const sessions =
    sessionsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const sessionSidebar = sessionsQuery.isPending ? (
    <div className="h-full space-y-3 bg-muted/20 p-4">
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-4/5" />
      <Skeleton className="h-8 w-3/4" />
    </div>
  ) : (
    <ChatSessionSidebar
      enrollmentId={enrollmentId}
      sessions={sessions}
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
  );

  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col",
        isFullscreen && "fixed inset-0 z-40 bg-background p-2 sm:p-4",
      )}
    >
      {createSession.isError && (
        <Alert variant="destructive" className="mb-3 shrink-0">
          <AlertDescription>
            {createSession.error instanceof Error
              ? createSession.error.message
              : t("errors.createSession")}
          </AlertDescription>
        </Alert>
      )}

      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 overflow-hidden border bg-background shadow-xs",
          "transition-[border-radius,box-shadow] duration-200 ease-out motion-reduce:transition-none",
          isFullscreen ? "rounded-lg shadow-lg" : "rounded-xl",
        )}
      >
        <div className="hidden w-64 shrink-0 border-r xl:block">
          {sessionSidebar}
        </div>

        {selectedChatSessionId ? (
          <ChatConversation
            key={selectedChatSessionId}
            enrollmentId={enrollmentId}
            chatSessionId={selectedChatSessionId}
            learningRecordId={learningRecord.id}
            courseTitle={course.title}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            onOpenSessions={() => {
              setSessionsOpen(true);
            }}
          />
        ) : (
          <ChatEmptyState
            courseTitle={course.title}
            isCreating={createSession.isPending}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            onOpenSessions={() => {
              setSessionsOpen(true);
            }}
            onCreateSession={() => {
              void handleCreateSession();
            }}
          />
        )}
      </div>

      <Sheet open={sessionsOpen} onOpenChange={setSessionsOpen}>
        <SheetContent
          side="left"
          className="w-[min(20rem,calc(100vw-2rem))] gap-0 p-0 xl:hidden"
        >
          <SheetHeader className="border-b">
            <SheetTitle>{t("chats")}</SheetTitle>

            <SheetDescription>
              {t("chatsDescription", { courseTitle: course.title })}
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1">{sessionSidebar}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
