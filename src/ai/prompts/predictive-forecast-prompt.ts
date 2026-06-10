import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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

export const predictiveForecastPrompt = ai.definePrompt({
  name: 'predictiveForecastPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: ForecastInputSchema },
  output: { schema: ForecastOutputSchema },
  prompt: `You are an expert econometric modeler. Analyze the historical sequence and project future state.

### INSTRUCTIONS:
1. Inspect the historical sequence for "{{targetColumn}}".
2. Analyze trend architecture and mathematical velocity.
3. Generate exactly {{horizon}} sequential numerical forecast points.
4. Identify risk vectors and drift boundaries.

### RESTRICTIONS:
* 'trajectoryTrend' must be: upward, downward, or stable.
* 'predictedMetrics' must have exactly {{horizon}} points.

INPUT:
Target: {{targetColumn}}
Horizon: {{horizon}}
Snapshot:
{{timeSeriesData}}`,
});
