"use client";

import { LoaderCircle, MessageSquare, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ChatSession } from "@/features/student-chat/types";
import { cn } from "@/lib/utils";

interface ChatSessionSidebarProps {
  enrollmentId: string;
  sessions: ChatSession[];
  selectedChatSessionId?: string;
  isCreating: boolean;
  hasMoreSessions: boolean;
  isLoadingMoreSessions: boolean;
  onCreateSession: () => void;
  onLoadMoreSessions: () => void;
}

export function ChatSessionSidebar({
  enrollmentId,
  sessions,
  selectedChatSessionId,
  isCreating,
  hasMoreSessions,
  isLoadingMoreSessions,
  onLoadMoreSessions,
  onCreateSession,
}: ChatSessionSidebarProps) {
  return (
    <aside className="flex min-h-0 flex-col border-r bg-muted/20">
      <div className="p-4">
        <Button
          type="button"
          className="w-full justify-start"
          onClick={onCreateSession}
          disabled={isCreating}
        >
          {isCreating ? <LoaderCircle className="animate-spin" /> : <Plus />}

          {isCreating ? "Creating..." : "New chat"}
        </Button>
      </div>

      <Separator />

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Recent chats
        </p>

        {sessions.length === 0 ? (
          <p className="px-2 py-4 text-sm text-muted-foreground">
            No conversations yet.
          </p>
        ) : (
          <nav className="space-y-1">
            {sessions.map((session) => {
              const selected = session.id === selectedChatSessionId;

              return (
                <Link
                  key={session.id}
                  href={`/student/courses/${enrollmentId}/chat/${session.id}`}
                  className={cn(
                    "flex min-w-0 items-center gap-2 rounded-md px-3 py-2",
                    "text-sm transition-colors",
                    selected
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <MessageSquare className="size-4 shrink-0" />

                  <span className="truncate">{session.title}</span>
                </Link>
              );
            })}

            {hasMoreSessions && (
              <div className="pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  disabled={isLoadingMoreSessions}
                  onClick={onLoadMoreSessions}
                >
                  {isLoadingMoreSessions && (
                    <LoaderCircle className="animate-spin" />
                  )}
                  Load more chats
                </Button>
              </div>
            )}
          </nav>
        )}
      </div>
    </aside>
  );
}
