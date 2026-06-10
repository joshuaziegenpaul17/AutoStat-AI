'use server';
/**
 * @fileOverview Strategic Insights AI agent with enhanced high-availability and diagnostics.
 */

import { ai } from '@/ai/genkit';
import { aiInsightsPrompt, InsightsOutputSchema } from '../prompts/insights-prompt';
import { z } from 'genkit';

// Flow input schema remains compatible with the UI/Action layer
const InsightsFlowInputSchema = z.object({
  datasetPreview: z.string(),
  statsSummary: z.string(),
  columnNames: z.array(z.string()),
});

async function generateWithRetry(input: z.infer<typeof InsightsFlowInputSchema>, retries = 3, delay = 2000): Promise<any> {
  try {
    console.log(`[AI Flow Trace] Request Payload:`, {
      datasetLength: input.datasetPreview.length,
      columns: input.columnNames,
      statsSummary: input.statsSummary
    });

    // Pre-join column names to avoid Handlebars "join" helper errors
    const promptInput = {
      datasetPreview: input.datasetPreview,
      statsSummary: input.statsSummary,
      columnNamesString: input.columnNames.join(", ")
    };

    const { output } = await aiInsightsPrompt(promptInput);
    
    if (!output) {
      throw new Error("Gemini returned an empty response object.");
    }

    console.log(`[AI Flow Trace] Successful Response:`, output);
    return output;
  } catch (error: any) {
    const msg = (error?.message || "").toUpperCase();
    console.error(`[AI Flow Error] ${msg}`);

    // Detection of retryable transient errors
    const isRetryable = msg.includes("503") || 
                        msg.includes("429") || 
                        msg.includes("UNAVAILABLE") || 
                        msg.includes("DEADLINE") ||
                        msg.includes("OVERLOADED") ||
                        msg.includes("RESOURCE_EXHAUSTED");

    if (retries > 0 && isRetryable) {
      console.warn(`[AI Flow] Transient failure detected. Retrying in ${delay}ms... (Retries left: ${retries})`);
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
