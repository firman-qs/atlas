"use client";

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
      setUploadError("A chat message can include at most 2 images.");

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
        error instanceof Error ? error.message : "Unable to upload this image.",
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
    <div className="border-t bg-background p-4">
      {createMessage.isError && (
        <Alert variant="destructive" className="mb-3">
          <AlertDescription>
            {createMessage.error instanceof Error
              ? createMessage.error.message
              : "Unable to send your message."}
          </AlertDescription>
        </Alert>
      )}

      {uploadError && (
        <Alert variant="destructive" className="mb-3">
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.media.id}
              className="flex min-w-0 items-center gap-3 rounded-lg border bg-muted/30 p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachment.url}
                alt={attachment.alt}
                className="size-14 rounded-md border object-cover"
              />

              <div className="min-w-0 max-w-40">
                <p className="truncate text-sm font-medium">
                  {attachment.media.original_filename}
                </p>

                <p className="text-xs text-muted-foreground">Image attached</p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove ${attachment.alt}`}
                onClick={() => removeAttachment(attachment.media.id)}
                disabled={createMessage.isPending}
              >
                <X />
              </Button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          aria-label="Attach image"
          className="sr-only"
          onChange={(event) => {
            void handleAttachmentChange(event);
          }}
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Choose image"
          disabled={
            isUploading || createMessage.isPending || attachments.length >= 2
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

        <Textarea
          aria-label="Message your ATLAS tutor"
          placeholder="Ask about what you're learning..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={4000}
          disabled={createMessage.isPending}
          className="min-h-20 resize-none"
        />

        <Button
          type="submit"
          size="icon"
          aria-label="Send message"
          disabled={!canSend}
        >
          {createMessage.isPending ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Send />
          )}
        </Button>
      </form>

      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>
          ATLAS uses your course curriculum and learning progress as context.
        </p>

        <span
          className={
            messageContent.length > MAX_CHAT_MESSAGE_CHARS
              ? "text-destructive"
              : undefined
          }
        >
          {messageContent.length}/{MAX_CHAT_MESSAGE_CHARS}
        </span>
      </div>
    </div>
  );
}
