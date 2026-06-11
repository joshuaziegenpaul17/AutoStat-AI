'use server';

import { generateAiInsights } from "@/ai/flows/ai-insights-generator";

/**
 * Generates an executive summary based on pre-computed local statistics.
 * Uses a highly condensed payload to minimize token usage and stay within quota.
 */
export async function runInsightsAction(input: any) {
  try {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return { success: false, error: "AI services are temporarily unavailable (API Key missing)." };
    }

    const analyticalResult = await generateAiInsights(input);
    
    if (!analyticalResult) {
      throw new Error("Analytical engine returned no data.");
    }

    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(analyticalResult))
    };
  } catch (error: any) {
    console.error("[Action:ExecutiveAnalysis] Error:", error);
    
    let errorMessage = "AI insights are temporarily unavailable.";
    const errorMsg = error?.message?.toLowerCase() || "";
    
    if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("limit")) {
      errorMessage = "AI services are currently at capacity. Please try again later.";
    } else if (errorMsg.includes("503") || errorMsg.includes("unavailable")) {
      errorMessage = "AI analysis engine is currently offline.";
    }
    
    return { success: false, error: errorMessage };
  }
}
