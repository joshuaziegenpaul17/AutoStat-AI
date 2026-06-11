
import { callGroq } from '../groq-client';
import { getInsightsMessages, InsightsInputSchema, InsightsOutputSchema } from '../prompts/insights-prompt';
import { z } from 'zod';

/**
 * Generates AI-powered strategic insights using Groq.
 */
export async function generateAiInsights(input: z.infer<typeof InsightsInputSchema>) {
  try {
    const messages = getInsightsMessages(input);
    const result = await callGroq(messages);
    
    // Validate output with Zod
    return InsightsOutputSchema.parse(result);
  } catch (error) {
    console.error("[Groq:AiInsights] Error:", error);
    throw new Error("AI insights are temporarily unavailable. Statistical metrics remain active.");
  }
}
