import { OpenAI } from 'openai';

export const openai = new OpenAI({
  // Use a placeholder to keep build-time imports from crashing on Vercel.
  // API routes still validate OPENAI_API_KEY before making requests.
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder',
});
