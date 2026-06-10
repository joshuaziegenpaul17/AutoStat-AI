'use server';
/**
 * @fileOverview Data quality auditing AI agent with enhanced retry resilience.
 */

import { ai } from '@/ai/genkit';
import { dataQualityPrompt, QualityOutputSchema } from '../prompts/quality-prompt';
import { z } from 'genkit';

const QualityFlowInputSchema = z.object({
  datasetPreview: z.string(),
  columnNames: z.array(z.string()),
});

/**
 * Executes the AI prompt with exponential backoff retries for 429/503 errors.
 */
async function generateWithRetry(input: any, retries = 3, delay = 5000) {
  try {
    const { output } = await dataQualityPrompt(input);
    if (!output) throw new Error("Data quality diagnostic failed.");
    return output;
  } catch (error: any) {
    const msg = error?.message || "";
    const isRetryable = msg.includes("429") || msg.includes("503") || msg.includes("limit") || msg.includes("busy");

    if (retries > 0 && isRetryable) {
      console.warn(`[Quality Flow] Rate limit or busy. Retrying in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
      return generateWithRetry(input, retries - 1, delay * 2);
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
