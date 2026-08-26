import { ChatFullscreenProvider } from "@/features/student-chat/components/chat-fullscreen-provider";

export default function StudentChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ChatFullscreenProvider>
      <div className="flex h-full min-h-0 min-w-0 flex-col">{children}</div>
    </ChatFullscreenProvider>
  );
}
