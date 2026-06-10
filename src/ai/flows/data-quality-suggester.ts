'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DataQualitySuggesterInputSchema = z.object({
  csvData: z.string().describe('The raw CSV data as a string.'),
});
export type DataQualitySuggesterInput = z.infer<typeof DataQualitySuggesterInputSchema>;

const DataQualitySuggesterOutputSchema = z.object({
  summary: z.string().describe('A general summary of the data quality.'),
  suggestions: z.array(
    z.object({
      issueType: z.enum([
        'Missing Values',
        'Outliers',
        'Inconsistent Format',
        'Data Type Mismatch',
        'Duplicate Rows',
        'Irregular Whitespace',
        'Inconsistent Categorical Values',
        'Potential PII',
        'Other',
      ]),
      description: z.string(),
      suggestion: z.string(),
      affectedColumns: z.array(z.string()),
    })
  ).describe('Specific quality issues identified.'),
});
export type DataQualitySuggesterOutput = z.infer<typeof DataQualitySuggesterOutputSchema>;

const prompt = ai.definePrompt({
  name: 'dataQualitySuggesterPrompt',
  input: { schema: DataQualitySuggesterInputSchema },
  output: { schema: DataQualitySuggesterOutputSchema },
  prompt: `You are an expert data quality auditor. Analyze the provided CSV data for missing values, outliers, and structural inconsistencies. Provide a professional summary and specific actionable suggestions.

CSV Data:
{{csvData}}`,
});

async function generateWithRetry(input: DataQualitySuggesterInput, retries = 3, delay = 1500): Promise<DataQualitySuggesterOutput> {
  try {
    const { output } = await prompt(input);
    if (!output) throw new Error("Model returned empty output.");
    return output;
  } catch (error: any) {
    const msg = error?.message || "";
    const isTransient = msg.includes("503") || msg.includes("429") || msg.includes("UNAVAILABLE") || msg.includes("high demand");

    if (retries > 0 && isTransient) {
      console.warn(`[Audit Retry] Engine busy. Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(res => setTimeout(res, delay));
      return generateWithRetry(input, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function suggestDataQualityImprovements(input: DataQualitySuggesterInput): Promise<DataQualitySuggesterOutput> {
  return dataQualitySuggesterFlow(input);
}

const dataQualitySuggesterFlow = ai.defineFlow(
  {
    name: 'dataQualitySuggesterFlow',
    inputSchema: DataQualitySuggesterInputSchema,
    outputSchema: DataQualitySuggesterOutputSchema,
  },
  async (input) => {
    try {
      return await generateWithRetry(input);
    } catch (err) {
      console.error("[Audit Critical] Permanent failure in audit generation.", err);
      return {
        summary: "The automated audit engine is currently experiencing high load. Structural diagnostics were deferred.",
        suggestions: [
          {
            issueType: 'Other',
            description: 'Automated diagnostic pipeline is currently in standby mode.',
            suggestion: 'Please try running a manual re-scan in a few moments.',
            affectedColumns: ['All Columns']
          }
        ]
      };
    }
  }
);
