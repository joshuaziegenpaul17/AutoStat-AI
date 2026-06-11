import { z } from 'zod';
import { callGroq } from './groq';

/**
 * @fileOverview AI Insights Engine (Groq Implementation).
 * Validates and processes statistical summaries into strategic business narratives.
 * PRESENTED AS SUGGESTED INSIGHTS FOR INFORMATIONAL PURPOSES.
 */

export const InsightsOutputSchema = z.object({
  executiveSummary: z.string(),
  businessSummary: z.string(),
  keyFindings: z.array(z.string()),
  businessOpportunities: z.array(z.string()),
  riskAnalysis: z.string(),
  recommendations: z.array(z.string()),
  forecastInterpretation: z.string(),
  confidenceScore: z.number(),
});

export type InsightsOutput = z.infer<typeof InsightsOutputSchema>;

export async function generateExecutiveInsights(input: any): Promise<InsightsOutput> {
  const systemPrompt = `You are an elite enterprise data analyst and management consultant. Your task is to interpret statistical summaries and provide deep strategic business insights.
DO NOT hallucinate data. Only use the numbers provided.
Your response MUST be a valid JSON object matching this schema.
Present all findings as "suggested insights" or "analytical observations" to avoid implying professional advisory services.

Required Schema:
{
  "executiveSummary": "A concise high-level strategic overview.",
  "businessSummary": "A deep 2-paragraph narrative summary of the dataset's analytical implications.",
  "keyFindings": ["4-6 core statistical observations with specific mentions of metrics."],
  "businessOpportunities": ["3-4 suggested areas for growth or optimization based on patterns."],
  "riskAnalysis": "A detailed paragraph identifying potential statistical risks, bias, or volatility in the current data trends.",
  "recommendations": ["4-5 suggested strategic insights for further stakeholder consideration."],
  "forecastInterpretation": "A dedicated paragraph explaining the statistical trajectory and its probabilistic implications.",
  "confidenceScore": number (0-95 based on data quality and sample size)
}`;

  const userPrompt = `### STATISTICAL SUMMARY:
${JSON.stringify(input, null, 2)}

### ANALYTICAL REQUEST:
Provide a comprehensive consulting-style interpretation. Focus on trajectories, correlations, and anomalies. Present all recommendations as suggested insights.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  const result = await callGroq(messages);
  return InsightsOutputSchema.parse(result);
}
