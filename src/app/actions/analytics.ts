
'use server';

import { generateAiInsights } from "@/ai/flows/ai-insights-generator";
import { suggestDataQualityImprovements } from "@/ai/flows/data-quality-suggester";

/**
 * Performs a structural data quality audit.
 * Analyzes structure, missing values, and anomalies.
 */
export async function runAuditAction(previewData: string, columnHeaders: string[]) {
  try {
    const diagnosticResult = await suggestDataQualityImprovements({ datasetPreview: previewData, columnNames: columnHeaders });
    if (!diagnosticResult) throw new Error("Quality diagnostic failed to produce a report.");
    
    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(diagnosticResult)) 
    };
  } catch (error: any) {
    console.error("[Action:DataQualityAudit] Error:", error);
    return { 
      success: false, 
      error: "The analytical engine encountered a technical error." 
    };
  }
}

/**
 * Generates an executive summary and strategic insights.
 * Uses optimized server-side flows with rate-limit protection.
 */
export async function runInsightsAction(input: { datasetPreview: string, statsSummary: string, columnNames: string[] }) {
  try {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return { success: false, error: "Analytical Engine Configuration Missing: Credentials required." };
    }

    const analyticalResult = await generateAiInsights(input);
    
    if (!analyticalResult) {
      throw new Error("The analytical engine returned an empty response.");
    }

    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(analyticalResult))
    };
  } catch (error: any) {
    console.error("[Action:ExecutiveAnalysis] Error:", error);
    
    let errorMessage = "The analytical engine encountered a technical difficulty.";
    if (error?.message?.includes("429") || error?.message?.toLowerCase().includes("rate limit")) {
      errorMessage = "Engine Capacity Reached: The analytical engine is busy. Please try again in a moment.";
    }
    
    return { success: false, error: errorMessage };
  }
}
