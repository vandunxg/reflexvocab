import {
  createClient,
  isAuthRetryableFetchError,
  type AuthError,
  type Session,
} from '@supabase/supabase-js';

type AuthResult<T> =
  { ok: true; value: T } | { ok: false; code: 'unauthenticated' | 'unavailable' };

function authFailure(error: AuthError): AuthResult<never> {
  return {
    ok: false,
    code:
      isAuthRetryableFetchError(error) || error.status === 429 || (error.status ?? 0) >= 500
        ? 'unavailable'
        : 'unauthenticated',
  };
}

export function createPrivateAuth({
  url,
  publishableKey,
}: {
  url?: string;
  publishableKey?: string;
}) {
  if (!url?.trim() || !publishableKey?.trim()) {
    return { ok: false, code: 'missing-config' } as const;
  }

  const endpoint = URL.parse(url);
  const local = endpoint && ['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname);
  if (
    !endpoint ||
    endpoint.username ||
    endpoint.password ||
    !(endpoint.protocol === 'https:' || (local && endpoint.protocol === 'http:')) ||
    !/^sb_publishable_[\w-]+$/.test(publishableKey)
  ) {
    return { ok: false, code: 'invalid-config' } as const;
  }

  const client = createClient(endpoint.href, publishableKey, {
    auth: { detectSessionInUrl: false },
  });

  return {
    ok: true,
    client,
    async signIn(email: string, password: string): Promise<AuthResult<Session>> {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) return authFailure(error);
      if (!data.session) return { ok: false, code: 'unauthenticated' };
      return { ok: true, value: data.session };
    },
    async loadSession(): Promise<AuthResult<Session | null>> {
      const { data, error } = await client.auth.getSession();
      return error ? authFailure(error) : { ok: true, value: data.session };
    },
    async signOut(): Promise<AuthResult<null>> {
      const { error } = await client.auth.signOut({ scope: 'local' });
      return error ? authFailure(error) : { ok: true, value: null };
    },
    subscribeAccount(onChange: (accountId: string | null) => void) {
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        onChange(session?.user.id ?? null);
      });
      return () => data.subscription.unsubscribe();
    },
  } as const;
}

export type PrivateAuth = Extract<ReturnType<typeof createPrivateAuth>, { ok: true }>;
