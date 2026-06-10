import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit initialization with the latest stable Google AI plugin.
 * We use 'googleai/gemini-1.5-flash' as the default model.
 * The 'googleai/' prefix is required for the Genkit registry to correctly 
 * route requests to the Google AI plugin.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
});
