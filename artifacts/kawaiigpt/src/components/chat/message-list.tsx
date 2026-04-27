import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/tokyo-night-dark.css";
import { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Copy, Check, Sparkles } from "lucide-react";
import KawaiiAvatar from "@/assets/avatar.png";

interface MessageListProps {
  messages: ChatMessage[];
  streamingMessage: string | null;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-background/80"
      onClick={handleCopy}
    >
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
    </Button>
  );
}

export function MessageList({ messages, streamingMessage }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isNearBottom);
  };

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingMessage, autoScroll]);

  return (
    <div 
      className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
      ref={containerRef}
      onScroll={handleScroll}
    >
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            "flex w-full animate-in slide-in-from-bottom-4 fade-in duration-300",
            msg.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          <div className={cn(
            "flex max-w-[85%] gap-4",
            msg.role === "user" ? "flex-row-reverse" : "flex-row"
          )}>
            {msg.role === "assistant" && (
              <Avatar className="w-10 h-10 border-2 border-primary/20 shadow-sm shrink-0">
                <AvatarImage src={KawaiiAvatar} />
                <AvatarFallback>KG</AvatarFallback>
              </Avatar>
            )}

            <div className={cn(
              "relative px-5 py-4 rounded-2xl shadow-sm",
              msg.role === "user" 
                ? "bg-primary text-primary-foreground rounded-tr-sm" 
                : "bg-card border border-border/50 text-card-foreground rounded-tl-sm"
            )}>
              {msg.isImage && msg.imageB64 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-primary font-medium">
                    <Sparkles className="w-4 h-4" />
                    Generated Image
                  </div>
                  <img 
                    src={`data:image/png;base64,${msg.imageB64}`} 
                    alt={msg.imagePrompt || "Generated image"} 
                    className="rounded-xl max-w-full shadow-md hover:shadow-lg transition-shadow"
                  />
                  {msg.imagePrompt && (
                    <p className="text-xs text-muted-foreground italic">Prompt: {msg.imagePrompt}</p>
                  )}
                </div>
              ) : (
                <div className={cn(
                  "prose prose-sm dark:prose-invert max-w-none",
                  msg.role === "user" ? "prose-p:text-primary-foreground prose-a:text-primary-foreground underline" : ""
                )}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      pre({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');
                        return !inline ? (
                          <div className="relative group">
                            <CopyButton text={codeString} />
                            <pre className={className} {...props}>
                              {children}
                            </pre>
                          </div>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {streamingMessage && (
        <div className="flex w-full justify-start animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex max-w-[85%] gap-4 flex-row">
            <Avatar className="w-10 h-10 border-2 border-primary/20 shadow-sm shrink-0">
              <AvatarImage src={KawaiiAvatar} />
              <AvatarFallback>KG</AvatarFallback>
            </Avatar>
            <div className="relative px-5 py-4 rounded-2xl shadow-sm bg-card border border-border/50 text-card-foreground rounded-tl-sm">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {streamingMessage}
                </ReactMarkdown>
                <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle" />
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={bottomRef} className="h-px" />
    </div>
  );
}
