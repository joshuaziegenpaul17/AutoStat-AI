'use server';
/**
 * @fileOverview A Genkit flow for generating professional textual interpretations of statistical analysis results.
 *
 * - narrativeAnalysisGenerator - A function that orchestrates the generation of statistical narratives.
 * - NarrativeAnalysisGeneratorInput - The input type for the narrativeAnalysisGenerator function.
 * - NarrativeAnalysisGeneratorOutput - The return type for the narrativeAnalysisGenerator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const NarrativeAnalysisGeneratorInputSchema = z.object({
  analysisResults: z
    .string()
    .describe('The raw or summarized statistical analysis results as a string, potentially JSON formatted.'),
  context: z
    .string()
    .optional()
    .describe(
      'Optional additional context about the dataset or analysis, such as the research question or goals.'
    ),
});
export type NarrativeAnalysisGeneratorInput = z.infer<
  typeof NarrativeAnalysisGeneratorInputSchema
>;

// Output Schema
const NarrativeAnalysisGeneratorOutputSchema = z.string().describe('A professional, textual interpretation of the statistical results.');
export type NarrativeAnalysisGeneratorOutput = z.infer<
  typeof NarrativeAnalysisGeneratorOutputSchema
>;

/**
 * Generates a professional textual interpretation of statistical analysis results.
 * @param input - The input containing statistical results and optional context.
 * @returns A promise that resolves to the generated narrative.
 */
export async function narrativeAnalysisGenerator(
  input: NarrativeAnalysisGeneratorInput
): Promise<NarrativeAnalysisGeneratorOutput> {
  return narrativeAnalysisGeneratorFlow(input);
}

// Define the prompt for the AI model
const narrativeAnalysisPrompt = ai.definePrompt({
  name: 'narrativeAnalysisPrompt',
  input: {schema: NarrativeAnalysisGeneratorInputSchema},
  output: {schema: NarrativeAnalysisGeneratorOutputSchema},
  prompt: `You are an expert statistical analyst. Your task is to provide a professional, concise, and insightful textual interpretation of the provided statistical analysis results.\n  \nFocus on highlighting key findings, identifying significant trends, discussing implications, and suggesting potential next steps or areas for further investigation. Avoid jargon where possible, or explain it clearly.\n\nStatistical Analysis Results:\n{{{analysisResults}}}\n\n{{#if context}}\nAdditional Context:\n{{{context}}}\n{{/if}}\n\nProvide your interpretation in a well-structured, easy-to-understand narrative.`,
});

// Define the Genkit flow
const narrativeAnalysisGeneratorFlow = ai.defineFlow(
  {
    name: 'narrativeAnalysisGeneratorFlow',
    inputSchema: NarrativeAnalysisGeneratorInputSchema,
    outputSchema: NarrativeAnalysisGeneratorOutputSchema,
  },
  async (input) => {
    const {output} = await narrativeAnalysisPrompt(input);
    if (!output) {
      throw new Error('Failed to generate narrative analysis.');
    }
    return output;
  }
);
