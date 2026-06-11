
import { z } from 'zod';

export const ForecastInputSchema = z.object({
  timeSeriesData: z.string(),
  targetColumn: z.string(),
  horizon: z.number(),
});

export const ForecastOutputSchema = z.object({
  executiveSummary: z.string(),
  keyInsights: z.array(z.string()),
  trajectoryTrend: z.enum(['upward', 'downward', 'stable']),
  predictedMetrics: z.array(z.number()),
  strategicRiskVectors: z.array(z.string()),
  confidence: z.enum(['High', 'Medium', 'Low']),
  recommendations: z.array(z.string()),
});

export function getForecastMessages(input: z.infer<typeof ForecastInputSchema>) {
  const system = `You are an expert econometric modeler. Analyze the historical sequence and project future state. Output MUST be valid JSON.`;

  const user = `### INSTRUCTIONS:
1. Inspect the historical sequence for "${input.targetColumn}".
2. Analyze trend architecture and mathematical velocity.
3. Generate exactly ${input.horizon} sequential numerical forecast points.
4. Identify risk vectors and drift boundaries.

### RESTRICTIONS:
* 'trajectoryTrend' must be: upward, downward, or stable.
* 'predictedMetrics' must have exactly ${input.horizon} points.

INPUT:
Target: ${input.targetColumn}
Horizon: ${input.horizon}
Snapshot:
${input.timeSeriesData}`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user }
  ];
}
