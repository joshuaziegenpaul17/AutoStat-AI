'use server';
/**
 * @fileOverview Strategic Insights AI agent with enhanced statistical context.
 */

import { ai } from '@/ai/genkit';
import { aiInsightsPrompt, InsightsInputSchema, InsightsOutputSchema } from '../prompts/insights-prompt';
import { z } from 'genkit';

async function generateWithRetry(input: z.infer<typeof InsightsInputSchema>, retries = 2, delay = 1500): Promise<any> {
  try {
    const { output } = await aiInsightsPrompt(input);
    if (!output) throw new Error("Model returned empty output.");
    return output;
  } catch (error: any) {
    const msg = error?.message || "";
    const isTransient = msg.includes("503") || msg.includes("429") || msg.includes("UNAVAILABLE") || msg.includes("high demand") || msg.includes("deadline");

    if (retries > 0 && isTransient) {
      console.warn(`[Insights Retry] Engine busy. Retrying in ${delay}ms... (Retries left: ${retries})`);
      await new Promise(res => setTimeout(res, delay));
      return generateWithRetry(input, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function generateAiInsights(input: z.infer<typeof InsightsInputSchema>) {
  return aiInsightsGeneratorFlow(input);
}

export const aiInsightsGeneratorFlow = ai.defineFlow(
  {
    name: 'aiInsightsGeneratorFlow',
    inputSchema: InsightsInputSchema,
    outputSchema: InsightsOutputSchema,
  },
  async (input) => {
    try {
      return await generateWithRetry(input);
    } catch (err) {
      console.error("[Insights Critical] Failure in insights generation.", err);
      return {
        executiveSummary: "Strategic synthesis is currently deferred due to platform load.",
        keyFindings: ["Raw data processed locally.", "Engine awaiting clearance."],
        strongestCorrelations: ["Statistical relationships identified but narrative deferred."],
        potentialRisks: ["Service temporarily unavailable"],
        detectedAnomalies: ["High API latency detected."],
        forecastAnalysis: "Forecast narrative unavailable.",
        businessOpportunities: ["Retry diagnostic mission shortly."],
        recommendations: ["Ensure stable network connection."],
        confidenceScore: 0
      };
    }
  }
);
