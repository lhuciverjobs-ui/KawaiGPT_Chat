import { useEffect } from "react";
import { ChatModel, ImageModel, Persona, ModelPresets } from "@workspace/api-client-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ModelPickerProps {
  models: ModelPresets | undefined;
  modelId: string | null;
  personaId: string | null;
  isImageMode: boolean;
  onModelChange: (id: string) => void;
  onPersonaChange: (id: string) => void;
  disabled?: boolean;
}

export function ModelPicker({
  models,
  modelId,
  personaId,
  isImageMode,
  onModelChange,
  onPersonaChange,
  disabled
}: ModelPickerProps) {
  const currentModels = models
    ? (isImageMode ? models.imageModels : models.chatModels)
    : [];

  useEffect(() => {
    if (!models) return;
    if (!modelId && currentModels.length > 0) {
      onModelChange(currentModels[0].id);
    }
    if (!personaId && models.personas.length > 0 && !isImageMode) {
      onPersonaChange(models.personas[0].id);
    }
  }, [models, modelId, personaId, isImageMode, currentModels, onModelChange, onPersonaChange]);

  if (!models) return null;

  return (
    <div className="flex flex-wrap gap-3 items-center p-3 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 w-full">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Model</span>
        <Select value={modelId || ""} onValueChange={onModelChange} disabled={disabled}>
          <SelectTrigger className="w-[200px] h-9 bg-background border-border/50">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            {currentModels.map((m: any) => (
              <SelectItem key={m.id} value={m.id} className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <span>{m.emoji}</span>
                  <span className="font-medium">{m.label}</span>
                  {m.premium && <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary">PRO</Badge>}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!isImageMode && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Persona</span>
          <Select value={personaId || ""} onValueChange={onPersonaChange} disabled={disabled}>
            <SelectTrigger className="w-[180px] h-9 bg-background border-border/50">
              <SelectValue placeholder="Select Persona" />
            </SelectTrigger>
            <SelectContent>
              {models.personas.map((p) => (
                <SelectItem key={p.id} value={p.id} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span>{p.emoji}</span>
                    <span>{p.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
