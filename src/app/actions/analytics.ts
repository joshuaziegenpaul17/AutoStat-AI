'use server';

import { generateAiInsights } from "@/ai/flows/ai-insights-generator";

/**
 * Generates an executive summary based on pre-computed local statistics.
 * This minimized payload prevents rate limiting by avoiding sending full datasets.
 */
export async function runInsightsAction(input: any) {
  try {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return { success: false, error: "AI Service Unavailable: Credentials missing." };
    }

    const analyticalResult = await generateAiInsights(input);
    
    if (!analyticalResult) {
      throw new Error("Empty response from interpretation engine.");
    }

    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(analyticalResult))
    };
  } catch (error: any) {
    console.error("[Action:ExecutiveAnalysis] Error:", error);
    
    let errorMessage = "Interpretation engine is currently busy.";
    if (error?.message?.includes("429") || error?.message?.toLowerCase().includes("rate limit")) {
      errorMessage = "Engine Capacity Reached: Please wait a moment before re-analyzing.";
    }
    
    return { success: false, error: errorMessage };
  }
}
