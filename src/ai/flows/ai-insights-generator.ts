'use server';
/**
 * @fileOverview Strategic Interpreter AI agent. Receives ONLY pre-computed statistics.
 */

import { ai } from '@/ai/genkit';
import { aiInsightsPrompt, InsightsInputSchema, InsightsOutputSchema } from '../prompts/insights-prompt';
import { z } from 'genkit';

async function generateWithRetry(input: any, retries = 3, delay = 5000) {
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
      const jitter = Math.random() * 2000;
      const finalDelay = delay + jitter;
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
