import { useState, useEffect, useCallback, useRef } from "react";
import { Conversation, ChatMessage, GalleryImage } from "../lib/types";

const STORAGE_KEYS = {
  conversations: "kawaiigpt:conversations",
  currentId: "kawaiigpt:currentId",
  gallery: "kawaiigpt:gallery",
  preferences: "kawaiigpt:preferences",
};

export interface ChatPreferences {
  modelId: string | null;
  personaId: string | null;
  isImageMode: boolean;
}

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [preferences, setPreferences] = useState<ChatPreferences>({
    modelId: null,
    personaId: null,
    isImageMode: false,
  });

  // Load from local storage
  useEffect(() => {
    try {
      const storedConvos = localStorage.getItem(STORAGE_KEYS.conversations);
      if (storedConvos) setConversations(JSON.parse(storedConvos));

      const storedId = localStorage.getItem(STORAGE_KEYS.currentId);
      if (storedId) setCurrentId(storedId);

      const storedGallery = localStorage.getItem(STORAGE_KEYS.gallery);
      if (storedGallery) setGallery(JSON.parse(storedGallery));

      const storedPrefs = localStorage.getItem(STORAGE_KEYS.preferences);
      if (storedPrefs) setPreferences((prev) => ({ ...prev, ...JSON.parse(storedPrefs) }));
    } catch (e) {
      console.error("Failed to load chat data from localStorage", e);
    }
  }, []);

  // Save to local storage whenever changed
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (currentId) {
      localStorage.setItem(STORAGE_KEYS.currentId, currentId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.currentId);
    }
  }, [currentId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.gallery, JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(preferences));
  }, [preferences]);

  const updatePreferences = useCallback((updates: Partial<ChatPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  }, []);

  const currentConversation = conversations.find((c) => c.id === currentId) || null;

  const createConversation = useCallback(
    (modelId: string, personaId: string) => {
      const newConvo: Conversation = {
        id: crypto.randomUUID(),
        title: "New Chat OwO",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        modelId,
        personaId,
        messages: [],
      };
      setConversations((prev) => [newConvo, ...prev]);
      setCurrentId(newConvo.id);
      return newConvo;
    },
    []
  );

  const addMessage = useCallback(
    (convoId: string, message: Omit<ChatMessage, "id" | "timestamp">) => {
      const newMessage: ChatMessage = {
        ...message,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convoId) return c;
          
          let newTitle = c.title;
          if (c.messages.length === 0 && message.role === "user") {
            newTitle = message.content.slice(0, 30) + (message.content.length > 30 ? "..." : "");
          }

          return {
            ...c,
            title: newTitle,
            updatedAt: Date.now(),
            messages: [...c.messages, newMessage],
          };
        })
      );

      return newMessage;
    },
    []
  );

  const updateMessage = useCallback(
    (convoId: string, messageId: string, contentUpdate: string) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convoId) return c;
          return {
            ...c,
            updatedAt: Date.now(),
            messages: c.messages.map((m) =>
              m.id === messageId ? { ...m, content: m.content + contentUpdate } : m
            ),
          };
        })
      );
    },
    []
  );

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentId === id) {
      setCurrentId(null);
    }
  }, [currentId]);

  const clearAllConversations = useCallback(() => {
    setConversations([]);
    setCurrentId(null);
  }, []);

  const addGalleryImage = useCallback((image: Omit<GalleryImage, "id" | "timestamp">) => {
    const newImg: GalleryImage = {
      ...image,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setGallery((prev) => [newImg, ...prev]);
  }, []);

  return {
    conversations,
    currentConversation,
    currentId,
    setCurrentId,
    preferences,
    updatePreferences,
    createConversation,
    addMessage,
    updateMessage,
    deleteConversation,
    clearAllConversations,
    gallery,
    addGalleryImage,
  };
}
