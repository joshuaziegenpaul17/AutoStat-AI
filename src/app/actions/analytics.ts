'use server';

import { dataQualitySuggesterFlow } from "@/ai/flows/data-quality-suggester";
import { aiInsightsGeneratorFlow } from "@/ai/flows/ai-insights-generator";

export async function runAuditAction(csvData: string, columnNames: string[]) {
  try {
    console.log("[Action:Audit] Processing structural audit request...");
    const result = await dataQualitySuggesterFlow({ datasetPreview: csvData, columnNames });
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[Action:Audit] Critical Failure:", error);
    return { success: false, error: error?.message || "Structural audit failed" };
  }
}

export async function runInsightsAction(input: { datasetPreview: string, statsSummary: string, columnNames: string[] }) {
  try {
    // 1. Check for API configuration
    if (!process.env.GOOGLE_GENAI_API_KEY && !process.env.GEMINI_API_KEY) {
      return { success: false, error: "AI Engine Configuration Missing: Please set GOOGLE_GENAI_API_KEY in your environment." };
    }

    console.log("[Action:Insights] Dispatching strategic synthesis request to AI flow...");
    const result = await aiInsightsGeneratorFlow(input);
    
    console.log("[Action:Insights] Flow returned successful data payload.");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[Action:Insights] Critical Exception:", error);
    
    // Determine if it's a specific API error we should clean up for the user
    let errorMessage = error?.message || "Insights synthesis encountered a system error.";
    if (errorMessage.includes("403")) errorMessage = "Permission Denied: Check if your API Key is valid and enabled for Gemini 1.5.";
    if (errorMessage.includes("404")) errorMessage = "Model Not Found: The specified Gemini model version may be unavailable.";
    
    return { success: false, error: errorMessage };
  }
}
