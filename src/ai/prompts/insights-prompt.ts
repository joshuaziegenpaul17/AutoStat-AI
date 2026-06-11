
import { z } from 'zod';

export const InsightsInputSchema = z.object({
  datasetSummary: z.object({
    rowCount: z.number(),
    columnCount: z.number(),
    columnNames: z.array(z.string()),
    missingValues: z.number(),
    qualityScore: z.number(),
  }),
  statsMetrics: z.string(),
  topCorrelations: z.array(z.string()),
  outlierCounts: z.record(z.number()),
  forecastTrajectory: z.string(),
});

export const InsightsOutputSchema = z.object({
  executiveSummary: z.string(),
  keyFindings: z.array(z.string()),
  businessOpportunities: z.array(z.string()),
  recommendations: z.array(z.string()),
  confidenceScore: z.number(),
});

export function getInsightsMessages(input: z.infer<typeof InsightsInputSchema>) {
  const system = `You are an elite enterprise data analyst. You have been provided with a pre-computed statistical summary of a dataset.
DO NOT hallucinate raw data. Only interpret the statistical summary provided.
Output MUST be valid JSON matching the schema.`;

  const user = `### DATA METADATA:
Rows: ${input.datasetSummary.rowCount}
Columns: ${input.datasetSummary.columnCount} (${input.datasetSummary.columnNames.join(', ')})
Data Quality Score: ${input.datasetSummary.qualityScore}/100
Missing Values: ${input.datasetSummary.missingValues}

### STATISTICAL EVIDENCE:
Metrics: ${input.statsMetrics}
Top Correlations:
${input.topCorrelations.map(c => `- ${c}`).join('\n')}

Outlier Profile:
${Object.entries(input.outlierCounts).map(([k, v]) => `- ${k}: ${v} outliers`).join('\n')}

Local Forecast Trend: ${input.forecastTrajectory}

### ANALYTICAL PROTOCOL:
1. Executive Synthesis: Provide an authoritative strategic summary based ON THE NUMBERS provided.
2. Opportunity Mapping: Translate these statistical findings into actionable business growth areas.
3. Strategic Recommendations: Provide high-level advice for stakeholders.`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user }
  ];
}
