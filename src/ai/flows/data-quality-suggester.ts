'use server';
/**
 * @fileOverview Data quality auditing AI agent with enhanced high-availability retries.
 */

import { ai } from '@/ai/genkit';
import { dataQualityPrompt, QualityOutputSchema } from '../prompts/quality-prompt';
import { z } from 'genkit';

const QualityFlowInputSchema = z.object({
  datasetPreview: z.string(),
  columnNames: z.array(z.string()),
});

/**
 * Executes the AI prompt with aggressive exponential backoff for 429/503 errors.
 * Base delay increased to 10s to better respect free tier quotas.
 */
async function generateWithRetry(input: any, retries = 5, delay = 10000) {
  try {
    const { output } = await dataQualityPrompt(input);
    if (!output) throw new Error("Data quality diagnostic failed.");
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
      console.warn(`[Quality Flow] Rate limit (429/Busy). Retrying attempt ${6 - retries} in ${Math.round(finalDelay)}ms...`);
      await new Promise(res => setTimeout(res, finalDelay));
      return generateWithRetry(input, retries - 1, delay * 1.5);
    }
    throw error;
  }
}

const dataQualitySuggesterFlow = ai.defineFlow(
  {
    name: 'dataQualitySuggesterFlow',
    inputSchema: QualityFlowInputSchema,
    outputSchema: QualityOutputSchema,
  },
  async (input) => {
    const promptInput = {
      datasetPreview: input.datasetPreview,
      columnNamesString: input.columnNames.join(", ")
    };
    
    return await generateWithRetry(promptInput);
  }
);

/**
 * Public async wrapper for the data quality flow.
 */
export async function suggestDataQualityImprovements(input: { datasetPreview: string, columnNames: string[] }) {
  return dataQualitySuggesterFlow(input);
}
