import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const InsightsInputSchema = z.object({
  datasetPreview: z.string(),
  columnNamesString: z.string(),
});

export const InsightsOutputSchema = z.object({
  executiveSummary: z.string().describe('A high-level strategic overview of the dataset.'),
  keyFindings: z.array(z.string()).describe('List of critical patterns or observations.'),
  recommendations: z.array(z.string()).describe('Actionable strategic advice based on the data.'),
  confidenceScore: z.number().min(0).max(100),
  dataAnomalies: z.array(z.string()).describe('Potential red flags or weird patterns found.'),
});

export const aiInsightsPrompt = ai.definePrompt({
  name: 'aiInsightsPrompt',
  input: { schema: InsightsInputSchema },
  output: { schema: InsightsOutputSchema },
  prompt: `You are a high-level strategic consultant and elite data analyst. Analyze this dataset to extract deep strategic intelligence.

### ANALYTICAL PROTOCOL:
1. **Executive Synthesis**: Provide a punchy, authoritative summary of what this data represents for a decision-maker.
2. **Key Findings**: Identify non-obvious correlations or critical status indicators.
3. **Strategic Recommendations**: What should the organization DO based on these numbers?
4. **Anomaly Detection**: Flag any data points that look like noise or potential structural failure.

### RESTRICTIONS:
- No conversational filler.
- Use professional, industrial terminology (e.g., "Vector", "Distribution", "Mission-Critical").
- Ensure all findings are grounded in the provided snapshot.

INPUT:
Columns: {{{columnNamesString}}}
Snapshot:
{{{datasetPreview}}}`,
});
