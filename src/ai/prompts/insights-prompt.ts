
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const InsightsInputSchema = z.object({
  datasetPreview: z.string().describe('A very small CSV preview (max 10 rows).'),
  statsSummary: z.string().describe('Complete statistical summary including correlations, outliers, and distributions.'),
  columnNamesString: z.string().describe('Comma-separated list of column headers.'),
});

export const InsightsOutputSchema = z.object({
  executiveSummary: z.string().describe('A high-level strategic overview of the dataset.'),
  keyFindings: z.array(z.string()).describe('Top critical patterns identified.'),
  strongestCorrelations: z.array(z.string()).describe('Key relationships identified.'),
  potentialRisks: z.array(z.string()).describe('Calculated risks and anomalies.'),
  businessOpportunities: z.array(z.string()).describe('Actionable growth areas.'),
  recommendations: z.array(z.string()).describe('Strategic advice.'),
  confidenceScore: z.number().min(0).max(100).describe('Confidence level.'),
});

export const aiInsightsPrompt = ai.definePrompt({
  name: 'aiInsightsPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: { schema: InsightsInputSchema },
  output: { schema: InsightsOutputSchema },
  prompt: `You are an elite enterprise data analyst. Analyze the following statistical summary to generate deep business intelligence.

### ANALYTICAL PROTOCOL:
1. **Executive Synthesis**: Provide an authoritative summary for C-suite.
2. **Correlation Logic**: Identify non-obvious relationships.
3. **Risk & Anomaly Detection**: Flag outliers from the summary.
4. **Opportunity Mapping**: Translate findings into actionable growth areas.

### DATA CONTEXT:
COLUMN HEADERS: {{{columnNamesString}}}

STATISTICAL SUMMARY & METRICS:
{{{statsSummary}}}

DATA SAMPLE (LIMITED):
{{{datasetPreview}}}`,
});
