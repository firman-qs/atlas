"use client";

import { useTranslations } from "next-intl";
import { ImagePlus, LoaderCircle, Send, X } from "lucide-react";
import { ChangeEvent, SubmitEvent, useRef, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { mediaUrl, uploadMedia } from "@/features/media/api/media-client";
import type { UploadedMedia } from "@/features/media/types";

import { useCreateChatMessage } from "@/features/student-chat/queries";

const MAX_CHAT_MESSAGE_CHARS = 4000;

interface ChatComposerProps {
  chatSessionId: string;
  learningRecordId: string;
}

interface ChatAttachment {
  media: UploadedMedia;
  url: string;
  alt: string;
}

function buildChatMessageContent(
  content: string,
  attachments: ChatAttachment[],
): string {
  const parts: string[] = [];

  const normalizedContent = content.trim();

  if (normalizedContent) {
    parts.push(normalizedContent);
  }

  for (const attachment of attachments) {
    parts.push(`![${attachment.alt}](${attachment.url})`);
  }

  return parts.join("\n\n");
}

export function ChatComposer({
  chatSessionId,
  learningRecordId,
}: ChatComposerProps) {
  const t = useTranslations("chat.composer");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createMessage = useCreateChatMessage(chatSessionId, learningRecordId);

  const messageContent = buildChatMessageContent(content, attachments);

  const canSend =
    !createMessage.isPending &&
    !isUploading &&
    messageContent.length > 0 &&
    messageContent.length <= MAX_CHAT_MESSAGE_CHARS;

  async function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    // Allow selecting the same file again later.
    event.target.value = "";

    if (!file) {
      return;
    }

    if (attachments.length >= 2) {
      setUploadError(t("maxImagesError"));

      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const media = await uploadMedia(file, "chat");
      const alt = file.name.replace(/\.[^.]+$/, "").trim() || "chat image";

      setAttachments((current) => [
        ...current,
        {
          media,
          url: mediaUrl(media.id),
          alt,
        },
      ]);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : t("uploadError"),
      );
    } finally {
      setIsUploading(false);
    }
  }

  function removeAttachment(mediaId: string) {
    setAttachments((current) =>
      current.filter((attachment) => attachment.media.id !== mediaId),
    );

    setUploadError(null);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSend) {
      return;
    }

    try {
      await createMessage.mutateAsync(messageContent);

      setContent("");
      setAttachments([]);
      setUploadError(null);
    } catch {
      // Preserve text and attachments so the student
      // can retry the failed turn.
    }
  }

  return (
    <div className="shrink-0 bg-linear-to-t from-background via-background/95 to-transparent px-3 pb-3 pt-5 sm:px-4">
      {createMessage.isError && (
        <Alert variant="destructive" className="mb-3">
          <AlertDescription>
            {createMessage.error instanceof Error
              ? createMessage.error.message
              : t("sendError")}
          </AlertDescription>
        </Alert>
      )}

      {uploadError && (
        <Alert variant="destructive" className="mb-3">
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          aria-label={t("attachImage")}
          className="sr-only"
          onChange={(event) => {
            void handleAttachmentChange(event);
          }}
        />

        <div
          className="
            overflow-hidden rounded-2xl border bg-background/95 shadow-sm
            backdrop-blur-sm
            transition-[border-color,box-shadow] duration-150
            focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20
            motion-reduce:transition-none
          "
        >
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-3 pt-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.media.id}
                  className="group relative overflow-hidden rounded-xl border bg-muted/30"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachment.url}
                    alt={attachment.alt}
                    className="size-20 object-cover"
                  />

                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    aria-label={t("removeImage", { name: attachment.alt })}
                    className="absolute right-1 top-1 size-6 rounded-full shadow-sm"
                    onClick={() => removeAttachment(attachment.media.id)}
                    disabled={createMessage.isPending}
                  >
                    <X />
                  </Button>

                  <div className="max-w-20 px-2 py-1.5">
                    <p className="truncate text-[11px] text-muted-foreground">
                      {attachment.media.original_filename}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Textarea
            aria-label={t("ariaLabel")}
            placeholder={t("placeholder")}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={4000}
            disabled={createMessage.isPending}
            className="
              max-h-36 min-h-12 resize-none overflow-y-auto
              border-0 bg-transparent px-4 pb-1 pt-3 shadow-none
              focus-visible:border-transparent focus-visible:ring-0
              dark:bg-transparent
            "
          />

          <div className="flex items-center justify-between gap-3 px-2.5 pb-2">
            <div className="flex min-w-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("chooseImage")}
                disabled={
                  isUploading ||
                  createMessage.isPending ||
                  attachments.length >= 2
                }
                onClick={() => {
                  fileInputRef.current?.click();
                }}
              >
                {isUploading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <ImagePlus />
                )}
              </Button>

              <span className="hidden truncate text-xs text-muted-foreground sm:block">
                {t("addImageHint")}
              </span>
            </div>

            <Button
              type="submit"
              size="icon"
              aria-label={t("sendMessage")}
              disabled={!canSend}
              className="rounded-full"
            >
              {createMessage.isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Send />
              )}
            </Button>
          </div>
        </div>

        <div className="mt-1 flex items-center justify-between gap-3 px-2 text-[10px] text-muted-foreground/80">
          <p className="truncate">
            {t("contextHint")}
          </p>

          <span
            className={
              messageContent.length > MAX_CHAT_MESSAGE_CHARS
                ? "shrink-0 text-destructive"
                : "shrink-0"
            }
          >
            {messageContent.length}/{MAX_CHAT_MESSAGE_CHARS}
          </span>
        </div>
      </form>
    </div>
  );
}
