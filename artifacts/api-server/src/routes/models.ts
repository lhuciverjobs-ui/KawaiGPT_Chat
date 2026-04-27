import { Router, type IRouter } from "express";
import {
  CHAT_MODELS,
  IMAGE_MODELS,
  PERSONAS,
  KAWAII_VERSION,
} from "../lib/personas";

const router: IRouter = Router();

router.get("/models", (_req, res) => {
  res.json({
    chatModels: CHAT_MODELS.map(({ upstreamModel: _, ...m }) => m),
    imageModels: IMAGE_MODELS.map(({ upstreamModel: _, ...m }) => m),
    personas: PERSONAS.map(({ systemPrompt: _, ...p }) => p),
    version: KAWAII_VERSION,
  });
});

export default router;
