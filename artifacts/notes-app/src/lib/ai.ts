export async function fixText(
  text: string,
  provider: 'openrouter' | 'nvidia',
  apiKey: string,
  model: string
): Promise<string> {
  if (!apiKey) throw new Error('API key is required');
  if (!model) throw new Error('Model is required');

  const prompt = "Lütfen aşağıdaki metni düzelt, yazım ve dilbilgisi hatalarını gider, ancak anlamı ve tonu koru:\n\n" + text;
  
  const url = provider === 'openrouter' 
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://integrate.api.nvidia.com/v1/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }]
    }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || text;
}

export async function fetchModels(
  provider: 'openrouter' | 'nvidia',
  apiKey: string
): Promise<{ id: string; name: string }[]> {
  if (!apiKey) throw new Error('API key is required');

  const url = provider === 'openrouter'
    ? 'https://openrouter.ai/api/v1/models'
    : 'https://integrate.api.nvidia.com/v1/models';

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (provider === 'openrouter') {
    return (data.data || []).map((m: any) => ({ id: m.id, name: m.name || m.id }));
  } else {
    // NVIDIA format varies, usually similar to OpenAI
    return (data.data || []).map((m: any) => ({ id: m.id, name: m.id }));
  }
}
