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
    console.error("[Action:Audit] Critical Failure:", error);
    return { success: false, error: error?.message || "Structural audit failed" };
  }
}

export async function runInsightsAction(input: { datasetPreview: string, statsSummary: string, columnNames: string[] }) {
  try {
    console.log("[Action:Insights] Dispatching strategic synthesis request to AI flow...");
    const result = await aiInsightsGeneratorFlow(input);
    
    // Check if the flow returned a fallback error object due to persistent Gemini timeouts
    if (result.confidenceScore === 0 && result.potentialRisks.includes("API_LATENCY_EXCEEDED")) {
      console.warn("[Action:Insights] Flow returned a latent-state fallback.");
      return { success: false, error: "The AI engine is experiencing high latency. Please wait 15 seconds and click 'Regenerate Insights'." };
    }
    
    console.log("[Action:Insights] Flow returned successful data payload.");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[Action:Insights] Critical Exception:", error);
    return { success: false, error: error?.message || "Insights synthesis encountered a system error." };
  }
}
