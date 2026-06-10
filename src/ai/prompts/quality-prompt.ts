import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const QualityInputSchema = z.object({
  datasetPreview: z.string(),
  columnNamesString: z.string(),
});

export const QualityOutputSchema = z.object({
  summary: z.string().describe('A high-level diagnostic summary.'),
  suggestions: z.array(z.object({
    issueType: z.string(),
    description: z.string(),
    suggestion: z.string(),
    affectedColumns: z.array(z.string()),
  })),
  qualityScore: z.number().min(0).max(100),
  issuesIdentified: z.array(z.string()),
});

export const dataQualityPrompt = ai.definePrompt({
  name: 'dataQualityPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: QualityInputSchema },
  output: { schema: QualityOutputSchema },
  prompt: `You are a senior data engineer and expert statistical auditor. Analyze the structural integrity of this dataset.

### CRITICAL INSPECTION:
1. Data Types & Layouts: Inspect preview for discrepancies in {{{columnNamesString}}}.
2. Statistical Vulnerabilities: Flag high sparsity or unhandled missing values.
3. Anomaly Risks: Mixed types or timestamp inconsistencies.

### EVALUATION:
* Deduct 10-15 points for major structural debt.
* Deduct 5 points for maintenance suggestions (casing, indexing).

### RULES:
* No conversational filler. Match schema exactly.
* Suggestions must be actionable.

INPUT:
Columns: {{{columnNamesString}}}
Preview:
{{{datasetPreview}}}`,
});
