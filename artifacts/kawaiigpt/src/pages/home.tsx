import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useChat } from "@/hooks/use-chat";
import { useListModels, useGenerateImage } from "@workspace/api-client-react";
import { Sidebar } from "@/components/layout/sidebar";
import { ModelPicker } from "@/components/chat/model-picker";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { toast } from "sonner";
import { Loader2, Menu, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import KawaiiAvatar from "@/assets/avatar.png";

const SAMPLE_PROMPTS = [
  "Write a cute bedtime story about a sleepy kitten >w<",
  "Explain quantum physics but make it kawaii!",
  "Write a react component for a magical bouncing button ✨",
  "Tell me a joke about programmers! :3"
];

export default function Home() {
  const { data: models, isLoading: modelsLoading } = useListModels();
  const generateImage = useGenerateImage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const {
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
    addGalleryImage
  } = useChat();

  const [streamingMessage, setStreamingMessage] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSend = async (content: string) => {
    let convoId = currentId;
    if (!convoId || !currentConversation) {
      if (!preferences.modelId || !preferences.personaId) {
        toast.error("Please select a model and persona first!");
        return;
      }
      const newConvo = createConversation(preferences.modelId, preferences.personaId);
      convoId = newConvo.id;
    }

    const convo = conversations.find(c => c.id === convoId) || currentConversation;
    if (!convo) return;
    
    const activeModelId = preferences.modelId || convo.modelId;
    const activePersonaId = preferences.personaId || convo.personaId;

    if (preferences.isImageMode) {
      // Handle Image Generation
      addMessage(convoId, {
        role: "user",
        content: `Generate an image: ${content}`,
        modelId: activeModelId,
        personaId: activePersonaId,
      });

      setStreamingMessage("Drawing something cute... (´｡• ω •｡`)");
      setIsStreaming(true);

      try {
        const result = await generateImage.mutateAsync({
          data: {
            modelId: activeModelId,
            prompt: content,
            size: "1024x1024"
          }
        });

        addMessage(convoId, {
          role: "assistant",
          content: "Here is your image! ✨",
          modelId: activeModelId,
          personaId: activePersonaId,
          isImage: true,
          imageB64: result.b64Json,
          imagePrompt: result.prompt
        });

        addGalleryImage({
          b64Json: result.b64Json,
          prompt: result.prompt,
          modelId: result.modelId
        });

      } catch (error) {
        toast.error("Failed to generate image 😭");
        addMessage(convoId, {
          role: "assistant",
          content: "Gomen nasai! I couldn't draw that right now... (╥﹏╥)",
          modelId: activeModelId,
          personaId: activePersonaId,
        });
      } finally {
        setStreamingMessage(null);
        setIsStreaming(false);
      }

      return;
    }

    // Handle Text Chat
    const userMsg = addMessage(convoId, {
      role: "user",
      content,
      modelId: activeModelId,
      personaId: activePersonaId,
    });

    const messages = [...convo.messages, userMsg].map(m => ({
      role: m.role,
      content: m.content
    })).slice(-50); // Keep last 50

    abortControllerRef.current = new AbortController();
    setIsStreaming(true);
    setStreamingMessage("");

    try {
      const baseUrl = import.meta.env.BASE_URL;
      const res = await fetch(`${baseUrl}api/chat/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          modelId: activeModelId, 
          personaId: activePersonaId, 
          messages 
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error("Failed to send message");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantContent = "";
      
      const assistantMsg = addMessage(convoId, {
        role: "assistant",
        content: "",
        modelId: activeModelId,
        personaId: activePersonaId,
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\\n\\n");
        buffer = parts.pop() ?? "";
        
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          
          const jsonStr = line.slice(5).trim();
          if (!jsonStr) continue;
          
          try {
            const evt = JSON.parse(jsonStr);
            if (evt.error) {
              toast.error(evt.error);
            } else if (evt.done) {
              // done
            } else if (evt.content) {
              assistantContent += evt.content;
              setStreamingMessage(assistantContent);
              updateMessage(convoId, assistantMsg.id, evt.content);
            }
          } catch (e) {
            // ignore parse errors for partial chunks
          }
        }
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        toast.error("Network error! 😭");
      }
    } finally {
      setStreamingMessage(null);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setStreamingMessage(null);
    }
  };

  const activeModelId = preferences.modelId || currentConversation?.modelId || null;
  const activePersonaId = preferences.personaId || currentConversation?.personaId || null;

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden relative">
      {/* Animated background sparkles */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-4 h-4 text-primary/20 animate-sparkle">✨</div>
        <div className="absolute top-40 right-20 w-6 h-6 text-accent/20 animate-sparkle" style={{ animationDelay: '1s' }}>✨</div>
        <div className="absolute bottom-20 left-1/4 w-5 h-5 text-secondary/20 animate-sparkle" style={{ animationDelay: '0.5s' }}>🌸</div>
        <div className="absolute bottom-40 right-1/3 w-4 h-4 text-primary/20 animate-sparkle" style={{ animationDelay: '1.5s' }}>✨</div>
      </div>

      {/* Desktop Sidebar */}
      <Sidebar 
        className="hidden md:flex relative z-10" 
        conversations={conversations}
        currentId={currentId}
        onSelect={setCurrentId}
        onNew={() => setCurrentId(null)}
        onDelete={deleteConversation}
        onClearAll={clearAllConversations}
      />

      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <Sidebar 
            className="w-full border-r-0"
            conversations={conversations}
            currentId={currentId}
            onSelect={(id) => {
              setCurrentId(id);
              setIsSidebarOpen(false);
            }}
            onNew={() => {
              setCurrentId(null);
              setIsSidebarOpen(false);
            }}
            onDelete={deleteConversation}
            onClearAll={clearAllConversations}
          />
        </SheetContent>
      </Sheet>

      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        <div className="md:hidden p-3 border-b flex items-center bg-card/80 backdrop-blur-sm">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <span className="font-bold text-primary ml-2 tracking-tight">KawaiiGPT</span>
        </div>

        {modelsLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <ModelPicker 
              models={models}
              modelId={activeModelId}
              personaId={activePersonaId}
              isImageMode={preferences.isImageMode}
              onModelChange={(id) => updatePreferences({ modelId: id })}
              onPersonaChange={(id) => updatePreferences({ personaId: id })}
              disabled={isStreaming}
            />

            {!currentConversation || currentConversation.messages.length === 0 ? (
              <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                <div className="relative mb-8 group">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-colors"></div>
                  <img 
                    src={KawaiiAvatar} 
                    alt="KawaiiGPT" 
                    className="w-40 h-40 object-cover relative z-10 animate-float drop-shadow-xl" 
                  />
                  <div className="absolute -top-4 -right-4 bg-background p-2 rounded-2xl shadow-lg border border-border/50 text-sm font-medium animate-bounce z-20">
                    Hewwo! {preferences.isImageMode ? "🎨" : "✨"}
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight text-center">
                  What can I get for u senpai? {'>'}w{'<'}
                </h1>
                <p className="text-muted-foreground mb-8 text-center max-w-md">
                  {preferences.isImageMode 
                    ? "Describe an image and I'll draw it for you!" 
                    : "I'm your cute and smart AI assistant. Ask me anything!"}
                </p>

                {!preferences.isImageMode && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-4">
                    {SAMPLE_PROMPTS.map((prompt, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="h-auto py-3 px-4 justify-start text-left whitespace-normal hover:border-primary/50 hover:bg-primary/5 transition-all"
                        onClick={() => handleSend(prompt)}
                      >
                        <span className="text-sm text-muted-foreground">{prompt}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <MessageList 
                messages={currentConversation.messages} 
                streamingMessage={streamingMessage} 
              />
            )}

            <div className="p-4 bg-gradient-to-t from-background via-background/90 to-transparent pb-6 md:pb-8">
              <MessageInput 
                onSend={handleSend}
                onStop={handleStop}
                isStreaming={isStreaming}
                isImageMode={preferences.isImageMode}
                onToggleMode={() => updatePreferences({ isImageMode: !preferences.isImageMode })}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
