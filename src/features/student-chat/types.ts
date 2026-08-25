export type ChatMessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  chat_session_id: string;
  role: ChatMessageRole;
  content: string;
  provider: string | null;
  model: string | null;
  created_at: string;
}

export interface CreateChatTurn {
  user_message: ChatMessage;
  assistant_message: ChatMessage;
}

export interface CreatedChatSession {
  id: string;
  learning_record_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  learning_record_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}
