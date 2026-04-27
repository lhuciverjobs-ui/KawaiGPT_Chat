import { useState } from "react";
import { useLocation } from "wouter";
import { Plus, MessageSquare, Trash2, Settings, Palette, Info, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Conversation } from "@/lib/types";
import { useTheme } from "next-themes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SidebarProps {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function Sidebar({
  conversations,
  currentId,
  onSelect,
  onNew,
  onDelete,
  onClearAll,
  className
}: SidebarProps) {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn("flex flex-col h-full bg-sidebar border-r border-sidebar-border w-64 md:w-72", className)}>
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        <div className="flex items-center gap-2 text-primary font-bold text-lg tracking-tight">
          <SparkleIcon className="w-5 h-5" />
          <span>KawaiiGPT</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent">
              <Settings className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation("/gallery")}>
              <Palette className="w-4 h-4 mr-2" />
              Gallery
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation("/about")}>
              <Info className="w-4 h-4 mr-2" />
              About
            </DropdownMenuItem>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Chats
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure? {">_<"}</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your conversation history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-4">
        <Button 
          onClick={onNew} 
          className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground shadow-none"
          variant="outline"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 pb-4">
          {conversations.length === 0 ? (
            <div className="text-center text-sm text-sidebar-foreground/50 py-8 italic">
              No chats yet. Start one! 🌸
            </div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-sm",
                  currentId === c.id 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
                onClick={() => onSelect(c.id)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                  <span className="truncate">{c.title}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10",
                    currentId === c.id && "opacity-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(c.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
