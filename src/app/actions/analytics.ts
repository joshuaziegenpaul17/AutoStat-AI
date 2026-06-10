'use server';

import { dataQualitySuggesterFlow } from "@/ai/flows/data-quality-suggester";
import { aiInsightsGeneratorFlow } from "@/ai/flows/ai-insights-generator";

export async function runAuditAction(csvData: string, columnNames: string[]) {
  try {
    console.log("[Action:Audit] Processing structural audit request...");
    const result = await dataQualitySuggesterFlow({ datasetPreview: csvData, columnNames });
    if (result.issuesIdentified?.includes("API_TEMPORARILY_UNAVAILABLE") || result.qualityScore === 100 && result.summary.includes("deferred")) {
      return { success: false, error: "The analytical engine is currently busy. Please retry in a few moments." };
    }
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[Action:Audit] Failed:", error);
    return { success: false, error: error?.message || "Structural audit failed" };
  }
}

export async function runInsightsAction(input: { datasetPreview: string, statsSummary: string, columnNames: string[] }) {
  try {
    console.log("[Action:Insights] Processing strategic synthesis request...");
    const result = await aiInsightsGeneratorFlow(input);
    
    // Check if the flow returned a fallback error object
    if (result.confidenceScore === 0 && result.potentialRisks.includes("API_LATENCY_EXCEEDED")) {
      return { success: false, error: "The AI engine is currently experiencing high latency. Please wait 15 seconds and try again." };
    }
    
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[Action:Insights] Failed:", error);
    return { success: false, error: error?.message || "Insights synthesis failed" };
  }
}
