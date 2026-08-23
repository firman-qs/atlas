import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

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
        "atlas-rich-text-viewer wrap-break-word text-sm leading-6",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {value}
      </ReactMarkdown>
    </div>
  );
}
