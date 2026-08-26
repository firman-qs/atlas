import {
  Bot,
  Maximize2,
  MessageSquarePlus,
  Minimize2,
  PanelLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface ChatEmptyStateProps {
  courseTitle: string;
  isCreating: boolean;
  isFullscreen: boolean;
  onCreateSession: () => void;
  onOpenSessions: () => void;
  onToggleFullscreen: () => void;
}

export function ChatEmptyState({
  courseTitle,
  isCreating,
  isFullscreen,
  onCreateSession,
  onOpenSessions,
  onToggleFullscreen,
}: ChatEmptyStateProps) {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="xl:hidden"
            aria-label="Open chats"
            onClick={onOpenSessions}
          >
            <PanelLeft />
          </Button>

          <div className="min-w-0">
            <h2 className="font-semibold tracking-tight">AI Tutor</h2>

            <p className="truncate text-xs text-muted-foreground">
              {courseTitle}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize2 /> : <Maximize2 />}
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full border bg-muted">
            <Bot className="size-6" />
          </div>

          <h3 className="mt-4 text-xl font-semibold">
            Learn with your ATLAS tutor
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Ask questions about this course, explore concepts you are learning,
            and continue earlier conversations with course-aware guidance.
          </p>

          <Button
            type="button"
            className="mt-5"
            onClick={onCreateSession}
            disabled={isCreating}
          >
            <MessageSquarePlus />

            {isCreating ? "Creating..." : "Start a new chat"}
          </Button>
        </div>
      </div>
    </section>
  );
}
