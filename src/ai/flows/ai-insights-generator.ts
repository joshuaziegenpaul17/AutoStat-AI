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
    console.log(`[AI Synthesis] Dispatching request to Gemini 2.5 Flash. Retries remaining: ${retries}`);
    
    const promptInput = {
      datasetPreview: input.datasetPreview,
      statsSummary: input.statsSummary,
      columnNamesString: input.columnNames.join(", ")
    };

    const response = await aiInsightsPrompt(promptInput);
    
    console.log("RAW GEMINI RESPONSE", JSON.stringify(response, null, 2));

    if (!response || !response.output) {
      console.error("[AI Synthesis] EMPTY OUTPUT FROM GEMINI");
      throw new Error("Empty analytical output received from engine.");
    }

    console.log("PARSED RESPONSE", JSON.stringify(response.output, null, 2));
    return response.output;
  } catch (error: any) {
    const errorMsg = error?.message || "Unknown Engine Error";
    console.error(`[AI Synthesis Error] ${errorMsg}`);

    // Log Zod issues if they exist
    if (error.name === 'ZodError') {
      console.error("[SCHEMA VALIDATION FAILURE]", JSON.stringify(error.errors, null, 2));
    }

    const isRateLimit = errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.toLowerCase().includes("rate limit");
    const isRetryable = isRateLimit || 
                        errorMsg.includes("503") || 
                        errorMsg.includes("UNAVAILABLE") || 
                        errorMsg.includes("high demand") ||
                        errorMsg.includes("deadline");

    if (retries > 0 && isRetryable) {
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
    const result = await generateWithRetry(input);
    console.log("RETURNED TO CLIENT", JSON.stringify(result, null, 2));
    return result;
  }
);
