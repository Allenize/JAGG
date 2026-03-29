export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { message, mode, history, context } = req.body;

  const systemPrompt = `You are JAGG's portfolio assistant — a smart, concise AI embedded in ${context.name}'s portfolio. JAGG is a BSIT 4th Year student at PLSP, skilled in ${context.skills}. Answer questions about JAGG, his skills, projects, and general tech topics. Keep replies short (under 120 words) and helpful. Current mode: ${mode}.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,   // ← from env variable
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
  const reply = data.content?.[0]?.text || 'Sorry, no response generated.';
  res.status(200).json({ reply });
}