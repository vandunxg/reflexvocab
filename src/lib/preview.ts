import type { SupabaseClient } from '@supabase/supabase-js';

export interface SignInPreview {
  topic: string;
  prompt: string;
  choices: string[];
}

export async function loadSignInPreview(client: SupabaseClient): Promise<SignInPreview | null> {
  const { data, error } = await client.rpc('sign_in_preview');
  if (error || !data || typeof data.topic !== 'string' || typeof data.prompt !== 'string'
    || !Array.isArray(data.choices) || !data.choices.every((choice: unknown) => typeof choice === 'string')) return null;
  return { topic: data.topic, prompt: data.prompt, choices: data.choices };
}
