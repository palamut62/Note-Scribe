import { Router, type IRouter } from "express";

const router: IRouter = Router();

const PROVIDER_URLS: Record<string, { models: string; chat: string }> = {
  openrouter: {
    models: "https://openrouter.ai/api/v1/models",
    chat: "https://openrouter.ai/api/v1/chat/completions",
  },
  nvidia: {
    models: "https://integrate.api.nvidia.com/v1/models",
    chat: "https://integrate.api.nvidia.com/v1/chat/completions",
  },
};

/** Fetch with an explicit timeout (ms). Throws on timeout or network error. */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

router.get("/ai-proxy/models", async (req, res) => {
  const provider = String(req.query["provider"] || "");
  const urls = PROVIDER_URLS[provider];
  if (!urls) { res.status(400).json({ error: "Invalid provider" }); return; }

  const authHeader = req.headers["authorization"];
  if (!authHeader) { res.status(401).json({ error: "Authorization header missing" }); return; }

  try {
    const upstream = await fetchWithTimeout(
      urls.models,
      { method: "GET", headers: { Authorization: authHeader } },
      30_000
    );
    const text = await upstream.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    res.status(upstream.status).json(data);
  } catch (err: any) {
    req.log.error({ err }, "ai-proxy models fetch failed");
    res.status(502).json({ error: "Upstream connection error", detail: err?.message });
  }
});

router.post("/ai-proxy/chat", async (req, res) => {
  const provider = String(req.query["provider"] || "");
  const urls = PROVIDER_URLS[provider];
  if (!urls) { res.status(400).json({ error: "Invalid provider" }); return; }

  const authHeader = req.headers["authorization"];
  if (!authHeader) { res.status(401).json({ error: "Authorization header missing" }); return; }

  try {
    // Force stream:false — we read the whole response with .text() so streaming SSE would break parsing.
    const forwardBody = { ...req.body, stream: false };

    // OpenRouter recommends these headers for better routing and analytics.
    const extraHeaders: Record<string, string> =
      provider === "openrouter"
        ? { "HTTP-Referer": "https://nootle.io", "X-Title": "Nootle" }
        : {};

    // Vision inference can be slow — allow up to 120 s
    const upstream = await fetchWithTimeout(
      urls.chat,
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          ...extraHeaders,
        },
        body: JSON.stringify(forwardBody),
      },
      120_000
    );

    const text = await upstream.text();

    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    // Log body excerpt on error for easier debugging
    if (upstream.status >= 400) {
      req.log.warn(
        { status: upstream.status, provider, model: (req.body as any)?.model, body: text.slice(0, 500) },
        "ai-proxy chat upstream error"
      );
    } else {
      req.log.info({ status: upstream.status, bodyLen: text.length }, "ai-proxy chat response");
    }

    res.status(upstream.status).json(data);
  } catch (err: any) {
    req.log.error({ err }, "ai-proxy chat fetch failed");
    const isTimeout = err?.name === "AbortError";
    res.status(502).json({
      error: isTimeout ? "Upstream timed out (>120 s)" : "Upstream connection error",
      detail: err?.message,
    });
  }
});

/** Audio transcription via OpenRouter Whisper (accepts base64 JSON, returns { text }) */
router.post("/ai-proxy/transcribe", async (req, res) => {
  const provider = String(req.query["provider"] || "");
  const authHeader = req.headers["authorization"];
  if (!authHeader) { res.status(401).json({ error: "Authorization header missing" }); return; }

  if (provider !== "openrouter") {
    res.status(400).json({ error: "Audio transcription is only supported with the OpenRouter provider." });
    return;
  }

  const { audioBase64, model = "openai/whisper-large-v3" } = req.body as {
    audioBase64?: string;
    model?: string;
  };
  if (!audioBase64) { res.status(400).json({ error: "audioBase64 required" }); return; }

  try {
    // Strip the data-url prefix if present
    const base64Data = audioBase64.includes(",") ? audioBase64.split(",")[1] : audioBase64;
    const audioBuffer = Buffer.from(base64Data, "base64");

    const formData = new FormData();
    formData.append(
      "file",
      new Blob([audioBuffer], { type: "audio/webm" }),
      "recording.webm"
    );
    formData.append("model", model);

    const upstream = await fetchWithTimeout(
      "https://openrouter.ai/api/v1/audio/transcriptions",
      {
        method: "POST",
        headers: { Authorization: authHeader },
        body: formData,
      },
      90_000
    );

    const text = await upstream.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    res.status(upstream.status).json(data);
  } catch (err: any) {
    req.log.error({ err }, "ai-proxy transcribe failed");
    const isTimeout = err?.name === "AbortError";
    res.status(502).json({
      error: isTimeout ? "Transcription timed out (>90 s)" : "Upstream connection error",
      detail: err?.message,
    });
  }
});

export default router;
