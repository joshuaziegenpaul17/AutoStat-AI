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
      return { success: false, error: "AI Engine Configuration Missing: Please ensure GOOGLE_GENAI_API_KEY is set in your environment." };
    }

    console.log("[Action:Insights] Triggering strategic synthesis flow...");
    const result = await aiInsightsGeneratorFlow(input);
    
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[Action:Insights] Critical AI Error:", error);
    
    let errorMessage = error?.message || "Synthesis encountered a system error.";
    
    // Detailed mapping for common API errors
    if (errorMessage.includes("403")) {
      errorMessage = "Permission Denied (403): Your API Key may be invalid or lacks permissions for this model.";
    } else if (errorMessage.includes("404")) {
      errorMessage = `Model Connection Error (404): The Gemini service endpoint was not found. This usually means the model ID or region is incorrect. (Raw: ${errorMessage})`;
    } else if (errorMessage.includes("503") || errorMessage.includes("504")) {
      errorMessage = "Service Overload (503/504): The AI engine is under high demand. Please retry in a moment.";
    } else if (errorMessage.includes("429")) {
      errorMessage = "Rate Limit Exceeded (429): Too many requests. Please pause before retrying.";
    }
    
    return { success: false, error: errorMessage };
  }
}
