
import { z } from 'zod';

export const QualityInputSchema = z.object({
  datasetPreview: z.string(),
  columnNamesString: z.string(),
});

export const QualityOutputSchema = z.object({
  summary: z.string(),
  suggestions: z.array(z.object({
    issueType: z.string(),
    description: z.string(),
    suggestion: z.string(),
    affectedColumns: z.array(z.string()),
  })),
  qualityScore: z.number(),
  issuesIdentified: z.array(z.string()),
});

export function getQualityMessages(input: z.infer<typeof QualityInputSchema>) {
  const system = `You are a senior data engineer and expert statistical auditor. Analyze the structural integrity of this dataset. Output MUST be valid JSON.`;

  const user = `### CRITICAL INSPECTION:
1. Data Types & Layouts: Inspect preview for discrepancies in ${input.columnNamesString}.
2. Statistical Vulnerabilities: Flag high sparsity or unhandled missing values.
3. Anomaly Risks: Mixed types or timestamp inconsistencies.

INPUT:
Columns: ${input.columnNamesString}
Preview:
${input.datasetPreview}`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user }
  ];
}
