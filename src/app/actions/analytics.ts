'use server';

import { dataQualitySuggesterFlow } from "@/ai/flows/data-quality-suggester";
import { narrativeAnalysisGeneratorFlow } from "@/ai/flows/narrative-analysis-generator";

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

export async function runForecastAction(timeSeriesData: string, targetColumn: string, horizon: number = 6) {
  try {
    const result = await narrativeAnalysisGeneratorFlow({ timeSeriesData, targetColumn, horizon });
    if (result.strategicRiskVectors[0]?.includes("capacity reached")) {
      return { success: false, error: "Forecast cluster loaded. Try again shortly." };
    }
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error?.message || "Forecasting failed" };
  }
}
