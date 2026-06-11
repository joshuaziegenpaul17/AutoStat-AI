
/**
 * @fileOverview Groq API Client with fallback logic.
 */

export async function callGroq(messages: any[], responseFormat: { type: 'json_object' } | { type: 'text' } = { type: 'json_object' }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
  let lastError = null;

  for (const model of models) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          response_format: responseFormat,
          temperature: 0.1,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const content = result.choices[0].message.content;
      
      if (responseFormat.type === 'json_object') {
        return JSON.parse(content);
      }
      return content;
    } catch (err) {
      lastError = err;
      console.warn(`Groq model ${model} attempt failed:`, err);
      // Wait slightly before retry if it was a rate limit or capacity issue
      if (err instanceof Error && (err.message.includes('429') || err.message.includes('capacity'))) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      continue;
    }
  }
  
  throw lastError || new Error("All Groq models failed.");
}
