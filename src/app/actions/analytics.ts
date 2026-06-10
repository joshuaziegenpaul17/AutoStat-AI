'use server';

import { suggestDataQualityImprovements } from "@/ai/flows/data-quality-suggester";
import { narrativeAnalysisGenerator } from "@/ai/flows/narrative-analysis-generator";

export async function runAuditAction(csvData: string) {
  try {
    const result = await suggestDataQualityImprovements({ csvData });
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error?.message || "Audit failed" };
  }
}

export async function runForecastAction(statsSummary: string, context: string) {
  try {
    const result = await narrativeAnalysisGenerator({ 
      analysisResults: statsSummary, 
      context 
    });
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error?.message || "Forecasting failed" };
  }
}