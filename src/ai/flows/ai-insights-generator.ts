'use server';
/**
 * @fileOverview Strategic Insights AI agent with optimized telemetry and sensible retry limits.
 */

import { ai } from '@/ai/genkit';
import { aiInsightsPrompt, InsightsOutputSchema } from '../prompts/insights-prompt';
import { z } from 'genkit';

const InsightsFlowInputSchema = z.object({
  datasetPreview: z.string(),
  statsSummary: z.string(),
  columnNames: z.array(z.string()),
});

async function generateWithRetry(input: z.infer<typeof InsightsFlowInputSchema>, retries = 2, delay = 2000): Promise<any> {
  try {
    console.log(`[AI Synthesis] Dispatching request. Retries remaining: ${retries}`);
    
    const promptInput = {
      datasetPreview: input.datasetPreview,
      statsSummary: input.statsSummary,
      columnNamesString: input.columnNames.join(", ")
    };

    const response = await aiInsightsPrompt(promptInput);
    
    if (!response || !response.output) {
      throw new Error("Empty analytical output received from engine.");
    }

    return response.output;
  } catch (error: any) {
    const errorMsg = error?.message || "Unknown Engine Error";
    console.error(`[AI Synthesis Error] ${errorMsg}`);

    const isRetryable = errorMsg.includes("503") || 
                        errorMsg.includes("429") || 
                        errorMsg.includes("UNAVAILABLE") || 
                        errorMsg.includes("quota");

    if (retries > 0 && isRetryable) {
      console.warn(`[AI Synthesis] Retrying in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
      return generateWithRetry(input, retries - 1, delay * 2);
    }
    
    throw error;
  }
}

export async function generateAiInsights(input: z.infer<typeof InsightsFlowInputSchema>) {
  return aiInsightsGeneratorFlow(input);
}

export const aiInsightsGeneratorFlow = ai.defineFlow(
  {
    name: 'aiInsightsGeneratorFlow',
    inputSchema: InsightsFlowInputSchema,
    outputSchema: InsightsOutputSchema,
  },
  async (input) => {
    return await generateWithRetry(input);
  }
);
