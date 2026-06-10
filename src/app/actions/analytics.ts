'use server';

import { dataQualitySuggesterFlow } from "@/ai/flows/data-quality-suggester";
import { aiInsightsGeneratorFlow } from "@/ai/flows/ai-insights-generator";

/**
 * Runs a structural audit on the dataset.
 * Uses strict serialization to prevent "Unexpected response" errors in Next.js 15.
 */
export async function runAuditAction(csvData: string, columnNames: string[]) {
  try {
    const result = await dataQualitySuggesterFlow({ datasetPreview: csvData, columnNames });
    // Sanitize output for serialization
    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(result)) 
    };
  } catch (error: any) {
    console.error("[Action:Audit] Diagnostic Failure:", error);
    return { 
      success: false, 
      error: String(error?.message || "Structural audit failed") 
    };
  }
}

/**
 * Generates strategic insights using Gemini 2.5 Flash.
 * Includes defensive serialization and error mapping.
 */
export async function runInsightsAction(input: { datasetPreview: string, statsSummary: string, columnNames: string[] }) {
  try {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return { success: false, error: "AI Engine Configuration Missing: API Key is required." };
    }

    const result = await aiInsightsGeneratorFlow(input);
    
    if (!result) {
      throw new Error("AI engine returned no result.");
    }

    // Force serialization to ensure compatibility with Server Action return protocol
    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(result)) 
    };
  } catch (error: any) {
    console.error("[Action:Insights] Critical AI Error:", error);
    
    let errorMessage = String(error?.message || "Synthesis encountered a system error.");
    
    if (errorMessage.includes("429") || errorMessage.toLowerCase().includes("rate limit")) {
      errorMessage = "Rate Limit Exceeded: The AI engine is busy. Please wait a moment.";
    } else if (errorMessage.includes("504") || errorMessage.includes("timeout")) {
      errorMessage = "Connection Timeout: The analysis took too long. Try a smaller dataset.";
    }
    
    return { success: false, error: errorMessage };
  }
}
