import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const InsightsInputSchema = z.object({
  datasetPreview: z.string().describe('A CSV-formatted sample of the raw data.'),
  statsSummary: z.string().describe('A structured text summary of calculated statistical metrics.'),
  columnNamesString: z.string().describe('Comma-separated list of column headers.'),
});

export const InsightsOutputSchema = z.object({
  executiveSummary: z.string().describe('A high-level strategic overview of the dataset.'),
  keyFindings: z.array(z.string()).describe('Top critical patterns or observations identified in the data.'),
  strongestCorrelations: z.array(z.string()).describe('Identification of the most significant relationships between variables.'),
  potentialRisks: z.array(z.string()).describe('Calculated risks based on data distribution or trends.'),
  detectedAnomalies: z.array(z.string()).describe('Specific red flags, outliers, or structural data noise.'),
  forecastAnalysis: z.string().describe('A qualitative projection of future trends based on current metrics.'),
  businessOpportunities: z.array(z.string()).describe('Actionable areas for growth or optimization.'),
  recommendations: z.array(z.string()).describe('Specific strategic advice based on the findings.'),
  confidenceScore: z.number().min(0).max(100).describe('Confidence level in the analysis based on data quality.'),
});

export const aiInsightsPrompt = ai.definePrompt({
  name: 'aiInsightsPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: InsightsInputSchema },
  output: { schema: InsightsOutputSchema },
  prompt: `You are an elite enterprise data analyst and strategic consultant. Analyze the provided dataset snapshot and statistical summary to generate deep business intelligence.

### ANALYTICAL PROTOCOL:
1. **Executive Synthesis**: Provide an authoritative, punchy summary for a C-suite executive.
2. **Correlation Logic**: Identify non-obvious relationships in the numerical vectors.
3. **Risk & Anomaly Detection**: Flag outliers or structural vulnerabilities that could lead to poor decision-making.
4. **Opportunity Mapping**: Translate statistical findings into specific business opportunities.
5. **Forecast Narrative**: Based on the data distribution and trends, narrate a logical future state.

### RESTRICTIONS:
- No conversational filler or "As an AI" statements.
- Use professional, industrial terminology.
- All findings must be grounded in the provided data.
- Ensure 'strongestCorrelations' and 'potentialRisks' are specific.

### DATA CONTEXT:
COLUMN HEADERS: {{{columnNamesString}}}

STATISTICAL SUMMARY:
{{{statsSummary}}}

DATA SAMPLE (CSV):
{{{datasetPreview}}}`,
});
