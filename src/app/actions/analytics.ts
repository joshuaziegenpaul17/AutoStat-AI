'use server';

import { suggestDataQualityImprovements } from "@/ai/flows/data-quality-suggester";
import { generateAiInsights } from "@/ai/flows/ai-insights-generator";

// Counter to track total AI calls in this session (per server instance)
let totalAiRequests = 0;

/**
 * Runs a structural audit on the dataset.
 */
export async function runAuditAction(csvData: string, columnNames: string[]) {
  try {
    const result = await suggestDataQualityImprovements({ datasetPreview: csvData, columnNames });
    if (!result) throw new Error("Quality diagnostic produced no data.");
    
    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(result)) 
    };
  } catch (error: any) {
    console.error("[Action:Audit] Failure:", error);
    return { 
      success: false, 
      error: String(error?.message || "Structural audit encountered a difficulty.") 
    };
  }
}

/**
 * Generates strategic insights using Gemini 2.0 Flash.
 */
export async function runInsightsAction(input: { datasetPreview: string, statsSummary: string, columnNames: string[] }) {
  try {
    totalAiRequests++;
    console.log(`[AI Request Monitor] Total Gemini Calls Initiated: ${totalAiRequests}`);
    console.log(`[AI Request Monitor] Current Request Batch: 1 click -> 1 call triggered.`);

    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return { success: false, error: "AI Engine Configuration Missing: API Key is required." };
    }

    const result = await generateAiInsights(input);
    
    if (!result) {
      throw new Error("AI engine returned an empty synthesis.");
    }

    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(result)),
      requestId: totalAiRequests
    };
  } catch (error: any) {
    console.error("[Action:Insights] Error Trace:", error);
    
    let errorMessage = String(error?.message || "Synthesis encountered a system difficulty.");
    if (errorMessage.includes("429") || errorMessage.toLowerCase().includes("rate limit")) {
      errorMessage = "Rate Limit Exceeded: The AI engine is busy. Please wait a moment.";
    }
    
    return { success: false, error: errorMessage };
  }
}
