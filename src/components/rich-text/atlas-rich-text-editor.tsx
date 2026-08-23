"use client";

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
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface AtlasRichTextEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
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
              "aria-label": placeholder ?? "Rich text editor",
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
    [],
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
}: AtlasRichTextEditorProps) {
  /*
   * Capture only the value used to create the Milkdown document.
   *
   * Subsequent controlled value changes are synchronized by
   * EditorStateSynchronizer, so the editor instance itself does not need
   * to be recreated when the parent value changes.
   */
  const [initialValue] = useState(() => value);

  return (
    <div
      className={cn(
        "atlas-rich-text-editor overflow-hidden rounded-lg border bg-background",
        disabled && "opacity-60",
        className,
      )}
      aria-disabled={disabled}
    >
      <MilkdownProvider>
        <AtlasMilkdownEditor
          initialValue={initialValue}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />

        <EditorStateSynchronizer value={value} disabled={disabled} />
      </MilkdownProvider>
    </div>
  );
}
