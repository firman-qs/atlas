import { Bot, MessageSquarePlus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ChatEmptyStateProps {
  isCreating: boolean;
  onCreateSession: () => void;
}

export function ChatEmptyState({
  isCreating,
  onCreateSession,
}: ChatEmptyStateProps) {
  return (
    <div className="flex min-h-[32rem] flex-1 items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full border bg-muted">
          <Bot className="size-6" />
        </div>

        <h2 className="mt-4 text-xl font-semibold">
          Learn with your ATLAS tutor
        </h2>

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
  );
}
