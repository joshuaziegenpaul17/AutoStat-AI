'use server';
/**
 * @fileOverview Strategic Insights AI agent with optimized telemetry and robust 429 handling.
 */

import { ai } from '@/ai/genkit';
import { aiInsightsPrompt, InsightsOutputSchema } from '../prompts/insights-prompt';
import { z } from 'genkit';

const InsightsFlowInputSchema = z.object({
  datasetPreview: z.string(),
  statsSummary: z.string(),
  columnNames: z.array(z.string()),
});

async function generateWithRetry(input: z.infer<typeof InsightsFlowInputSchema>, retries = 4, delay = 6000): Promise<any> {
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

    const isRateLimit = errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.toLowerCase().includes("rate limit");
    const isRetryable = isRateLimit || 
                        errorMsg.includes("503") || 
                        errorMsg.includes("UNAVAILABLE") || 
                        errorMsg.includes("high demand") ||
                        errorMsg.includes("deadline");

    if (retries > 0 && isRetryable) {
      // Exponential backoff with jitter
      const jitter = Math.random() * 2000;
      const waitTime = (isRateLimit ? delay * 2 : delay) + jitter;
      
      console.warn(`[AI Synthesis] ${isRateLimit ? 'Rate limit' : 'Transient error'} detected. Waiting ${Math.round(waitTime)}ms before retry...`);
      await new Promise(res => setTimeout(res, waitTime));
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
