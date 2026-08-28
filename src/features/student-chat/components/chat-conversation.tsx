"use client";

import { AtlasRichTextViewer } from "@/components/rich-text/atlas-rich-text-viewer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useArchiveChatSession,
  useChatMessages,
  useChatSession,
  useUpdateChatSession,
} from "@/features/student-chat/queries";
import {
  Archive,
  LoaderCircle,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  PanelLeft,
  Pencil,
  User,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChatComposer } from "./chat-composer";

const AUTO_FOLLOW_THRESHOLD_PX = 100;

interface ChatConversationProps {
  enrollmentId: string;
  chatSessionId: string;
  learningRecordId: string;
  courseTitle: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSessions: () => void;
}

export function ChatConversation({
  enrollmentId,
  chatSessionId,
  learningRecordId,
  courseTitle,
  isFullscreen,
  onToggleFullscreen,
  onOpenSessions,
}: ChatConversationProps) {
  const t = useTranslations("chat");
  const common = useTranslations("common");
  const router = useRouter();

  const sessionQuery = useChatSession(chatSessionId);
  const messagesQuery = useChatMessages(chatSessionId);

  const [renameOpen, setRenameOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [title, setTitle] = useState("");

  const messageScrollRef = useRef<HTMLDivElement>(null);

  const pendingHistoryScrollRef = useRef<{
    scrollHeight: number;
    scrollTop: number;
  } | null>(null);

  const didInitializeScrollRef = useRef(false);

  const previousScrollHeightRef = useRef<number | null>(null);

  const updateSession = useUpdateChatSession(chatSessionId, learningRecordId);
  const archiveSession = useArchiveChatSession(chatSessionId, learningRecordId);

  useEffect(() => {
    if (
      didInitializeScrollRef.current ||
      sessionQuery.isPending ||
      sessionQuery.isError ||
      messagesQuery.isPending ||
      messagesQuery.isError
    ) {
      return;
    }

    const scroller = messageScrollRef.current;

    if (!scroller) {
      return;
    }

    const scrollHeight = scroller.scrollHeight;
    scroller.scrollTop = scrollHeight;
    previousScrollHeightRef.current = scrollHeight;
    didInitializeScrollRef.current = true;
  }, [
    sessionQuery.isPending,
    sessionQuery.isError,
    messagesQuery.isPending,
    messagesQuery.isError,
    messagesQuery.data,
  ]);

  useEffect(() => {
    if (
      !didInitializeScrollRef.current ||
      pendingHistoryScrollRef.current !== null ||
      sessionQuery.isPending ||
      sessionQuery.isError ||
      messagesQuery.isPending ||
      messagesQuery.isError
    ) {
      return;
    }

    const scroller = messageScrollRef.current;

    if (!scroller) {
      return;
    }

    const previousScrollHeight = previousScrollHeightRef.current;
    const currentScrollHeight = scroller.scrollHeight;

    if (previousScrollHeight === null) {
      previousScrollHeightRef.current = currentScrollHeight;
      return;
    }

    const previousDistanceFromBottom =
      previousScrollHeight - scroller.clientHeight - scroller.scrollTop;

    const wasNearBottom =
      previousDistanceFromBottom <= AUTO_FOLLOW_THRESHOLD_PX;

    if (currentScrollHeight > previousScrollHeight && wasNearBottom) {
      scroller.scrollTop = currentScrollHeight;
    }

    previousScrollHeightRef.current = currentScrollHeight;
  }, [
    sessionQuery.isPending,
    sessionQuery.isError,
    messagesQuery.isPending,
    messagesQuery.isError,
    messagesQuery.data,
  ]);

  async function handleRename() {
    const normalizedTitle = title.trim();

    if (!normalizedTitle || updateSession.isPending) {
      return;
    }

    try {
      await updateSession.mutateAsync(normalizedTitle);
      setRenameOpen(false);
    } catch {
      // Mutation error is rendered inside the dialog.
    }
  }

  async function handleArchive() {
    if (archiveSession.isPending) {
      return;
    }

    try {
      await archiveSession.mutateAsync();

      router.push(`/student/courses/${enrollmentId}/chat`);
    } catch {
      // Mutation error remains visible in the confirmation dialog.
    }
  }

  async function handleLoadOlderMessages() {
    const scroller = messageScrollRef.current;

    if (
      !scroller ||
      !messagesQuery.hasNextPage ||
      messagesQuery.isFetchingNextPage
    ) {
      return;
    }

    pendingHistoryScrollRef.current = {
      scrollHeight: scroller.scrollHeight,
      scrollTop: scroller.scrollTop,
    };

    await messagesQuery.fetchNextPage();

    requestAnimationFrame(() => {
      const currentScroller = messageScrollRef.current;
      const previous = pendingHistoryScrollRef.current;

      if (!currentScroller || !previous) {
        return;
      }

      const currentScrollHeight = currentScroller.scrollHeight;
      const addedHeight = currentScrollHeight - previous.scrollHeight;
      currentScroller.scrollTop = previous.scrollTop + addedHeight;
      previousScrollHeightRef.current = currentScrollHeight;
      pendingHistoryScrollRef.current = null;
    });
  }

  if (sessionQuery.isPending || messagesQuery.isPending) {
    return (
      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="border-b px-5 py-4">
          <Skeleton className="h-6 w-48" />
        </div>

        <div className="space-y-6 p-5">
          <Skeleton className="ml-auto h-20 w-2/3" />
          <Skeleton className="h-28 w-3/4" />
        </div>
      </section>
    );
  }

  if (sessionQuery.isError) {
    return (
      <section className="p-5">
        <Alert variant="destructive">
          <AlertDescription>
            {sessionQuery.error instanceof Error
              ? sessionQuery.error.message
              : t("errors.loadSession")}
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  if (messagesQuery.isError) {
    return (
      <section className="p-5">
        <Alert variant="destructive">
          <AlertDescription>
            {messagesQuery.error instanceof Error
              ? messagesQuery.error.message
              : t("errors.loadMessages")}
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  const session = sessionQuery.data;

  const messages = messagesQuery.data.pages
    .slice()
    .reverse()
    .flatMap((page) => page.items);

  return (
    <section className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-3 border-b border-border/80 bg-background/80 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/65 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="xl:hidden"
            aria-label={t("actions.openChats")}
            onClick={onOpenSessions}
          >
            <PanelLeft />
          </Button>

          <div className="min-w-0">
            <h2 className="truncate font-semibold tracking-tight">
              {session.title}
            </h2>

            <p className="truncate text-xs text-muted-foreground">
              {courseTitle} · {t("aiTutor")}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={isFullscreen ? t("actions.exitFullscreen") : t("actions.enterFullscreen")}
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize2 /> : <Maximize2 />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("actions.sessionActions")}
                />
              }
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setTitle(session.title);
                  setRenameOpen(true);
                }}
              >
                <Pencil />
                {t("actions.rename")}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  setArchiveOpen(true);
                }}
              >
                <Archive />
                {t("actions.archive")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div
        ref={messageScrollRef}
        data-testid="chat-message-scroll"
        className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5"
      >
        {messagesQuery.hasNextPage && (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={messagesQuery.isFetchingNextPage}
              onClick={() => {
                void handleLoadOlderMessages();
              }}
            >
              {messagesQuery.isFetchingNextPage && (
                <LoaderCircle className="animate-spin" />
              )}
              {t("loadOlderMessages")}
            </Button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex min-h-72 items-center justify-center text-center">
            <div className="max-w-md">
              <div className="mx-auto relative size-12 overflow-hidden">
                <Image
                  src="/mascot.png"
                  alt=""
                  aria-hidden="true"
                  width={48}
                  height={48}
                  className="size-full object-contain drop-shadow-xs"
                />
              </div>

              <p className="mt-3 font-medium">{t("startConversation")}</p>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {t("startConversationPrompt")}
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.role === "user";

            return (
              <article
                key={message.id}
                className={isUser ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    isUser
                      ? "max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-primary-foreground md:max-w-[75%]"
                      : "flex max-w-[90%] gap-3 md:max-w-[80%]"
                  }
                >
                  {!isUser && (
                    <div className="mt-0.5 relative size-8 shrink-0 overflow-hidden">
                      <Image
                        src="/mascot.png"
                        alt=""
                        aria-hidden="true"
                        width={32}
                        height={32}
                        className="size-full object-contain drop-shadow-xs"
                      />
                    </div>
                  )}

                  {isUser ? (
                    <div className="flex gap-2">
                      <User className="mt-1 size-4 shrink-0 opacity-70" />

                      <AtlasRichTextViewer
                        value={message.content}
                        className="text-primary-foreground"
                      />
                    </div>
                  ) : (
                    <div className="min-w-0 flex-1">
                      <AtlasRichTextViewer value={message.content} />
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      <ChatComposer
        chatSessionId={chatSessionId}
        learningRecordId={learningRecordId}
      />

      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("archive.title")}</AlertDialogTitle>

            <AlertDialogDescription>
              {t("archive.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {archiveSession.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {archiveSession.error instanceof Error
                  ? archiveSession.error.message
                  : t("archive.error")}
              </AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiveSession.isPending}>
              {common("cancel")}
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={archiveSession.isPending}
              onClick={(event) => {
                event.preventDefault();
                void handleArchive();
              }}
            >
              {archiveSession.isPending && (
                <LoaderCircle className="animate-spin" />
              )}
              {t("archive.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={renameOpen}
        onOpenChange={(open) => {
          setRenameOpen(open);

          if (open) {
            setTitle(session.title);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rename.title")}</DialogTitle>

            <DialogDescription>
              {t("rename.description")}
            </DialogDescription>
          </DialogHeader>

          {updateSession.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {updateSession.error instanceof Error
                  ? updateSession.error.message
                  : t("rename.error")}
              </AlertDescription>
            </Alert>
          )}

          <Input
            aria-label={t("rename.inputLabel")}
            value={title}
            maxLength={255}
            disabled={updateSession.isPending}
            onChange={(event) => {
              setTitle(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleRename();
              }
            }}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={updateSession.isPending}
              onClick={() => {
                setRenameOpen(false);
              }}
            >
              {common("cancel")}
            </Button>

            <Button
              type="button"
              disabled={!title.trim() || updateSession.isPending}
              onClick={() => {
                void handleRename();
              }}
            >
              {updateSession.isPending && (
                <LoaderCircle className="animate-spin" />
              )}
              {t("rename.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
