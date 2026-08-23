import { cn } from "@/lib/utils";

export interface AtlasRichTextViewerProps {
  value: string;
  className?: string;
}

export function AtlasRichTextViewer({
  value,
  className,
}: AtlasRichTextViewerProps) {
  return (
    <div
      className={cn(
        "whitespace-pre-wrap wrap-break-word text-sm leading-6",
        className,
      )}
    >
      {value}
    </div>
  );
}
