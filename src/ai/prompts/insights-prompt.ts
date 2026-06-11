import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const InsightsInputSchema = z.object({
  datasetSummary: z.object({
    rowCount: z.number(),
    columnCount: z.number(),
    columnNames: z.array(z.string()),
    missingValues: z.number(),
    qualityScore: z.number(),
  }),
  statsMetrics: z.string().describe('Condensed statistical summary strings.'),
  topCorrelations: z.array(z.string()),
  outlierCounts: z.record(z.number()),
  forecastTrajectory: z.string().describe('Description of the local linear forecast trend.'),
});

export const InsightsOutputSchema = z.object({
  executiveSummary: z.string().describe('A high-level strategic overview.'),
  keyFindings: z.array(z.string()).describe('Top critical patterns identified.'),
  businessOpportunities: z.array(z.string()).describe('Actionable growth areas.'),
  recommendations: z.array(z.string()).describe('Strategic advice.'),
  confidenceScore: z.number().min(0).max(100),
});

export const aiInsightsPrompt = ai.definePrompt({
  name: 'aiInsightsPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: { schema: InsightsInputSchema },
  output: { schema: InsightsOutputSchema },
  prompt: `You are an elite enterprise data analyst. You have been provided with a pre-computed statistical summary of a dataset.

### DATA METADATA:
Rows: {{datasetSummary.rowCount}}
Columns: {{datasetSummary.columnCount}} ({{datasetSummary.columnNames}})
Data Quality Score: {{datasetSummary.qualityScore}}/100
Missing Values: {{datasetSummary.missingValues}}

### STATISTICAL EVIDENCE:
Metrics: {{{statsMetrics}}}
Top Correlations: {{#each topCorrelations}}- {{this}}
{{/each}}
Outlier Profile: {{#each outlierCounts}}{{@key}}: {{this}} outliers{{/each}}
Local Forecast Trend: {{forecastTrajectory}}

### ANALYTICAL PROTOCOL:
1. **Executive Synthesis**: Provide an authoritative strategic summary based ON THE NUMBERS provided.
2. **Opportunity Mapping**: Translate these statistical findings into actionable business growth areas.
3. **Strategic Recommendations**: Provide high-level advice for stakeholders.

DO NOT hallucinate raw data. Only interpret the statistical summary provided.`,
});
