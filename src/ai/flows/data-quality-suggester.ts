
import { callGroq } from '../groq-client';
import { getQualityMessages, QualityOutputSchema } from '../prompts/quality-prompt';

/**
 * Generates data quality improvement suggestions using Groq.
 */
export async function suggestDataQualityImprovements(input: { datasetPreview: string, columnNames: string[] }) {
  try {
    const promptInput = {
      datasetPreview: input.datasetPreview,
      columnNamesString: input.columnNames.join(", ")
    };
    
    const messages = getQualityMessages(promptInput);
    const result = await callGroq(messages);
    
    return QualityOutputSchema.parse(result);
  } catch (error) {
    console.error("[Groq:DataQuality] Error:", error);
    throw new Error("Data quality diagnostic engine is currently offline.");
  }
}
