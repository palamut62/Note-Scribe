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
    // Vision inference can be slow — allow up to 120 s
    const upstream = await fetchWithTimeout(
      urls.chat,
      {
        method: "POST",
        headers: { Authorization: authHeader, "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      },
      120_000
    );

    const text = await upstream.text();
    req.log.info({ status: upstream.status, bodyLen: text.length }, "ai-proxy chat response");

    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
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

export default router;
