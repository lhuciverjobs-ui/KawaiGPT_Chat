import { useLocation } from "wouter";
import { ArrowLeft, Download, Trash2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/use-chat";
import { format } from "date-fns";

export default function Gallery() {
  const [, setLocation] = useLocation();
  const { gallery } = useChat();

  const handleDownload = (b64: string, prompt: string) => {
    const a = document.createElement("a");
    a.href = `data:image/png;base64,${b64}`;
    a.download = `kawaii-${prompt.slice(0, 20).replace(/[^a-z0-9]/gi, '-')}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col p-4 md:p-8">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="hover:bg-primary/10 hover:text-primary">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Palette className="w-8 h-8 text-primary" />
              Art Gallery ✨
            </h1>
          </div>
        </div>

        {gallery.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 animate-in fade-in zoom-in">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Palette className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h2 className="text-xl font-bold">No drawings yet!</h2>
            <p className="text-muted-foreground max-w-md">
              Switch to Image Mode in the chat and ask KawaiiGPT to draw something cute for you! (´｡• ω •｡`)
            </p>
            <Button onClick={() => setLocation("/")} className="mt-4 shadow-md hover:scale-105 transition-transform">
              Start Drawing
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-max">
            {gallery.map((img) => (
              <div 
                key={img.id} 
                className="group relative rounded-2xl overflow-hidden bg-card border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-square w-full overflow-hidden bg-muted">
                  <img 
                    src={`data:image/png;base64,${img.b64Json}`} 
                    alt={img.prompt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                
                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <p className="text-white text-sm font-medium line-clamp-2 mb-2 drop-shadow-md">
                    {img.prompt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-xs font-medium">
                      {format(img.timestamp, "MMM d, h:mm a")}
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm border-0"
                        onClick={() => handleDownload(img.b64Json, img.prompt)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
