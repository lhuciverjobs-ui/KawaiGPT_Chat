import { Router, type IRouter, type Request, type Response } from "express";
import { GenerateImageBody } from "@workspace/api-zod";
import { openai } from "../lib/openai";
import { IMAGE_MODEL_BY_ID } from "../lib/personas";

const router: IRouter = Router();

router.post(
  "/image/generate",
  async (req: Request, res: Response): Promise<void> => {
    const parsed = GenerateImageBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid body",
        details: parsed.error.flatten(),
      });
      return;
    }

    const { modelId, prompt, size } = parsed.data;
    const model = IMAGE_MODEL_BY_ID.get(modelId);
    if (!model) {
      res.status(400).json({ error: `Unknown image modelId: ${modelId}` });
      return;
    }

    try {
      const result = await openai.images.generate({
        model: model.upstreamModel,
        prompt,
        size: (size ?? "1024x1024") as "1024x1024" | "1536x1024" | "1024x1536",
      });

      const b64 = result.data?.[0]?.b64_json;
      if (!b64) {
        res.status(502).json({ error: "Image provider returned no image" });
        return;
      }

      res.json({ b64Json: b64, prompt, modelId });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Image generation failed";
      req.log?.error({ err }, "Image generation failed");
      res.status(500).json({ error: message });
    }
  },
);

export default router;
