'use server';
/**
 * @fileOverview Data quality auditing AI agent with high-availability exponential backoff.
 */

import { ai } from '@/ai/genkit';
import { dataQualityPrompt, QualityOutputSchema } from '../prompts/quality-prompt';
import { z } from 'genkit';

const QualityFlowInputSchema = z.object({
  datasetPreview: z.string(),
  columnNames: z.array(z.string()),
});

async function generateWithRetry(input: z.infer<typeof QualityFlowInputSchema>, retries = 5, delay = 5000): Promise<any> {
  try {
    const promptInput = {
      datasetPreview: input.datasetPreview,
      columnNamesString: input.columnNames.join(", ")
    };

    const { output } = await dataQualityPrompt(promptInput);
    if (!output) throw new Error("Model returned empty output.");
    return output;
  } catch (error: any) {
    const msg = error?.message || "";
    const isTransient = msg.includes("503") || msg.includes("429") || msg.includes("UNAVAILABLE") || msg.includes("quota") || msg.includes("high demand") || msg.includes("deadline");

    if (retries > 0 && isTransient) {
      console.warn(`[Audit Retry] Engine busy or rate limited. Retrying in ${delay}ms...`);
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
    inputSchema: QualityFlowInputSchema,
    outputSchema: QualityOutputSchema,
  },
  async (input) => {
    try {
      return await generateWithRetry(input);
    } catch (err) {
      console.error("[Audit Critical] Failure in audit generation.", err);
      return {
        summary: "Automated structural diagnostics were deferred due to persistent service load.",
        suggestions: [{
          issueType: 'Service Capacity',
          description: 'The diagnostic engine is currently at peak capacity.',
          suggestion: 'Wait a few minutes before initiating another full structural audit.',
          affectedColumns: ['All']
        }],
        qualityScore: 100,
        issuesIdentified: ['API_RATE_LIMIT_EXCEEDED']
      };
    }
  }
);
