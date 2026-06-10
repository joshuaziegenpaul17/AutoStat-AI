'use server';
/**
 * @fileOverview Data quality auditing AI agent.
 */

import { ai } from '@/ai/genkit';
import { dataQualityPrompt, QualityOutputSchema } from '../prompts/quality-prompt';
import { z } from 'genkit';

const QualityFlowInputSchema = z.object({
  datasetPreview: z.string(),
  columnNames: z.array(z.string()),
});

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
    const { output } = await dataQualityPrompt(promptInput);
    if (!output) throw new Error("Data quality diagnostic failed.");
    return output;
  }
);

/**
 * Public async wrapper for the data quality flow.
 */
export async function suggestDataQualityImprovements(input: { datasetPreview: string, columnNames: string[] }) {
  return dataQualitySuggesterFlow(input);
}
