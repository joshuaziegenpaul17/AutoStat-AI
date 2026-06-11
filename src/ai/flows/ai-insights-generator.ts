'use server';
/**
 * @fileOverview Strategic Interpreter AI agent. Receives ONLY pre-computed statistics.
 * Implements exponential backoff with a max retry window of 30 seconds.
 */

import { ai } from '@/ai/genkit';
import { aiInsightsPrompt, InsightsInputSchema, InsightsOutputSchema } from '../prompts/insights-prompt';
import { z } from 'genkit';

async function generateWithRetry(input: any, retries = 2, delay = 3000) {
  try {
    const { output } = await aiInsightsPrompt(input);
    if (!output) throw new Error("Analytical engine failed to interpret statistics.");
    return output;
  } catch (error: any) {
    const msg = error?.message || "";
    const isRetryable = 
      msg.includes("429") || 
      msg.includes("503") || 
      msg.toLowerCase().includes("limit") || 
      msg.toLowerCase().includes("quota");

    if (retries > 0 && isRetryable) {
      // Exponential backoff with jitter
      const finalDelay = delay + (Math.random() * 1000);
      await new Promise(res => setTimeout(res, finalDelay));
      return generateWithRetry(input, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const aiInsightsGeneratorFlow = ai.defineFlow(
  {
    name: 'aiInsightsGeneratorFlow',
    inputSchema: InsightsInputSchema,
    outputSchema: InsightsOutputSchema,
  },
  async (input) => {
    return await generateWithRetry(input);
  }
);

export async function generateAiInsights(input: z.infer<typeof InsightsInputSchema>) {
  return aiInsightsGeneratorFlow(input);
}
