'use server';
/**
 * @fileOverview Strategic Insights AI agent with enhanced telemetry and error reporting.
 */

import { ai } from '@/ai/genkit';
import { aiInsightsPrompt, InsightsOutputSchema } from '../prompts/insights-prompt';
import { z } from 'genkit';

const InsightsFlowInputSchema = z.object({
  datasetPreview: z.string(),
  statsSummary: z.string(),
  columnNames: z.array(z.string()),
});

async function generateWithRetry(input: z.infer<typeof InsightsFlowInputSchema>, retries = 3, delay = 2000): Promise<any> {
  try {
    console.log(`[AI Synthesis] Dispatching request to Gemini...`);
    
    // Pre-process column names to avoid Handlebars join helper issues
    const promptInput = {
      datasetPreview: input.datasetPreview,
      statsSummary: input.statsSummary,
      columnNamesString: input.columnNames.join(", ")
    };

    // Use the defined prompt which leverages the default model from Genkit initialization
    const response = await aiInsightsPrompt(promptInput);
    
    if (!response || !response.output) {
      throw new Error("Gemini returned a null or empty output object.");
    }

    console.log(`[AI Synthesis] Synthesis successful. Confidence: ${response.output.confidenceScore}%`);
    return response.output;
  } catch (error: any) {
    const errorMsg = (error?.message || "Unknown Engine Error").toUpperCase();
    console.error(`[AI Synthesis Error] ${errorMsg}`);

    // Detection of retryable transient errors (503, 429, etc.)
    const isRetryable = errorMsg.includes("503") || 
                        errorMsg.includes("429") || 
                        errorMsg.includes("UNAVAILABLE") || 
                        errorMsg.includes("OVERLOADED") ||
                        errorMsg.includes("RESOURCE_EXHAUSTED") ||
                        errorMsg.includes("DEADLINE_EXCEEDED");

    if (retries > 0 && isRetryable) {
      console.warn(`[AI Synthesis] Transient failure. Retrying in ${delay}ms... (Remaining: ${retries})`);
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
