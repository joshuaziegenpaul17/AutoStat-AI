'use server';
/**
 * @fileOverview Data quality auditing AI agent with optimized retries.
 */

import { ai } from '@/ai/genkit';
import { dataQualityPrompt, QualityOutputSchema } from '../prompts/quality-prompt';
import { z } from 'genkit';

const QualityFlowInputSchema = z.object({
  datasetPreview: z.string(),
  columnNames: z.array(z.string()),
});

async function generateWithRetry(input: any, retries = 3, delay = 2000) {
  try {
    const { output } = await dataQualityPrompt(input);
    if (!output) throw new Error("Data quality diagnostic failed.");
    return output;
  } catch (error: any) {
    const msg = error?.message || "";
    const isRetryable = msg.includes("429") || msg.includes("503") || msg.toLowerCase().includes("limit");

    if (retries > 0 && isRetryable) {
      await new Promise(res => setTimeout(res, delay + Math.random() * 1000));
      return generateWithRetry(input, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const dataQualitySuggesterFlow = ai.defineFlow(
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

export async function suggestDataQualityImprovements(input: { datasetPreview: string, columnNames: string[] }) {
  return dataQualitySuggesterFlow(input);
}
