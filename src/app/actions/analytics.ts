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

export async function runInsightsAction(csvData: string, columnNames: string[]) {
  try {
    const result = await aiInsightsGeneratorFlow({ datasetPreview: csvData, columnNames });
    if (result.dataAnomalies?.includes("Service temporarily unavailable")) {
      return { success: false, error: "Insights cluster loaded. Try again shortly." };
    }
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error?.message || "Insights synthesis failed" };
  }
}
