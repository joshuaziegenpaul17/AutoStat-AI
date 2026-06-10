'use server';
/**
 * @fileOverview A Genkit flow for analyzing CSV data quality and providing actionable suggestions.
 *
 * - suggestDataQualityImprovements - A function that analyzes CSV data and provides suggestions.
 * - DataQualitySuggesterInput - The input type for the suggestDataQualityImprovements function.
 * - DataQualitySuggesterOutput - The return type for the suggestDataQualityImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DataQualitySuggesterInputSchema = z.object({
  csvData: z
    .string()
    .describe(
      'The raw CSV data as a string. The first row must contain column headers.'
    ),
});
export type DataQualitySuggesterInput = z.infer<
  typeof DataQualitySuggesterInputSchema
>;

const DataQualitySuggesterOutputSchema = z.object({
  summary: z.string().describe('A general summary of the data quality.'),
  suggestions: z
    .array(
      z.object({
        issueType: z
          .enum([
            'Missing Values',
            'Outliers',
            'Inconsistent Format',
            'Data Type Mismatch',
            'Duplicate Rows',
            'Irregular Whitespace',
            'Inconsistent Categorical Values',
            'Potential PII',
            'Other',
          ])
          .describe('The type of data quality issue.'),
        description: z
          .string()
          .describe('A detailed description of the issue, with examples if possible.'),
        suggestion: z
          .string()
          .describe('Actionable advice on how to address the issue.'),
        affectedColumns: z
          .array(z.string())
          .describe('An array of column names affected by this issue.'),
      })
    )
    .describe('An array of specific data quality issues and their suggestions.'),
});
export type DataQualitySuggesterOutput = z.infer<
  typeof DataQualitySuggesterOutputSchema
>;

export async function suggestDataQualityImprovements(
  input: DataQualitySuggesterInput
): Promise<DataQualitySuggesterOutput> {
  return dataQualitySuggesterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dataQualitySuggesterPrompt',
  input: {schema: DataQualitySuggesterInputSchema},
  output: {schema: DataQualitySuggesterOutputSchema},
  prompt: `You are an expert data analyst and data quality specialist. Your task is to analyze the provided CSV data,
identify potential data quality issues, and offer clear, actionable suggestions for remediation.

Focus on common data quality problems such as:
- Missing values
- Outliers
- Inconsistent data formats (e.g., dates, numbers)
- Data type mismatches (e.g., text in a numeric column)
- Duplicate rows
- Irregular whitespace
- Inconsistent categorical values
- Potential Personally Identifiable Information (PII) that might need anonymization or special handling.

Provide a general summary of the overall data quality first. Then, for each identified issue, provide:
- A specific 'issueType' from the enum: 'Missing Values', 'Outliers', 'Inconsistent Format', 'Data Type Mismatch', 'Duplicate Rows', 'Irregular Whitespace', 'Inconsistent Categorical Values', 'Potential PII', 'Other'.
- A 'description' explaining the issue, potentially with specific examples from the data.
- A 'suggestion' detailing how to fix or address the issue.
- An 'affectedColumns' list containing the names of columns relevant to the issue.

Prioritize critical issues that would significantly impact analysis.

CSV Data:
{{csvData}}`,
});

const dataQualitySuggesterFlow = ai.defineFlow(
  {
    name: 'dataQualitySuggesterFlow',
    inputSchema: DataQualitySuggesterInputSchema,
    outputSchema: DataQualitySuggesterOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
