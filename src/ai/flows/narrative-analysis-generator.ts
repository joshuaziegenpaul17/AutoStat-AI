'use server';
/**
 * @fileOverview Predictive temporal analysis AI agent with high-availability retries.
 */

import { ai } from '@/ai/genkit';
import { predictiveForecastPrompt, ForecastInputSchema, ForecastOutputSchema } from '../prompts/predictive-forecast-prompt';

async function generateWithRetry(input: any, retries = 3, delay = 2000): Promise<any> {
  try {
    const { output } = await predictiveForecastPrompt(input);
    if (!output) throw new Error("Model returned empty output.");
    return output;
  } catch (error: any) {
    const msg = error?.message || "";
    const isTransient = msg.includes("503") || msg.includes("429") || msg.includes("UNAVAILABLE") || msg.includes("high demand") || msg.includes("deadline");

    if (retries > 0 && isTransient) {
      console.warn(`[Forecast Retry] AI engine busy. Retrying in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
      return generateWithRetry(input, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function narrativeAnalysisGenerator(input: { timeSeriesData: string, targetColumn: string, horizon: number }) {
  return narrativeAnalysisGeneratorFlow(input);
}

export const narrativeAnalysisGeneratorFlow = ai.defineFlow(
  {
    name: 'narrativeAnalysisGeneratorFlow',
    inputSchema: ForecastInputSchema,
    outputSchema: ForecastOutputSchema,
  },
  async (input) => {
    try {
      return await generateWithRetry(input);
    } catch (err) {
      console.error("[Forecast Critical] Failure in narrative generation.", err);
      return {
        executiveSummary: "Forecasting engine is currently in standby mode.",
        keyInsights: ["Numerical metrics processed locally."],
        trajectoryTrend: 'stable',
        predictedMetrics: [],
        strategicRiskVectors: ["Service capacity reached."],
        confidence: 'Low',
        recommendations: ["Retry the temporal forecast shortly."]
      };
    }
  }
);
