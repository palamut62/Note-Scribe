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

router.get("/ai-proxy/models", async (req, res) => {
  const provider = String(req.query["provider"] || "");
  const urls = PROVIDER_URLS[provider];
  if (!urls) {
    res.status(400).json({ error: "Geçersiz sağlayıcı" });
    return;
  }

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.status(401).json({ error: "Authorization header eksik" });
    return;
  }

  try {
    const upstream = await fetch(urls.models, {
      method: "GET",
      headers: { Authorization: authHeader },
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    req.log.error({ err }, "ai-proxy models fetch failed");
    res.status(502).json({ error: "Upstream bağlantı hatası" });
  }
});

router.post("/ai-proxy/chat", async (req, res) => {
  const provider = String(req.query["provider"] || "");
  const urls = PROVIDER_URLS[provider];
  if (!urls) {
    res.status(400).json({ error: "Geçersiz sağlayıcı" });
    return;
  }

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.status(401).json({ error: "Authorization header eksik" });
    return;
  }

  try {
    const upstream = await fetch(urls.chat, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    req.log.error({ err }, "ai-proxy chat fetch failed");
    res.status(502).json({ error: "Upstream bağlantı hatası" });
  }
});

export default router;
