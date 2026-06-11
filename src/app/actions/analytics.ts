
'use server';

import { generateAiInsights } from "@/ai/flows/ai-insights-generator";

/**
 * Generates an executive summary based on pre-computed local statistics.
 * Migrated to Groq for enhanced reliability and performance.
 */
export async function runInsightsAction(input: any) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return { success: false, error: "AI services are temporarily unavailable (API Key missing)." };
    }

    const analyticalResult = await generateAiInsights(input);
    
    if (!analyticalResult) {
      throw new Error("Analytical engine returned no data.");
    }

    return { 
      success: true, 
      data: analyticalResult
    };
  } catch (error: any) {
    console.error("[Action:ExecutiveAnalysis] Error:", error);
    
    let errorMessage = "AI insights are temporarily unavailable. Please try again later.";
    const errorMsg = error?.message?.toLowerCase() || "";
    
    if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("limit")) {
      errorMessage = "AI analysis engine is currently at capacity. Standard statistics are still functional.";
    }
    
    return { success: false, error: errorMessage };
  }
}
