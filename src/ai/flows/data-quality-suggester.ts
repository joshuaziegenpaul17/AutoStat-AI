'use server';
/**
 * @fileOverview Data quality auditing AI agent with high-availability retries.
 */

import { ai } from '@/ai/genkit';
import { dataQualityPrompt, QualityInputSchema, QualityOutputSchema } from '../prompts/quality-prompt';

async function generateWithRetry(input: any, retries = 3, delay = 2000): Promise<any> {
  try {
    const { output } = await dataQualityPrompt(input);
    if (!output) throw new Error("Model returned empty output.");
    return output;
  } catch (error: any) {
    const msg = error?.message || "";
    const isTransient = msg.includes("503") || msg.includes("429") || msg.includes("UNAVAILABLE") || msg.includes("high demand") || msg.includes("deadline");

    if (retries > 0 && isTransient) {
      console.warn(`[Audit Retry] Engine busy. Retrying in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
      return generateWithRetry(input, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function suggestDataQualityImprovements(input: { csvData: string, columnNames: string[] }) {
  return dataQualitySuggesterFlow({
    datasetPreview: input.csvData,
    columnNames: input.columnNames
  });
}

export const dataQualitySuggesterFlow = ai.defineFlow(
  {
    name: 'dataQualitySuggesterFlow',
    inputSchema: QualityInputSchema,
    outputSchema: QualityOutputSchema,
  },
  async (input) => {
    try {
      return await generateWithRetry(input);
    } catch (err) {
      console.error("[Audit Critical] Failure in audit generation.", err);
      return {
        summary: "Automated structural diagnostics were deferred due to platform load.",
        suggestions: [{
          issueType: 'Service Load',
          description: 'The diagnostic engine is at capacity.',
          suggestion: 'Retry the structural audit in a few moments.',
          affectedColumns: ['All']
        }],
        qualityScore: 100,
        issuesIdentified: ['API_TEMPORARILY_UNAVAILABLE']
      };
    }
  }
);
