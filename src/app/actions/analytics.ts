'use server';

import { dataQualitySuggesterFlow } from "@/ai/flows/data-quality-suggester";
import { aiInsightsGeneratorFlow } from "@/ai/flows/ai-insights-generator";

export async function runAuditAction(csvData: string, columnNames: string[]) {
  try {
    const result = await dataQualitySuggesterFlow({ datasetPreview: csvData, columnNames });
    if (result.issuesIdentified?.includes("API_TEMPORARILY_UNAVAILABLE")) {
      return { success: false, error: "Service busy, please retry shortly." };
    }
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error?.message || "Audit failed" };
  }
}

export async function runInsightsAction(input: { datasetPreview: string, statsSummary: string, columnNames: string[] }) {
  try {
    const result = await aiInsightsGeneratorFlow(input);
    if (result.detectedAnomalies?.includes("Service temporarily unavailable") || result.confidenceScore === 0) {
      return { success: false, error: "Insights cluster loaded. Try again shortly." };
    }
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error?.message || "Insights synthesis failed" };
  }
}
