'use server';

import { generateExecutiveInsights } from "@/lib/ai-insights";

/**
 * Server Action: runInsightsAction
 * Migrated to Groq Infrastructure.
 */
export async function runInsightsAction(input: any) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return { 
        success: false, 
        error: "AI configuration missing. Please ensure GROQ_API_KEY is set." 
      };
    }

    const analyticalResult = await generateExecutiveInsights(input);
    
    return { 
      success: true, 
      data: analyticalResult
    };
  } catch (error: any) {
    console.error("[Groq:ExecutiveAnalysis] Error:", error);
    
    let errorMessage = "AI insights are temporarily unavailable. Statistical metrics remain active.";
    if (error?.message?.includes('429')) {
      errorMessage = "AI engine is currently at capacity. Please try again in a few moments.";
    }
    
    return { success: false, error: errorMessage };
  }
}
