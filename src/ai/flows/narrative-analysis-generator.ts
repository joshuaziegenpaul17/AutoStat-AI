'use server';
/**
 * @fileOverview A robust Genkit flow for generating structured statistical narratives including forecasting.
 * Includes automated retries for transient 503/429 errors and graceful fallbacks.
 *
 * - narrativeAnalysisGenerator - Main entry point for generating narratives.
 * - NarrativeAnalysisGeneratorInput - Input schema for the flow.
 * - NarrativeAnalysisGeneratorOutput - Structured output schema for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NarrativeAnalysisGeneratorInputSchema = z.object({
  analysisResults: z
    .string()
    .describe('The raw or summarized statistical analysis results as a string, potentially JSON formatted.'),
  context: z
    .string()
    .optional()
    .describe('Optional additional context about the dataset or analysis.'),
});
export type NarrativeAnalysisGeneratorInput = z.infer<typeof NarrativeAnalysisGeneratorInputSchema>;

const NarrativeAnalysisGeneratorOutputSchema = z.object({
  executiveSummary: z.string().describe('A high-level overview of the findings.'),
  keyInsights: z.array(z.string()).describe('List of critical observations from the data.'),
  dataTrends: z.string().describe('Interpretation of identified patterns and trends.'),
  forecasting: z.object({
    projection: z.string().describe('A detailed, logical projection of where the data might head based on current variance and trend vectors.'),
    confidence: z.string().describe('Estimated confidence level in the forecast (e.g., High, Medium, Low) with reasoning.'),
    risks: z.array(z.string()).describe('Potential risks or variables that could disrupt the forecast.'),
    timeframe: z.string().describe('The estimated period this forecast covers.'),
  }).describe('Predictive analysis and future projections based on current data patterns.'),
  recommendations: z.array(z.string()).describe('Actionable next steps based on the analysis.'),
});
export type NarrativeAnalysisGeneratorOutput = z.infer<typeof NarrativeAnalysisGeneratorOutputSchema>;

const narrativeAnalysisPrompt = ai.definePrompt({
  name: 'narrativeAnalysisPrompt',
  input: {schema: NarrativeAnalysisGeneratorInputSchema},
  output: {schema: NarrativeAnalysisGeneratorOutputSchema},
  prompt: `You are an expert statistical analyst and business strategist. Provide a structured interpretation of these statistical results.

Statistical Analysis Results:
{{{analysisResults}}}

{{#if context}}
Additional Context:
{{{context}}}
{{/if}}

Include:
1. Executive Summary.
2. Key Insights.
3. Detailed trend analysis.
4. Data-driven forecast: Projection, confidence level, risks, and timeframe.
5. Actionable recommendations.`,
});

async function generateWithRetry(input: NarrativeAnalysisGeneratorInput, retries = 3, delay = 1000): Promise<NarrativeAnalysisGeneratorOutput> {
  try {
    const {output} = await narrativeAnalysisPrompt(input);
    if (!output) throw new Error("Model returned empty output.");
    return output;
  } catch (error: any) {
    const msg = error?.message || "";
    const isTransient = msg.includes("503") || msg.includes("429") || msg.includes("UNAVAILABLE") || msg.includes("high demand");

    if (retries > 0 && isTransient) {
      console.warn(`[Genkit Retry] Forecast engine busy. Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(res => setTimeout(res, delay));
      return generateWithRetry(input, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function narrativeAnalysisGenerator(input: NarrativeAnalysisGeneratorInput): Promise<NarrativeAnalysisGeneratorOutput> {
  return narrativeAnalysisGeneratorFlow(input);
}

const narrativeAnalysisGeneratorFlow = ai.defineFlow(
  {
    name: 'narrativeAnalysisGeneratorFlow',
    inputSchema: NarrativeAnalysisGeneratorInputSchema,
    outputSchema: NarrativeAnalysisGeneratorOutputSchema,
  },
  async (input) => {
    try {
      return await generateWithRetry(input);
    } catch (err) {
      console.error("[Genkit Critical] Permanent failure in narrative generation.", err);
      return {
        executiveSummary: "The AI analysis engine is currently experiencing high demand. Automated textual synthesis is temporarily limited.",
        keyInsights: [
          "Numerical metrics were processed successfully and are visible in the tables.",
          "Structural charts remain fully interactive."
        ],
        dataTrends: "Trend interpretation is temporarily unavailable while platform services recover.",
        forecasting: {
          projection: "Current platform load prevents real-time predictive modeling.",
          confidence: "Low (System Latency)",
          risks: ["Upstream service availability"],
          timeframe: "Immediate"
        },
        recommendations: [
          "Review the descriptive statistics cards for variance shifts.",
          "Retry the forecast in a few moments."
        ]
      };
    }
  }
);