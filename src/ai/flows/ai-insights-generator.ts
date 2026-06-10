'use server';
/**
 * @fileOverview Strategic Insights AI agent with enhanced high-availability.
 */

import { ai } from '@/ai/genkit';
import { aiInsightsPrompt, InsightsInputSchema, InsightsOutputSchema } from '../prompts/insights-prompt';
import { z } from 'genkit';

async function generateWithRetry(input: z.infer<typeof InsightsInputSchema>, retries = 3, delay = 2500): Promise<any> {
  try {
    console.log(`[Insights Flow] Attempting generation (retries left: ${retries})...`);
    const { output } = await aiInsightsPrompt(input);
    if (!output) throw new Error("Model returned empty output.");
    return output;
  } catch (error: any) {
    const msg = error?.message || "";
    // Identification of retryable transient errors
    const isTransient = msg.includes("503") || 
                        msg.includes("429") || 
                        msg.includes("UNAVAILABLE") || 
                        msg.includes("high demand") || 
                        msg.includes("deadline") ||
                        msg.includes("overloaded");

    if (retries > 0 && isTransient) {
      console.warn(`[Insights Retry] Engine busy or transient error detected: ${msg.substring(0, 50)}. Retrying in ${delay}ms...`);
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
    } catch (err: any) {
      console.error("[Insights Critical] Terminal failure in insights generation.", err);
      // Construct a meaningful error fallback rather than generic "high demand"
      return {
        executiveSummary: `Analysis mission deferred due to engine latency: ${err.message || 'Unknown error'}.`,
        keyFindings: ["Statistical pipeline operational.", "Neural synthesis cluster offline."],
        strongestCorrelations: ["Correlation coefficients calculated but narrative generation paused."],
        potentialRisks: ["API_LATENCY_EXCEEDED"],
        detectedAnomalies: ["ENGINE_TEMPORARILY_UNAVAILABLE"],
        forecastAnalysis: "Historical sequence analysis is pending cluster availability.",
        businessOpportunities: ["Wait 30 seconds and click 'Regenerate Insights'."],
        recommendations: ["Ensure your dataset contains at least 20 rows for meaningful synthesis."],
        confidenceScore: 0
      };
    }
  }
);
