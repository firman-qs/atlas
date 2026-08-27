"use client";

import { useTranslations } from "next-intl";
import { AtlasRichTextViewer } from "@/components/rich-text/atlas-rich-text-viewer";
import { Button } from "@/components/ui/button";
import { mediaUrl, uploadMedia } from "@/features/media/api/media-client";
import type { MediaPurpose } from "@/features/media/types";
import { cn } from "@/lib/utils";
import {
  defaultValueCtx,
  Editor,
  editorViewCtx,
  editorViewOptionsCtx,
  rootCtx,
} from "@milkdown/kit/core";
import { history } from "@milkdown/kit/plugin/history";
import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import { getMarkdown, replaceAll } from "@milkdown/kit/utils";
import {
  Milkdown,
  MilkdownProvider,
  useEditor,
  useInstance,
} from "@milkdown/react";
import { Eye, EyeOff, ImagePlus, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface AtlasRichTextEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  mediaPurpose?: MediaPurpose;
}

interface AtlasMilkdownEditorProps {
  initialValue: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  disabled: boolean;
}

function AtlasMilkdownEditor({
  initialValue,
  onChange,
  placeholder,
  disabled,
}: AtlasMilkdownEditorProps) {
  const t = useTranslations("richText");
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEditor(
    (root) =>
      Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, root);
          ctx.set(defaultValueCtx, initialValue);

          ctx.update(editorViewOptionsCtx, (previous) => ({
            ...previous,
            editable: () => !disabled,
            attributes: {
              ...previous.attributes,
              class: "atlas-prosemirror",
              "aria-label": placeholder ?? t("editorAriaLabel"),
              "data-placeholder": placeholder ?? "",
            },
          }));

          ctx
            .get(listenerCtx)
            .markdownUpdated((_ctx, markdown, previousMarkdown) => {
              if (markdown !== previousMarkdown) {
                onChangeRef.current(markdown);
              }
            });
        })
        .use(commonmark)
        .use(history)
        .use(listener),
    [disabled, initialValue, placeholder, t],
  );

  return <Milkdown />;
}

interface EditorStateSynchronizerProps {
  value: string;
  disabled: boolean;
}

function EditorStateSynchronizer({
  value,
  disabled,
}: EditorStateSynchronizerProps) {
  const [loading, getEditor] = useInstance();

  useEffect(() => {
    if (loading) {
      return;
    }

    const editor = getEditor();

    if (!editor) {
      return;
    }

    const currentMarkdown = editor.action(getMarkdown());

    if (currentMarkdown !== value) {
      editor.action(replaceAll(value));
    }
  }, [getEditor, loading, value]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const editor = getEditor();

    if (!editor) {
      return;
    }

    editor.action((ctx) => {
      const view = ctx.get(editorViewCtx);

      view.setProps({
        ...view.props,
        editable: () => !disabled,
      });
    });
  }, [disabled, getEditor, loading]);

  return null;
}

export function AtlasRichTextEditor({
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
  mediaPurpose,
}: AtlasRichTextEditorProps) {
  const t = useTranslations("richText");
  /*
   * Capture only the value used to create the Milkdown document.
   *
   * Subsequent controlled value changes are synchronized by
   * EditorStateSynchronizer, so the editor instance itself does not need
   * to be recreated when the parent value changes.
   */
  const [initialValue] = useState(() => value);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  async function handleImageSelected(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    // Allow selecting the same file again after this attempt.
    event.target.value = "";

    if (!file || !mediaPurpose || disabled) {
      return;
    }

    setImageUploadError(null);
    setIsUploadingImage(true);

    try {
      const media = await uploadMedia(file, mediaPurpose);

      const altText = file.name.replace(/\.[^.]+$/, "").trim() || "Figure";

      const imageMarkdown = `![${altText}](${mediaUrl(media.id)})`;

      const nextValue = value.trimEnd()
        ? `${value.trimEnd()}\n\n${imageMarkdown}`
        : imageMarkdown;

      onChange(nextValue);
    } catch (error) {
      setImageUploadError(
        error instanceof Error ? error.message : t("uploadError"),
      );
    } finally {
      setIsUploadingImage(false);
    }
  }

  return (
    <div
      className={cn(
        "atlas-rich-text-editor overflow-hidden rounded-lg border bg-background",
        disabled && "opacity-60",
        className,
      )}
      aria-disabled={disabled}
    >
      <div className="flex flex-wrap items-center justify-end gap-1 border-b bg-muted/20 px-2 py-1.5">
        {mediaPurpose && (
          <>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              disabled={disabled || isUploadingImage}
              onChange={handleImageSelected}
              aria-label={t("chooseImage")}
            />

            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={disabled || isUploadingImage}
              onClick={() => imageInputRef.current?.click()}
            >
              {isUploadingImage ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <ImagePlus />
              )}

              {isUploadingImage ? t("uploading") : t("addImage")}
            </Button>
          </>
        )}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setIsPreviewVisible((visible) => !visible)}
          aria-expanded={isPreviewVisible}
        >
          {isPreviewVisible ? <EyeOff /> : <Eye />}

          {isPreviewVisible ? t("hidePreview") : t("preview")}
        </Button>
      </div>

      {imageUploadError && (
        <div
          role="alert"
          className="border-b bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {imageUploadError}
        </div>
      )}

      <MilkdownProvider>
        <AtlasMilkdownEditor
          initialValue={initialValue}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />

        <EditorStateSynchronizer value={value} disabled={disabled} />
      </MilkdownProvider>

      {isPreviewVisible && (
        <div className="border-t bg-muted/10 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("renderedPreview")}
          </p>

          {value.trim() ? (
            <AtlasRichTextViewer value={value} />
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("nothingToPreview")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
