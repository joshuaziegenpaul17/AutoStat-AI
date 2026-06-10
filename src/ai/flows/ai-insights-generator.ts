'use server';
/**
 * @fileOverview Strategic Insights AI agent with enhanced high-availability retries.
 */

import { ai } from '@/ai/genkit';
import { aiInsightsPrompt, InsightsOutputSchema } from '../prompts/insights-prompt';
import { z } from 'genkit';

const InsightsFlowInputSchema = z.object({
  datasetPreview: z.string(),
  statsSummary: z.string(),
  columnNames: z.array(z.string()),
});

/**
 * Executes the AI prompt with aggressive exponential backoff for 429/503 errors.
 * Base delay increased to 10s to better respect free tier quotas.
 */
async function generateWithRetry(input: any, retries = 5, delay = 10000) {
  try {
    const { output } = await aiInsightsPrompt(input);
    if (!output) throw new Error("Analytical engine produced no data.");
    return output;
  } catch (error: any) {
    const msg = error?.message || "";
    const isRetryable = 
      msg.includes("429") || 
      msg.includes("503") || 
      msg.toLowerCase().includes("limit") || 
      msg.toLowerCase().includes("busy") ||
      msg.toLowerCase().includes("quota");

    if (retries > 0 && isRetryable) {
      const jitter = Math.random() * 3000;
      const finalDelay = delay + jitter;
      console.warn(`[Insights Flow] Rate limit (429/Busy). Retrying attempt ${6 - retries} in ${Math.round(finalDelay)}ms...`);
      await new Promise(res => setTimeout(res, finalDelay));
      return generateWithRetry(input, retries - 1, delay * 1.5);
    }
    throw error;
  }
}

const aiInsightsGeneratorFlow = ai.defineFlow(
  {
    name: 'aiInsightsGeneratorFlow',
    inputSchema: InsightsFlowInputSchema,
    outputSchema: InsightsOutputSchema,
  },
  async (input) => {
    const promptInput = {
      datasetPreview: input.datasetPreview,
      statsSummary: input.statsSummary,
      columnNamesString: input.columnNames.join(", ")
    };

    return await generateWithRetry(promptInput);
  }
);

/**
 * Public async wrapper for the insights flow.
 */
export async function generateAiInsights(input: z.infer<typeof InsightsFlowInputSchema>) {
  return aiInsightsGeneratorFlow(input);
}
