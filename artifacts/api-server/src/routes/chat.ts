import { Router, type IRouter, type Request, type Response } from "express";
import { SendChatMessageBody } from "@workspace/api-zod";
import { getOpenRouterHeaders, requireOpenAIConfig } from "../lib/openai";
import { CHAT_MODEL_BY_ID, PERSONA_BY_ID } from "../lib/personas";

const router: IRouter = Router();

router.post(
  "/chat/messages",
  async (req: Request, res: Response): Promise<void> => {
    const parsed = SendChatMessageBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid body",
        details: parsed.error.flatten(),
      });
      return;
    }

    const { modelId, personaId, messages } = parsed.data;
    const model = CHAT_MODEL_BY_ID.get(modelId);
    const persona = PERSONA_BY_ID.get(personaId);

    if (!model) {
      res.status(400).json({ error: `Unknown modelId: ${modelId}` });
      return;
    }
    if (!persona) {
      res.status(400).json({ error: `Unknown personaId: ${personaId}` });
      return;
    }

    // Take only the last 50 messages to bound context size.
    const trimmed = messages.slice(-50);

    const chatMessages = [
      { role: "system" as const, content: persona.systemPrompt },
      ...trimmed.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    let headersSent = false;
    const ensureSseHeaders = () => {
      if (headersSent) return;
      headersSent = true;
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders?.();
    };
    const send = (obj: unknown) => {
      ensureSseHeaders();
      res.write(`data: ${JSON.stringify(obj)}\n\n`);
    };

    let aborted = false;
    res.on("close", () => {
      if (!res.writableEnded) {
        aborted = true;
        req.log?.info("client closed connection");
      }
    });

    try {
      const isReasoning =
        model.upstreamModel.startsWith("o") ||
        model.upstreamModel.endsWith("-nano");
      const config = requireOpenAIConfig();
      const upstreamRes = await fetch(`${config.baseURL.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          Authorization: `Bearer ${config.apiKey}`,
          ...getOpenRouterHeaders(config.baseURL),
        },
        body: JSON.stringify({
          model: model.upstreamModel,
          max_completion_tokens: isReasoning ? 32768 : 8192,
          messages: chatMessages,
          stream: true,
        }),
      });

      if (!upstreamRes.ok || !upstreamRes.body) {
        const text = await upstreamRes.text().catch(() => "");
        req.log?.error({ status: upstreamRes.status, body: text.slice(0, 500) }, "upstream error");
        send({
          error: `KawaiiGPT is having trouble (${upstreamRes.status}). Please try again ;-;`,
        });
        res.end();
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      for await (const chunk of upstreamRes.body as any) {
        if (aborted) break;
        buffer += decoder.decode(chunk as Uint8Array, { stream: true });

        let idx;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const content = json?.choices?.[0]?.delta?.content;
            if (content) send({ content });
          } catch {
            // ignore non-JSON lines
          }
        }
      }

      send({ done: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error from KawaiiGPT";
      req.log?.error({ err }, "Chat stream failed");
      send({ error: message });
    } finally {
      res.end();
    }
  },
);

export default router;
