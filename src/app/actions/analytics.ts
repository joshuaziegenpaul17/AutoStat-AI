'use server';

import { dataQualitySuggesterFlow } from "@/ai/flows/data-quality-suggester";
import { aiInsightsGeneratorFlow } from "@/ai/flows/ai-insights-generator";

export async function runAuditAction(csvData: string, columnNames: string[]) {
  try {
    console.log("[Action:Audit] Initiating structural diagnostic mission...");
    const result = await dataQualitySuggesterFlow({ datasetPreview: csvData, columnNames });
    // Stringify/Parse ensures only plain objects are returned, avoiding serialization errors
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

    console.log("[Action:Insights] Triggering strategic synthesis flow with Gemini 2.5 Flash...");
    const result = await aiInsightsGeneratorFlow(input);
    
    if (!result) {
      throw new Error("AI engine returned no result.");
    }

    // Ensure the result is a plain serializable object
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    console.error("[Action:Insights] Critical AI Error:", error);
    
    let errorMessage = String(error?.message || "Synthesis encountered a system error.");
    
    if (errorMessage.includes("403")) {
      errorMessage = "Permission Denied: Verify your Gemini API Key.";
    } else if (errorMessage.includes("404")) {
      errorMessage = "Endpoint Not Found: Verify model ID and region.";
    } else if (errorMessage.includes("429") || errorMessage.toLowerCase().includes("rate limit") || errorMessage.toLowerCase().includes("quota")) {
      errorMessage = "Rate Limit Exceeded: The AI engine is experiencing high demand. Automatic retries attempted, please wait a moment before trying again.";
    } else if (error.name === 'ZodError') {
      errorMessage = "Data Mismatch: The AI returned an unexpected format. Retrying may help.";
    }
    
    return { success: false, error: errorMessage };
  }
}
