'use server';
/**
 * @fileOverview Strategic Insights AI agent with high-availability retries.
 */

import { ai } from '@/ai/genkit';
import { aiInsightsPrompt, InsightsInputSchema, InsightsOutputSchema } from '../prompts/insights-prompt';

async function generateWithRetry(input: any, retries = 4, delay = 2000): Promise<any> {
  try {
    const { output } = await aiInsightsPrompt(input);
    if (!output) throw new Error("Model returned empty output.");
    return output;
  } catch (error: any) {
    const msg = error?.message || "";
    // Handle transient errors from Gemini
    const isTransient = msg.includes("503") || msg.includes("429") || msg.includes("UNAVAILABLE") || msg.includes("high demand") || msg.includes("deadline");

    if (retries > 0 && isTransient) {
      console.warn(`[Insights Retry] Engine busy. Retrying in ${delay}ms... (Retries left: ${retries})`);
      await new Promise(res => setTimeout(res, delay));
      return generateWithRetry(input, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function generateAiInsights(input: { datasetPreview: string, columnNames: string[] }) {
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
        recommendations: ["Retry diagnostic mission shortly."],
        confidenceScore: 0,
        dataAnomalies: ["Service temporarily unavailable"]
      };
    }
  }
);
