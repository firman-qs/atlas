import { useTranslations } from "next-intl";
import {
  Maximize2,
  MessageSquarePlus,
  Minimize2,
  PanelLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuthMascot } from "@/features/auth/components/auth-mascot";

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
  const t = useTranslations("chat");

  return (
    <section className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="absolute inset-x-0 top-0 z-20 flex shrink-0 items-center justify-between gap-3 border-b border-border/80 bg-background/80 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/65 sm:px-5">
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
            <h2 className="font-semibold tracking-tight">{t("aiTutor")}</h2>

            <p className="truncate text-xs text-muted-foreground">
              {courseTitle}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={isFullscreen ? t("actions.exitFullscreen") : t("actions.enterFullscreen")}
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize2 /> : <Maximize2 />}
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center p-6 pt-20">
        <div className="max-w-md text-center flex flex-col items-center">
          {/* Interactive 3D ATLAS Mascot */}
          <div className="w-full flex justify-center mb-1">
            <AuthMascot
              size="md"
              expression={isCreating ? "submitting" : "idle"}
            />
          </div>

          <h3 className="text-xl font-bold tracking-tight sm:text-2xl text-foreground">
            {t("learnWithTutor")}
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-sm">
            {t("learnWithTutorPrompt")}
          </p>

          <Button
            type="button"
            size="lg"
            className="mt-6 rounded-full px-6 font-medium shadow-sm transition-all hover:shadow-md"
            onClick={onCreateSession}
            disabled={isCreating}
          >
            <MessageSquarePlus className="mr-1.5 size-4" />
            {isCreating ? t("creating") : t("startNewChat")}
          </Button>
        </div>
      </div>
    </section>
  );
}
