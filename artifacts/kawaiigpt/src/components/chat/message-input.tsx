import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Image as ImageIcon, MessageSquare, Loader2, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (content: string) => void;
  onStop?: () => void;
  isStreaming: boolean;
  isImageMode: boolean;
  onToggleMode: () => void;
  disabled?: boolean;
}

export function MessageInput({
  onSend,
  onStop,
  isStreaming,
  isImageMode,
  onToggleMode,
  disabled
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (content.trim() && !isStreaming && !disabled) {
      onSend(content.trim());
      setContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
  };

  return (
    <div className="relative group w-full max-w-4xl mx-auto flex flex-col gap-2 p-2">
      <div className={cn(
        "relative flex items-end gap-2 p-2 rounded-2xl border bg-card/50 backdrop-blur-sm transition-all duration-200",
        isImageMode ? "border-primary/50 shadow-[0_0_15px_rgba(236,72,153,0.15)]" : "border-border shadow-sm hover:border-primary/30"
      )}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "shrink-0 rounded-xl transition-all duration-300",
                isImageMode ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={onToggleMode}
              type="button"
            >
              {isImageMode ? <ImageIcon className="w-5 h-5 animate-in spin-in-12" /> : <MessageSquare className="w-5 h-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{isImageMode ? "Switch to Chat Mode" : "Switch to Image Mode"}</p>
          </TooltipContent>
        </Tooltip>

        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={isImageMode ? "Describe an image to generate... 🎨" : "Message KawaiiGPT... >w<"}
          className="min-h-[44px] max-h-[200px] resize-none bg-transparent border-0 focus-visible:ring-0 px-2 py-3 text-base"
          disabled={disabled || isStreaming}
          rows={1}
        />

        {isStreaming ? (
          <Button
            variant="destructive"
            size="icon"
            className="shrink-0 rounded-xl shadow-md"
            onClick={onStop}
            type="button"
          >
            <StopCircle className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            variant={content.trim() ? "default" : "secondary"}
            size="icon"
            className="shrink-0 rounded-xl shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={handleSend}
            disabled={!content.trim() || disabled}
            type="button"
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="text-center text-xs text-muted-foreground">
        KawaiiGPT can make mistakes. Please be kind! (´｡• ᵕ •｡`)
      </div>
    </div>
  );
}
