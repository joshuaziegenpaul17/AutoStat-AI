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
    // Check for API configuration
    if (!process.env.GOOGLE_GENAI_API_KEY && !process.env.GEMINI_API_KEY) {
      console.error("[Action:Insights] Missing API Configuration.");
      return { success: false, error: "AI Engine Configuration Missing: Please ensure GOOGLE_GENAI_API_KEY is set." };
    }

    console.log("[Action:Insights] Triggering strategic synthesis flow...");
    const result = await aiInsightsGeneratorFlow(input);
    
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[Action:Insights] Critical AI Error:", error);
    
    let errorMessage = error?.message || "Synthesis encountered a system error.";
    
    // Mapping common API errors to user-friendly messages
    if (errorMessage.includes("403")) errorMessage = "Permission Denied: Verify your API Key permissions.";
    if (errorMessage.includes("404")) errorMessage = "Model Connection Error: The Gemini service endpoint was not found.";
    if (errorMessage.includes("503") || errorMessage.includes("504")) errorMessage = "Service Unavailable: The AI engine is currently under high load. Please try again in a few seconds.";
    if (errorMessage.includes("429")) errorMessage = "Rate Limit Exceeded: Too many requests. Please pause before retrying.";
    
    return { success: false, error: errorMessage };
  }
}
