import { z } from 'zod';
import { callGroq } from './groq';

/**
 * @fileOverview AI Insights Engine (Groq Implementation).
 * Validates and processes statistical summaries into strategic business narratives.
 */

export const InsightsOutputSchema = z.object({
  executiveSummary: z.string(),
  keyFindings: z.array(z.string()),
  businessOpportunities: z.array(z.string()),
  recommendations: z.array(z.string()),
  confidenceScore: z.number(),
});

export type InsightsOutput = z.infer<typeof InsightsOutputSchema>;

export async function generateExecutiveInsights(input: any): Promise<InsightsOutput> {
  const systemPrompt = `You are an elite enterprise data analyst. Your task is to interpret statistical summaries and provide strategic business insights.
DO NOT hallucinate data. Only use the numbers provided.
Your response MUST be a valid JSON object matching this schema:
{
  "executiveSummary": "A concise high-level strategic overview (1-2 sentences).",
  "keyFindings": ["3-5 core statistical observations."],
  "businessOpportunities": ["2-3 areas for growth or optimization based on trends."],
  "recommendations": ["3 actionable pieces of advice for stakeholders."],
  "confidenceScore": number (0-100 based on data quality and sample size)
}`;

  const userPrompt = `### STATISTICAL SUMMARY:
${JSON.stringify(input, null, 2)}

### ANALYTICAL REQUEST:
Provide a professional executive interpretation. Focus on trajectories, correlations, and anomalies.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  const result = await callGroq(messages);
  return InsightsOutputSchema.parse(result);
}
