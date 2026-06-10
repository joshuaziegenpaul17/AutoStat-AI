import { genkit } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/google-genai';

/**
 * Genkit initialization with the latest stable Google AI plugin.
 * We use gemini-1.5-flash as the default model for high-speed strategic analysis.
 * Using the exported model object ensures the correct model ID is used.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash,
});
