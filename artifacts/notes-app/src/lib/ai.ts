const PROXY_BASE = '/api/ai-proxy';

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
