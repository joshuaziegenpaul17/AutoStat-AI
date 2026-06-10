'use server';
/**
 * @fileOverview Predictive narrative analysis AI agent.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NarrativeAnalysisGeneratorInputSchema = z.object({
  analysisResults: z.string().describe('The raw or summarized statistical analysis results as a string.'),
  context: z.string().optional().describe('Optional additional context.'),
});
export type NarrativeAnalysisGeneratorInput = z.infer<typeof NarrativeAnalysisGeneratorInputSchema>;

const NarrativeAnalysisGeneratorOutputSchema = z.object({
  executiveSummary: z.string().describe('A high-level overview of the findings.'),
  keyInsights: z.array(z.string()).describe('List of critical observations.'),
  dataTrends: z.string().describe('Interpretation of identified patterns.'),
  forecasting: z.object({
    projection: z.string().describe('A detailed projection.'),
    confidence: z.string().describe('Confidence level (e.g., High, Medium, Low).'),
    risks: z.array(z.string()).describe('Potential risks.'),
    timeframe: z.string().describe('The estimated period.'),
  }).describe('Predictive analysis.'),
  recommendations: z.array(z.string()).describe('Actionable next steps.'),
});
export type NarrativeAnalysisGeneratorOutput = z.infer<typeof NarrativeAnalysisGeneratorOutputSchema>;

const narrativeAnalysisPrompt = ai.definePrompt({
  name: 'narrativeAnalysisPrompt',
  input: { schema: NarrativeAnalysisGeneratorInputSchema },
  output: { schema: NarrativeAnalysisGeneratorOutputSchema },
  prompt: `You are an expert statistical analyst and forecaster. Provide a structured interpretation of these statistical results and a forward-looking forecast.

Statistical Analysis Results:
{{{analysisResults}}}

{{#if context}}
Additional Context:
{{{context}}}
{{/if}}

Include:
1. Executive Summary.
2. Key Insights.
3. Trend analysis.
4. Data-driven forecast: Projection, confidence level, risks, and timeframe.
5. Actionable recommendations.`,
});

async function generateWithRetry(input: NarrativeAnalysisGeneratorInput, retries = 3, delay = 2000): Promise<NarrativeAnalysisGeneratorOutput> {
  try {
    const { output } = await narrativeAnalysisPrompt(input);
    if (!output) throw new Error("Model returned empty output.");
    return output;
  } catch (error: any) {
    const msg = error?.message || "";
    const isTransient = msg.includes("503") || msg.includes("429") || msg.includes("UNAVAILABLE") || msg.includes("high demand") || msg.includes("deadline");

    if (retries > 0 && isTransient) {
      console.warn(`[Forecast Retry] AI engine busy. Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(res => setTimeout(res, delay));
      return generateWithRetry(input, retries - 1, delay * 1.5);
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
        executiveSummary: "The AI analysis engine is currently experiencing high demand. Please trigger a manual retry.",
        keyInsights: ["Numerical metrics processed locally.", "Structural charts remain active."],
        dataTrends: "Trend interpretation temporarily unavailable.",
        forecasting: {
          projection: "Current platform load prevents real-time predictive modeling.",
          confidence: "Low",
          risks: ["Service availability"],
          timeframe: "Immediate"
        },
        recommendations: ["Review descriptive statistics cards.", "Retry forecasting in a few moments."]
      };
    }
  }
);
