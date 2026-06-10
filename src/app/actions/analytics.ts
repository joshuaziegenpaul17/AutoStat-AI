'use server';

import { dataQualitySuggesterFlow } from "@/ai/flows/data-quality-suggester";
import { aiInsightsGeneratorFlow } from "@/ai/flows/ai-insights-generator";

export async function runAuditAction(csvData: string, columnNames: string[]) {
  try {
    console.log("[Action:Audit] Initiating structural diagnostic mission...");
    const result = await dataQualitySuggesterFlow({ datasetPreview: csvData, columnNames });
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[Action:Audit] Diagnostic Failure:", error);
    return { success: false, error: error?.message || "Structural audit failed" };
  }
}

export async function runInsightsAction(input: { datasetPreview: string, statsSummary: string, columnNames: string[] }) {
  try {
    // 1. Check for API configuration
    if (!process.env.GOOGLE_GENAI_API_KEY && !process.env.GEMINI_API_KEY) {
      console.error("[Action:Insights] Missing API Configuration. Verify environment variables.");
      return { success: false, error: "AI Engine Configuration Missing: Please set GOOGLE_GENAI_API_KEY." };
    }

    console.log("[Action:Insights] Triggering strategic synthesis flow...");
    const result = await aiInsightsGeneratorFlow(input);
    
    console.log("[Action:Insights] Synthesis successful.");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[Action:Insights] Critical AI Error Trace:", error);
    
    let errorMessage = error?.message || "Synthesis encountered a system error.";
    
    // Clean up error messages for the UI
    if (errorMessage.includes("403")) errorMessage = "Permission Denied: Verify API Key status.";
    if (errorMessage.includes("404")) errorMessage = "Model Not Found: The specified Gemini version is currently unavailable.";
    if (errorMessage.includes("503")) errorMessage = "Service Unavailable: Gemini is under high load. Please retry.";
    
    return { success: false, error: errorMessage };
  }
}
