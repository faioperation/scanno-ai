export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  imageUrl?: string;
  imageName?: string;
  isLoading?: boolean;
  isStreaming?: boolean;
}

export interface ChatApiRequest {
  messages: Array<{ role: MessageRole; content: string }>;
  image?: string;
  imageMimeType?: string;
}

export interface ChatApiResponse {
  message: string;
  error?: string;
}
