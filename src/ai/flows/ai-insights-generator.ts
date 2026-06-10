'use server';
/**
 * @fileOverview Strategic Insights AI agent with enhanced high-availability and diagnostics.
 */

import { ai } from '@/ai/genkit';
import { aiInsightsPrompt, InsightsInputSchema, InsightsOutputSchema } from '../prompts/insights-prompt';
import { z } from 'genkit';

async function generateWithRetry(input: z.infer<typeof InsightsInputSchema>, retries = 5, delay = 3000): Promise<any> {
  try {
    console.log(`[Insights Flow] Attempting generation (retries left: ${retries})...`);
    const { output } = await aiInsightsPrompt(input);
    if (!output) throw new Error("Model returned empty output.");
    return output;
  } catch (error: any) {
    const msg = (error?.message || "").toUpperCase();
    console.error(`[Insights Flow] Generation Error Detail: ${msg}`);

    // Detection of retryable transient errors (503, 429, etc.)
    const isTransient = msg.includes("503") || 
                        msg.includes("429") || 
                        msg.includes("UNAVAILABLE") || 
                        msg.includes("DEADLINE") ||
                        msg.includes("OVERLOADED") ||
                        msg.includes("RESOURCE_EXHAUSTED");

    if (retries > 0 && isTransient) {
      console.warn(`[Insights Flow] Transient failure detected. Retrying in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
      // Exponential backoff
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
      console.error("[Insights Flow] Terminal failure after all retries.", err);
      // Return a clean fallback object that identifies the failure to the frontend
      return {
        executiveSummary: `Synthesis mission deferred: ${err.message || 'The AI service is currently unavailable'}.`,
        keyFindings: ["Statistical pipeline processed.", "Neural synthesis failed."],
        strongestCorrelations: ["Pending engine availability."],
        potentialRisks: ["API_LATENCY_EXCEEDED"],
        detectedAnomalies: ["ENGINE_UNAVAILABLE"],
        forecastAnalysis: "Analysis paused.",
        businessOpportunities: ["Retry in 15 seconds."],
        recommendations: ["Refresh the synthesis request shortly."],
        confidenceScore: 0
      };
    }
  }
);
