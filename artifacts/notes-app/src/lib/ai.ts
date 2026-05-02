const PROXY_BASE = '/api/ai-proxy';

// Best NVIDIA NIM vision model for OCR (prefix is meta/, not nvidia/)
const OCR_MODEL = 'meta/llama-3.2-11b-vision-instruct';

/** Resize + compress image to JPEG ≤ 1024 px on longest side, quality 0.82.
 *  NVIDIA NIM has a ~180 KB base64 payload limit per image. */
export function resizeImageForOcr(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 1024;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width >= height) { height = Math.round((height * MAX) / width); width = MAX; }
        else                  { width = Math.round((width * MAX) / height); height = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export async function ocrImage(
  imageDataUrl: string,
  apiKey: string,
): Promise<string> {
  if (!apiKey) throw new Error('NVIDIA API key required');

  // Compress before sending to avoid 502 / payload-too-large
  const compressed = await resizeImageForOcr(imageDataUrl);

  const response = await fetch(`${PROXY_BASE}/chat?provider=nvidia`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OCR_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'You are an OCR engine. Extract every word and character from this image exactly as written. Preserve the original layout: keep each line on its own line, preserve paragraph breaks as blank lines, and maintain indentation with spaces. Return ONLY the extracted text — no explanations, no markdown fences, no extra commentary.',
            },
            {
              type: 'image_url',
              image_url: { url: compressed },
            },
          ],
        },
      ],
      max_tokens: 2048,
      temperature: 0,
    }),
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const j = await response.json();
      detail = j.error?.message || j.message || detail;
    } catch {}
    throw new Error(`OCR Error (${response.status}): ${detail}`);
  }

  const data = await response.json();
  return (data.choices?.[0]?.message?.content || '').trim();
}

export async function fixText(
  text: string,
  provider: 'openrouter' | 'nvidia',
  apiKey: string,
  model: string
): Promise<string> {
  if (!apiKey) throw new Error('API anahtarı gerekli');
  if (!model) throw new Error('Model seçimi gerekli');

  const prompt =
    'Lütfen aşağıdaki metni düzelt, yazım ve dilbilgisi hatalarını gider, ancak anlamı ve tonu koru:\n\n' +
    text;

  const response = await fetch(`${PROXY_BASE}/chat?provider=${provider}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }),
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const j = await response.json();
      detail = j.error?.message || j.message || detail;
    } catch {}
    throw new Error(`API Hatası (${response.status}): ${detail}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || text;
}

export async function translateToTurkish(
  text: string,
  provider: 'openrouter' | 'nvidia',
  apiKey: string,
  model: string
): Promise<string> {
  if (!apiKey) throw new Error('API anahtarı gerekli');
  if (!model) throw new Error('Model seçimi gerekli');

  const prompt =
    'Aşağıdaki metni Türkçeye çevir. Yalnızca çevrilmiş metni döndür, açıklama veya ek bilgi ekleme. Metnin biçimlendirmesini (paragraflar, satır sonları vb.) koru:\n\n' +
    text;

  const response = await fetch(`${PROXY_BASE}/chat?provider=${provider}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }),
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const j = await response.json();
      detail = j.error?.message || j.message || detail;
    } catch {}
    throw new Error(`API Hatası (${response.status}): ${detail}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || text;
}

export async function fixWord(
  word: string,
  provider: 'openrouter' | 'nvidia',
  apiKey: string,
  model: string
): Promise<string> {
  if (!apiKey || !model || !word.trim() || word.length < 2) return word;

  const prompt =
    `Aşağıdaki Türkçe kelimedeki yazım hatasını düzelt. Sadece düzeltilmiş kelimeyi döndür, başka hiçbir şey ekleme:\n\n${word}`;

  try {
    const response = await fetch(`${PROXY_BASE}/chat?provider=${provider}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 20,
        temperature: 0,
      }),
    });
    if (!response.ok) return word;
    const data = await response.json();
    const result = (data.choices?.[0]?.message?.content || '').trim();
    if (result && !result.includes('\n') && result.length <= word.length * 3) {
      return result.split(/\s+/)[0] || word;
    }
  } catch {}
  return word;
}

export async function fetchModels(
  provider: 'openrouter' | 'nvidia',
  apiKey: string
): Promise<{ id: string; name: string }[]> {
  if (!apiKey) throw new Error('API anahtarı gerekli');

  const response = await fetch(`${PROXY_BASE}/models?provider=${provider}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const j = await response.json();
      detail = j.error?.message || j.message || detail;
    } catch {}
    throw new Error(`Model listesi alınamadı (${response.status}): ${detail}`);
  }

  const data = await response.json();

  if (provider === 'openrouter') {
    return (data.data || []).map((m: any) => ({ id: m.id, name: m.name || m.id }));
  } else {
    return (data.data || []).map((m: any) => ({ id: m.id, name: m.id }));
  }
}
