"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { mediaUrl, uploadMedia } from "@/features/media/api/media-client";
import type { MediaPurpose } from "@/features/media/types";
import { cn } from "@/lib/utils";
import { Crepe } from "@milkdown/crepe";
import { commandsCtx, editorViewCtx } from "@milkdown/kit/core";
import {
  addBlockTypeCommand,
  blockquoteSchema,
  bulletListSchema,
  codeBlockSchema,
  headingSchema,
  orderedListSchema,
  setBlockTypeCommand,
  toggleEmphasisCommand,
  toggleStrongCommand,
  wrapInBlockTypeCommand,
} from "@milkdown/kit/preset/commonmark";
import { NodeSelection } from "@milkdown/kit/prose/state";
import { replaceAll } from "@milkdown/kit/utils";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  LoaderCircle,
  Quote,
  Sigma,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export interface AtlasRichTextEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  mediaPurpose?: MediaPurpose;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const crepeRef = useRef<Crepe | null>(null);
  const onChangeRef = useRef(onChange);
  const [initialValue] = useState(() => value);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const [initialPlaceholder] = useState(
    () => placeholder ?? t("editorAriaLabel"),
  );
  const [initialDisabled] = useState(() => disabled);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const crepe = new Crepe({
      root: containerRef.current,
      defaultValue: initialValue,
      features: {
        [Crepe.Feature.Latex]: true,
        [Crepe.Feature.Toolbar]: true,
        [Crepe.Feature.BlockEdit]: true,
        [Crepe.Feature.ListItem]: true,
        [Crepe.Feature.LinkTooltip]: true,
        [Crepe.Feature.Cursor]: true,
        [Crepe.Feature.ImageBlock]: true,
        [Crepe.Feature.Placeholder]: true,
        [Crepe.Feature.Table]: true,
        [Crepe.Feature.CodeMirror]: true,
      },
      featureConfigs: {
        [Crepe.Feature.Placeholder]: {
          text: initialPlaceholder,
        },
      },
    });

    crepe.setReadonly(initialDisabled);

    crepe.on((listener) => {
      listener.markdownUpdated((_ctx, markdown, prevMarkdown) => {
        if (markdown !== prevMarkdown) {
          onChangeRef.current(markdown);
        }
      });
    });

    let isDestroyed = false;

    void crepe.create().then(() => {
      if (isDestroyed) {
        void crepe.destroy();
        return;
      }
      crepeRef.current = crepe;
      setIsEditorReady(true);
    });

    return () => {
      isDestroyed = true;
      crepeRef.current = null;
      setIsEditorReady(false);
      void crepe.destroy();
    };
  }, [initialDisabled, initialPlaceholder, initialValue]);

  useEffect(() => {
    const crepe = crepeRef.current;
    if (!crepe || !isEditorReady) {
      return;
    }

    try {
      const currentMarkdown = crepe.getMarkdown();
      if (currentMarkdown !== value) {
        crepe.editor.action(replaceAll(value));
      }
    } catch {
      // Editor might be in transition or unmounting
    }
  }, [isEditorReady, value]);

  useEffect(() => {
    const crepe = crepeRef.current;
    if (!crepe || !isEditorReady) {
      return;
    }

    crepe.setReadonly(disabled);
  }, [disabled, isEditorReady]);

  function runEditorCommand(
    callback: (ctx: Parameters<Parameters<Crepe["editor"]["action"]>[0]>[0]) => void,
  ) {
    if (!crepeRef.current || disabled) {
      return;
    }
    crepeRef.current.editor.action(callback);
  }

  function handleBold() {
    runEditorCommand((ctx) => {
      ctx.get(commandsCtx).call(toggleStrongCommand.key);
    });
  }

  function handleItalic() {
    runEditorCommand((ctx) => {
      ctx.get(commandsCtx).call(toggleEmphasisCommand.key);
    });
  }

  function handleHeading(level: 1 | 2 | 3) {
    runEditorCommand((ctx) => {
      ctx.get(commandsCtx).call(setBlockTypeCommand.key, {
        nodeType: headingSchema.type(ctx),
        attrs: { level },
      });
    });
  }

  function handleBulletList() {
    runEditorCommand((ctx) => {
      ctx.get(commandsCtx).call(wrapInBlockTypeCommand.key, {
        nodeType: bulletListSchema.type(ctx),
      });
    });
  }

  function handleOrderedList() {
    runEditorCommand((ctx) => {
      ctx.get(commandsCtx).call(wrapInBlockTypeCommand.key, {
        nodeType: orderedListSchema.type(ctx),
      });
    });
  }

  function handleBlockquote() {
    runEditorCommand((ctx) => {
      ctx.get(commandsCtx).call(wrapInBlockTypeCommand.key, {
        nodeType: blockquoteSchema.type(ctx),
      });
    });
  }

  function handleCodeBlock() {
    runEditorCommand((ctx) => {
      ctx.get(commandsCtx).call(setBlockTypeCommand.key, {
        nodeType: codeBlockSchema.type(ctx),
      });
    });
  }

  function handleMathBlock() {
    runEditorCommand((ctx) => {
      const commands = ctx.get(commandsCtx);
      const codeBlock = codeBlockSchema.type(ctx);
      const view = ctx.get(editorViewCtx);
      const { state, dispatch } = view;
      const { from, to } = state.selection;
      const selectedText = state.doc.textBetween(from, to, "\n").trim();
      if (selectedText) {
        const node = codeBlock.create(
          { language: "LaTeX" },
          state.schema.text(selectedText),
        );
        const tr = state.tr.replaceSelectionWith(node);
        dispatch(tr);
      } else {
        commands.call(addBlockTypeCommand.key, {
          nodeType: codeBlock,
          attrs: { language: "LaTeX" },
        });
      }
    });
  }

  function handleInlineMath() {
    runEditorCommand((ctx) => {
      const view = ctx.get(editorViewCtx);
      const { state, dispatch } = view;
      const mathInlineType = state.schema.nodes.math_inline;
      if (!mathInlineType) return;
      const { selection, doc, tr } = state;
      const selectedText = doc.textBetween(selection.from, selection.to, " ").trim();
      const latex = selectedText || "x";
      const node = mathInlineType.create({ value: latex });
      const pos = selection.from;
      const newTr = tr.replaceSelectionWith(node);
      newTr.setSelection(NodeSelection.create(newTr.doc, pos));
      dispatch(newTr);
      view.focus();
    });
  }

  async function handleImageSelected(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !mediaPurpose || disabled) {
      return;
    }

    setImageUploadError(null);
    setIsUploadingImage(true);

    try {
      const media = await uploadMedia(file, mediaPurpose);
      const altText = file.name.replace(/\.[^.]+$/, "").trim() || "Figure";
      const url = mediaUrl(media.id);

      if (crepeRef.current) {
        crepeRef.current.editor.action((ctx) => {
          const view = ctx.get(editorViewCtx);
          const { state, dispatch } = view;
          const imageBlockType =
            state.schema.nodes["image-block"] ||
            state.schema.nodes.image_block ||
            state.schema.nodes.image;

          if (imageBlockType) {
            const node = imageBlockType.create({
              src: url,
              caption: altText,
              alt: altText,
            });
            const tr = state.tr.replaceSelectionWith(node);
            dispatch(tr);
          } else {
            const imageMarkdown = `![${altText}](${url})`;
            const { from, to } = state.selection;
            const tr = state.tr.insertText(`\n\n${imageMarkdown}\n\n`, from, to);
            dispatch(tr);
          }
        });
      } else {
        const imageMarkdown = `![${altText}](${url})`;
        const nextValue = value.trimEnd()
          ? `${value.trimEnd()}\n\n${imageMarkdown}`
          : imageMarkdown;
        onChange(nextValue);
      }
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
        "atlas-rich-text-editor overflow-hidden rounded-lg border bg-background text-foreground shadow-2xs",
        disabled && "opacity-90 bg-muted/5",
        className,
      )}
      aria-disabled={disabled}
    >
      {/* Top Formatting Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 border-b bg-muted/30 px-2 py-1.5 backdrop-blur-xs">
        <div className="flex flex-wrap items-center gap-0.5 sm:gap-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  disabled={disabled}
                  onClick={() => handleHeading(1)}
                  aria-label={t("toolbar.heading1")}
                >
                  <Heading1 className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="bottom">
              {t("toolbar.heading1")}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  disabled={disabled}
                  onClick={() => handleHeading(2)}
                  aria-label={t("toolbar.heading2")}
                >
                  <Heading2 className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="bottom">
              {t("toolbar.heading2")}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  disabled={disabled}
                  onClick={() => handleHeading(3)}
                  aria-label={t("toolbar.heading3")}
                >
                  <Heading3 className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="bottom">
              {t("toolbar.heading3")}
            </TooltipContent>
          </Tooltip>

          <div className="mx-1 h-4 w-px bg-border/80" />

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  disabled={disabled}
                  onClick={handleBold}
                  aria-label={t("toolbar.bold")}
                >
                  <Bold className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="bottom">{t("toolbar.bold")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  disabled={disabled}
                  onClick={handleItalic}
                  aria-label={t("toolbar.italic")}
                >
                  <Italic className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="bottom">{t("toolbar.italic")}</TooltipContent>
          </Tooltip>

          <div className="mx-1 h-4 w-px bg-border/80" />

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  disabled={disabled}
                  onClick={handleBulletList}
                  aria-label={t("toolbar.bulletList")}
                >
                  <List className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="bottom">
              {t("toolbar.bulletList")}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  disabled={disabled}
                  onClick={handleOrderedList}
                  aria-label={t("toolbar.orderedList")}
                >
                  <ListOrdered className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="bottom">
              {t("toolbar.orderedList")}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  disabled={disabled}
                  onClick={handleBlockquote}
                  aria-label={t("toolbar.quote")}
                >
                  <Quote className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="bottom">{t("toolbar.quote")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  disabled={disabled}
                  onClick={handleCodeBlock}
                  aria-label={t("toolbar.codeBlock")}
                >
                  <Code className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="bottom">
              {t("toolbar.codeBlock")}
            </TooltipContent>
          </Tooltip>

          <div className="mx-1 h-4 w-px bg-border/80" />

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  disabled={disabled}
                  onClick={handleMathBlock}
                  aria-label={t("toolbar.mathBlock")}
                  className="gap-1 px-1.5 text-xs font-medium text-primary"
                >
                  <Sigma className="size-3.5" />
                  <span className="hidden sm:inline">LaTeX</span>
                </Button>
              }
            />
            <TooltipContent side="bottom">
              {t("toolbar.mathBlock")}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  disabled={disabled}
                  onClick={handleInlineMath}
                  aria-label={t("toolbar.inlineMath")}
                  className="px-1.5 font-mono text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  $x$
                </Button>
              }
            />
            <TooltipContent side="bottom">
              {t("toolbar.inlineMath")}
            </TooltipContent>
          </Tooltip>
        </div>

        {mediaPurpose && (
          <div className="flex items-center gap-1">
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
              className="h-7 text-xs"
            >
              {isUploadingImage ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                <ImagePlus className="size-3.5" />
              )}

              {isUploadingImage ? t("uploading") : t("addImage")}
            </Button>
          </div>
        )}
      </div>

      {imageUploadError && (
        <div
          role="alert"
          className="border-b bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {imageUploadError}
        </div>
      )}

      {/* Crepe WYSIWYG Container */}
      <div
        ref={containerRef}
        className="atlas-crepe-editor min-h-[140px] bg-background"
      />
    </div>
  );
}

