'use server';
/**
 * @fileOverview Strategic Insights AI agent with enhanced telemetry and resilient exponential backoff.
 */

import { ai } from '@/ai/genkit';
import { aiInsightsPrompt, InsightsOutputSchema } from '../prompts/insights-prompt';
import { z } from 'genkit';

const InsightsFlowInputSchema = z.object({
  datasetPreview: z.string(),
  statsSummary: z.string(),
  columnNames: z.array(z.string()),
});

async function generateWithRetry(input: z.infer<typeof InsightsFlowInputSchema>, retries = 5, delay = 5000): Promise<any> {
  try {
    console.log(`[AI Synthesis] Dispatching request to Gemini. Columns: ${input.columnNames.length}. Retries remaining: ${retries}`);
    
    const promptInput = {
      datasetPreview: input.datasetPreview,
      statsSummary: input.statsSummary,
      columnNamesString: input.columnNames.join(", ")
    };

    const response = await aiInsightsPrompt(promptInput);
    
    if (!response || !response.output) {
      throw new Error("Gemini returned a null or empty output object.");
    }

    console.log(`[AI Synthesis] Synthesis successful. Confidence: ${response.output.confidenceScore}%`);
    return response.output;
  } catch (error: any) {
    const errorMsg = error?.message || "Unknown Engine Error";
    console.error(`[AI Synthesis Error] ${errorMsg}`);

    const isRetryable = errorMsg.includes("503") || 
                        errorMsg.includes("429") || 
                        errorMsg.includes("UNAVAILABLE") || 
                        errorMsg.includes("OVERLOADED") ||
                        errorMsg.includes("RESOURCE_EXHAUSTED") ||
                        errorMsg.includes("quota");

    if (retries > 0 && isRetryable) {
      console.warn(`[AI Synthesis] Rate limit or transient error detected. Retrying in ${delay}ms...`);
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
