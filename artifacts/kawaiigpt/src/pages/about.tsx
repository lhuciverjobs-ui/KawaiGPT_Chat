import { useLocation } from "wouter";
import { ArrowLeft, Github, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import KawaiiAvatar from "@/assets/avatar.png";

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center py-12 px-4 relative overflow-hidden">
      {/* Decorative bg elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-50 z-0">
        <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <Button variant="ghost" onClick={() => setLocation("/")} className="self-start gap-2 hover:bg-primary/10 hover:text-primary -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back to Chat
        </Button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-colors"></div>
            <img src={KawaiiAvatar} alt="Mascot" className="w-32 h-32 relative z-10 drop-shadow-xl" />
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-foreground">KawaiiGPT</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            Version K2.5-Web
          </div>
          
          <p className="text-lg text-muted-foreground max-w-lg mt-4 leading-relaxed">
            An anime-girl-themed AI assistant — playful, soft, and unapologetically cute. 
            The web version brings the cozy bedroom vibes directly to your browser! ✨
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm space-y-8">
          <section>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-foreground">
              <Heart className="w-5 h-5 text-primary" /> The Team
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: "MrSanZz", role: "Original Creator" },
                { name: "AI Empower", role: "Organization" },
                { name: "Shoukaku07", role: "Contributor" },
                { name: "Fl4mabyX5", role: "Contributor" },
                { name: "Ador4", role: "Contributor" },
              ].map(member => (
                <div key={member.name} className="flex flex-col p-4 rounded-xl bg-muted/50 border border-border/30">
                  <span className="font-semibold text-foreground">{member.name}</span>
                  <span className="text-sm text-muted-foreground">{member.role}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-4 pt-4 border-t border-border/50">
            <h2 className="text-xl font-bold text-foreground">Open Source</h2>
            <p className="text-muted-foreground">
              Based on the awesome CLI tool created by MrSanZz. Check out the original project!
            </p>
            <Button asChild variant="outline" className="w-full sm:w-auto gap-2 bg-background hover:bg-muted">
              <a href="https://github.com/MrSanZz/KawaiiGPT" target="_blank" rel="noreferrer">
                <Github className="w-4 h-4" /> View Original Repo
              </a>
            </Button>
          </section>
        </div>

        <div className="text-center text-sm text-muted-foreground pb-8">
          Made with love and magic (´｡• ᵕ •｡`)
        </div>
      </div>
    </div>
  );
}
