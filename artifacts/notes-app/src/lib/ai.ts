const PROXY_BASE = '/api/ai-proxy';

const OCR_MODEL = 'meta/llama-3.2-11b-vision-instruct';

/** Extract a human-readable error message from any API error response shape. */
async function extractApiError(res: Response): Promise<string> {
  let detail = res.statusText;
  try {
    const j = await res.json();
    // OpenRouter: { error: { message, code } }  |  plain: { error: "string" }  |  { message: "..." }
    if (j?.error?.message) detail = j.error.message;
    else if (typeof j?.error === 'string') detail = j.error;
    else if (j?.message) detail = j.message;
    else if (j?.raw) detail = 'Beklenmedik yanıt formatı (streaming?). Stream desteklenmiyor.';
  } catch {}
  return detail;
}

export const DEFAULT_AI_PROMPTS = {
  fixText:
    'Lütfen aşağıdaki metni düzelt, yazım ve dilbilgisi hatalarını gider, ancak anlamı ve tonu koru:\n\n{text}',
  translate:
    'Aşağıdaki metni {targetLang} diline çevir. Yalnızca çevrilmiş metni döndür, açıklama veya ek bilgi ekleme. Metnin biçimlendirmesini (paragraflar, satır sonları vb.) koru:\n\n{text}',
  summarize:
    'Aşağıdaki metni 3-5 madde halinde özetle. Yalnızca özeti döndür:\n\n{text}',
  chat:
    'Sen bir not asistanısın. Kullanıcının notu:\n\n{noteContent}\n\nBu nota dayanarak soruları yanıtla.',
  chatAllNotes:
    'Sen bir not asistanısın. Kullanıcının kayıtlı tüm notları aşağıda verilmiştir:\n\n{noteContent}\n\nBu notlara dayanarak soruları yanıtla. Cevaplarında hangi nottan bilgi aldığını belirt.',
};

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
    const detail = await extractApiError(response);
    throw new Error(`OCR Error (${response.status}): ${detail}`);
  }

  const data = await response.json();
  return (data.choices?.[0]?.message?.content || '').trim();
}

export async function fixText(
  text: string,
  provider: 'openrouter' | 'nvidia',
  apiKey: string,
  model: string,
  customPromptTemplate?: string,
): Promise<string> {
  if (!apiKey) throw new Error('API anahtarı gerekli');
  if (!model) throw new Error('Model seçimi gerekli');

  const template = customPromptTemplate || DEFAULT_AI_PROMPTS.fixText;
  const prompt = template.replace('{text}', text);

  const response = await fetch(`${PROXY_BASE}/chat?provider=${provider}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }),
  });

  if (!response.ok) {
    const detail = await extractApiError(response);
    throw new Error(`API Hatası (${response.status}): ${detail}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || text;
}

export async function translateText(
  text: string,
  provider: 'openrouter' | 'nvidia',
  apiKey: string,
  model: string,
  targetLang = 'Türkçe',
  customPromptTemplate?: string,
): Promise<string> {
  if (!apiKey) throw new Error('API anahtarı gerekli');
  if (!model) throw new Error('Model seçimi gerekli');

  const template = customPromptTemplate || DEFAULT_AI_PROMPTS.translate;
  const prompt = template
    .replace('{targetLang}', targetLang)
    .replace('{text}', text);

  const response = await fetch(`${PROXY_BASE}/chat?provider=${provider}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }),
  });

  if (!response.ok) {
    const detail = await extractApiError(response);
    throw new Error(`API Hatası (${response.status}): ${detail}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || text;
}

export async function fixWord(
  word: string,
  provider: 'openrouter' | 'nvidia',
  apiKey: string,
  model: string,
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
    const detail = await extractApiError(response);
    throw new Error(`Model listesi alınamadı (${response.status}): ${detail}`);
  }

  const data = await response.json();

  if (provider === 'openrouter') {
    return (data.data || []).map((m: any) => ({ id: m.id, name: m.name || m.id }));
  } else {
    return (data.data || []).map((m: any) => ({ id: m.id, name: m.id }));
  }
}

export async function summarizeText(
  text: string,
  provider: 'openrouter' | 'nvidia',
  apiKey: string,
  model: string,
  lang: 'tr' | 'en' = 'tr',
  customPromptTemplate?: string,
): Promise<string> {
  if (!apiKey) throw new Error('API anahtarı gerekli');
  if (!model) throw new Error('Model seçimi gerekli');

  const defaultTemplate = lang === 'tr'
    ? DEFAULT_AI_PROMPTS.summarize
    : 'Summarize the following text in 3-5 bullet points. Return only the summary:\n\n{text}';
  const template = customPromptTemplate || defaultTemplate;
  const prompt = template.replace('{text}', text);

  const response = await fetch(`${PROXY_BASE}/chat?provider=${provider}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }),
  });

  if (!response.ok) {
    const detail = await extractApiError(response);
    throw new Error(`API Hatası (${response.status}): ${detail}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function suggestTags(
  text: string,
  provider: 'openrouter' | 'nvidia',
  apiKey: string,
  model: string,
  lang: 'tr' | 'en' = 'tr'
): Promise<string[]> {
  if (!apiKey) throw new Error('API anahtarı gerekli');
  if (!model) throw new Error('Model seçimi gerekli');

  const prompt = lang === 'tr'
    ? `Aşağıdaki nota uygun 3-5 adet etiket öner. Etiketler tek kelime veya kısa ifade olmalı. Sadece etiketleri virgülle ayrılmış şekilde döndür, başka hiçbir şey yazma:\n\n${text}`
    : `Suggest 3-5 tags for the following note. Tags should be single words or short phrases. Return only the tags, comma-separated, nothing else:\n\n${text}`;

  const response = await fetch(`${PROXY_BASE}/chat?provider=${provider}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const detail = await extractApiError(response);
    throw new Error(`API Hatası (${response.status}): ${detail}`);
  }

  const data = await response.json();
  const raw = (data.choices?.[0]?.message?.content || '').trim();
  return raw.split(',').map((t: string) => t.trim().toLowerCase()).filter((t: string) => t.length > 0);
}

/**
 * Transcribe an audio recording using OpenRouter's Whisper endpoint.
 * audioDataUrl can be a data-url or raw base64 string.
 */
export async function transcribeAudio(
  audioDataUrl: string,
  provider: 'openrouter' | 'nvidia',
  apiKey: string,
): Promise<string> {
  if (!apiKey) throw new Error('API anahtarı gerekli');
  if (provider !== 'openrouter') {
    throw new Error('Ses transkripsiyonu yalnızca OpenRouter sağlayıcısı ile desteklenmektedir.');
  }

  const response = await fetch(`${PROXY_BASE}/transcribe?provider=${provider}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ audioBase64: audioDataUrl, model: 'openai/whisper-large-v3' }),
  });

  if (!response.ok) {
    const detail = await extractApiError(response);
    throw new Error(`Transkripsiyon Hatası (${response.status}): ${detail}`);
  }

  const data = await response.json();
  return (data.text || '').trim();
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function chatWithNote(
  messages: ChatMessage[],
  noteContent: string,
  provider: 'openrouter' | 'nvidia',
  apiKey: string,
  model: string,
  lang: 'tr' | 'en' = 'tr',
  customSystemPrompt?: string,
): Promise<string> {
  if (!apiKey) throw new Error('API anahtarı gerekli');
  const trimmedModel = model.trim();
  if (!trimmedModel) throw new Error('Model seçimi gerekli');

  const defaultTemplate = lang === 'tr'
    ? DEFAULT_AI_PROMPTS.chat
    : 'You are a note assistant. The user\'s note is:\n\n{noteContent}\n\nAnswer questions based on this note.';
  const template = customSystemPrompt || defaultTemplate;
  const systemPrompt = template.replace('{noteContent}', noteContent);

  const response = await fetch(`${PROXY_BASE}/chat?provider=${provider}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: trimmedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    const detail = await extractApiError(response);
    throw new Error(`API Hatası (${response.status}): ${detail} [model: ${trimmedModel}]`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
