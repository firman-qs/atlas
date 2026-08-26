"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface ChatFullscreenContextValue {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

const ChatFullscreenContext = createContext<ChatFullscreenContextValue | null>(
  null,
);

export function ChatFullscreenProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!isFullscreen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  const value = useMemo(
    () => ({
      isFullscreen,
      toggleFullscreen: () => {
        setIsFullscreen((current) => !current);
      },
    }),
    [isFullscreen],
  );

  return (
    <ChatFullscreenContext.Provider value={value}>
      {children}
    </ChatFullscreenContext.Provider>
  );
}

export function useChatFullscreen() {
  const context = useContext(ChatFullscreenContext);

  if (!context) {
    throw new Error(
      "useChatFullscreen must be used within ChatFullscreenProvider.",
    );
  }

  return context;
}
