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

// Input Schema
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

// Output Schema
const NarrativeAnalysisGeneratorOutputSchema = z.object({
  executiveSummary: z.string().describe('A high-level overview of the findings.'),
  keyInsights: z.array(z.string()).describe('List of critical observations from the data.'),
  dataTrends: z.string().describe('Interpretation of identified patterns and trends.'),
  forecasting: z.object({
    projection: z.string().describe('A logical projection of where the data might head.'),
    confidence: z.string().describe('Estimated confidence level in the forecast.'),
    risks: z.array(z.string()).describe('Potential risks or variables that could disrupt the forecast.'),
  }).describe('Predictive analysis and future projections based on current data patterns.'),
  recommendations: z.array(z.string()).describe('Actionable next steps based on the analysis.'),
});
export type NarrativeAnalysisGeneratorOutput = z.infer<typeof NarrativeAnalysisGeneratorOutputSchema>;

/**
 * Prompt definition with structured output guidance.
 */
const narrativeAnalysisPrompt = ai.definePrompt({
  name: 'narrativeAnalysisPrompt',
  input: {schema: NarrativeAnalysisGeneratorInputSchema},
  output: {schema: NarrativeAnalysisGeneratorOutputSchema},
  prompt: `You are an expert statistical analyst and business strategist. Your task is to provide a professional, structured textual interpretation of the provided statistical results.

Statistical Analysis Results:
{{{analysisResults}}}

{{#if context}}
Additional Context:
{{{context}}}
{{/if}}

Provide your interpretation in a structured format with:
1. An executive summary.
2. Specific key insights.
3. Detailed trend analysis.
4. A data-driven forecast (projection, confidence, and risks).
5. Clear, actionable recommendations.

Focus on identifying business impact and potential future outcomes based on the numerical distributions.`,
});

/**
 * Internal helper to handle transient errors with exponential backoff.
 */
async function generateWithRetry(input: NarrativeAnalysisGeneratorInput, retries = 3, delay = 1000): Promise<NarrativeAnalysisGeneratorOutput> {
  try {
    const {output} = await narrativeAnalysisPrompt(input);
    if (!output) throw new Error("Model returned empty output.");
    return output;
  } catch (error: any) {
    const msg = error?.message || "";
    const isTransient = msg.includes("503") || msg.includes("429") || msg.includes("UNAVAILABLE") || msg.includes("high demand");

    if (retries > 0 && isTransient) {
      console.warn(`[Genkit Retry] Narrative engine busy. Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(res => setTimeout(res, delay));
      return generateWithRetry(input, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * The main Genkit flow with integrated retry logic and a safe fallback.
 */
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
      // Fallback response to keep the UI functional
      return {
        executiveSummary: "The AI analysis engine is currently experiencing high demand.",
        keyInsights: [
          "Statistical calculations were processed successfully and are visible in the tables/charts.",
          "Automated textual interpretation is temporarily limited."
        ],
        dataTrends: "Trend interpretation is temporarily unavailable while platform services recover.",
        forecasting: {
          projection: "Current system load prevents real-time predictive modeling.",
          confidence: "Low (System Latency)",
          risks: ["Upstream service availability", "High query volume"]
        },
        recommendations: [
          "Review the numerical descriptive statistics cards for variance and distribution shifts.",
          "Try regenerating the insights in a few minutes."
        ]
      };
    }
  }
);
