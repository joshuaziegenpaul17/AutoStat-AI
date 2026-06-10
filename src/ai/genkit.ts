import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit initialization with the latest stable Google AI plugin.
 * We use gemini-1.5-flash as the default model for high-speed strategic analysis.
 * Using a string identifier ensures compatibility across different Genkit SDK versions.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
});
