'use server';

import { dataQualitySuggesterFlow } from "@/ai/flows/data-quality-suggester";
import { aiInsightsGeneratorFlow } from "@/ai/flows/ai-insights-generator";

export async function runAuditAction(csvData: string, columnNames: string[]) {
  try {
    console.log("[Action:Audit] Initiating structural diagnostic mission...");
    const result = await dataQualitySuggesterFlow({ datasetPreview: csvData, columnNames });
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    console.error("[Action:Audit] Diagnostic Failure:", error);
    return { success: false, error: String(error?.message || "Structural audit failed") };
  }
}

export async function runInsightsAction(input: { datasetPreview: string, statsSummary: string, columnNames: string[] }) {
  try {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return { success: false, error: "AI Engine Configuration Missing: GEMINI_API_KEY is required." };
    }

    console.log("[Action:Insights] Triggering strategic synthesis flow...");
    const result = await aiInsightsGeneratorFlow(input);
    
    // Ensure the result is a plain serializable object
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    console.error("[Action:Insights] Critical AI Error:", error);
    
    let errorMessage = String(error?.message || "Synthesis encountered a system error.");
    
    if (errorMessage.includes("403")) {
      errorMessage = "Permission Denied: Verify your Gemini API Key.";
    } else if (errorMessage.includes("404")) {
      errorMessage = "Endpoint Not Found: The AI model is currently unavailable in your region.";
    } else if (errorMessage.includes("429")) {
      errorMessage = "Rate Limit Exceeded: Please wait a moment before retrying.";
    }
    
    return { success: false, error: errorMessage };
  }
}
