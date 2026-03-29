export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { message, mode, history = [], context } = req.body;

  const modeLabel = mode === 'fri' ? 'friendly' : mode === 'tech' ? 'technical' : 'professional';

  const systemPrompt = `You are JAGG's portfolio assistant — a smart, concise AI embedded in ${context.name}'s portfolio. JAGG is a BSIT 4th Year student at PLSP, skilled in ${context.skills}. Answer questions about JAGG, his skills, projects, and general tech topics. Keep replies short (under 120 words) and helpful. Current tone: ${modeLabel}.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: systemPrompt,
        messages: [...history, { role: 'user', content: message }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic error:', data);
      return res.status(500).json({ reply: 'API error: ' + (data.error?.message || response.status) });
    }

    const reply = data.content?.[0]?.text || 'Sorry, no response generated.';
    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ reply: 'Server error. Please try again.' });
  }
}