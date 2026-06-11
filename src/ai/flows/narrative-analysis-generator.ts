
import { callGroq } from '../groq-client';
import { getForecastMessages, ForecastOutputSchema } from '../prompts/predictive-forecast-prompt';

/**
 * Generates predictive temporal analysis narrative using Groq.
 */
export async function narrativeAnalysisGenerator(input: { timeSeriesData: string, targetColumn: string, horizon: number }) {
  try {
    const messages = getForecastMessages(input);
    const result = await callGroq(messages);
    
    return ForecastOutputSchema.parse(result);
  } catch (error) {
    console.error("[Groq:ForecastNarrative] Error:", error);
    return {
      executiveSummary: "Temporal forecasting engine is currently in standby mode.",
      keyInsights: ["Numerical metrics processed locally."],
      trajectoryTrend: 'stable',
      predictedMetrics: [],
      strategicRiskVectors: ["Service capacity reached."],
      confidence: 'Low',
      recommendations: ["Review the local statistical trend lines above."]
    };
  }
}
