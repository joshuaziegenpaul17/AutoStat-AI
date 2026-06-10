'use server';
/**
 * @fileOverview Strategic Insights AI agent with enhanced retry resilience.
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
 * Executes the AI prompt with exponential backoff retries for 429/503 errors.
 */
async function generateWithRetry(input: any, retries = 3, delay = 5000) {
  try {
    const { output } = await aiInsightsPrompt(input);
    if (!output) throw new Error("Analytical engine produced no data.");
    return output;
  } catch (error: any) {
    const msg = error?.message || "";
    const isRetryable = msg.includes("429") || msg.includes("503") || msg.includes("limit") || msg.includes("busy");

    if (retries > 0 && isRetryable) {
      console.warn(`[Insights Flow] Rate limit or busy. Retrying in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
      return generateWithRetry(input, retries - 1, delay * 2);
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
