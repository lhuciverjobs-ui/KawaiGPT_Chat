export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  modelId: string;
  personaId: string;
  timestamp: number;
  isImage?: boolean;
  imageB64?: string;
  imagePrompt?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  modelId: string;
  personaId: string;
  messages: ChatMessage[];
}

export interface GalleryImage {
  id: string;
  b64Json: string;
  prompt: string;
  modelId: string;
  timestamp: number;
}
