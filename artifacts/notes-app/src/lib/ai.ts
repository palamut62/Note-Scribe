export async function fixText(
  text: string,
  provider: 'openrouter' | 'nvidia',
  apiKey: string,
  model: string
): Promise<string> {
  if (!apiKey) throw new Error('API anahtarı gerekli');
  if (!model) throw new Error('Model seçimi gerekli');

  const prompt = "Lütfen aşağıdaki metni düzelt, yazım ve dilbilgisi hatalarını gider, ancak anlamı ve tonu koru:\n\n" + text;

  const url = provider === 'openrouter'
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://integrate.api.nvidia.com/v1/chat/completions';

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = window.location.origin;
    headers['X-Title'] = 'Notlar';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }),
  });

  if (!response.ok) {
    let detail = response.statusText;
    try { const j = await response.json(); detail = j.error?.message || j.message || detail; } catch {}
    throw new Error(`API Hatası (${response.status}): ${detail}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || text;
}

export async function fetchModels(
  provider: 'openrouter' | 'nvidia',
  apiKey: string
): Promise<{ id: string; name: string }[]> {
  if (!apiKey) throw new Error('API anahtarı gerekli');

  const url = provider === 'openrouter'
    ? 'https://openrouter.ai/api/v1/models'
    : 'https://integrate.api.nvidia.com/v1/models';

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
  };
  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = window.location.origin;
    headers['X-Title'] = 'Notlar';
  }

  const response = await fetch(url, { method: 'GET', headers });

  if (!response.ok) {
    let detail = response.statusText;
    try { const j = await response.json(); detail = j.error?.message || j.message || detail; } catch {}
    throw new Error(`Model listesi alınamadı (${response.status}): ${detail}`);
  }

  const data = await response.json();

  if (provider === 'openrouter') {
    return (data.data || []).map((m: any) => ({ id: m.id, name: m.name || m.id }));
  } else {
    return (data.data || []).map((m: any) => ({ id: m.id, name: m.id }));
  }
}
