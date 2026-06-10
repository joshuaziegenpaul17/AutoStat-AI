import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit initialization with the latest stable Google AI plugin.
 * We use 'gemini-1.5-flash' as the default model.
 * The plugin handles provider routing automatically.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'gemini-1.5-flash',
});
