import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit initialization with the latest stable Google AI plugin.
 * We use 'googleai/gemini-1.5-flash' as the default model.
 * The Google AI plugin handles the necessary API versioning and endpoint mapping.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
});
