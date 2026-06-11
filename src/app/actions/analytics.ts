'use server';

import { generateExecutiveInsights } from "@/lib/ai-insights";

/**
 * Server Action: runInsightsAction
 * Exclusive Groq-powered analytical interpretation.
 */
export async function runInsightsAction(input: any) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return { 
        success: false, 
        error: "Analytical configuration missing. AI insights require GROQ_API_KEY." 
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
      errorMessage = "Analytical engine is currently at capacity. Please try again in a moment.";
    }
    
    return { success: false, error: errorMessage };
  }
}
