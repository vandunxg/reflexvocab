import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { applyLocale } from '../i18n';
import { DEFAULT_SETTINGS } from '../domain/settings';
import type { AttemptCommit, LearningSession, UserSettings } from '../domain/model';
import type { PrivateAuth } from '../lib/auth';
import { loadCatalog, type Catalog } from '../lib/catalog';
import { createLearningRepository } from '../lib/repository';
import { StatePanel } from '../components/StatePanel';

export type LearningRepository = ReturnType<typeof createLearningRepository>;
export type LearningSnapshot = Awaited<ReturnType<LearningRepository['load']>>;

interface LearningContextValue {
  auth: PrivateAuth;
  repository: LearningRepository;
  catalog: Catalog;
  snapshot: LearningSnapshot;
  /** Saved settings with product defaults for an account that has not saved any yet. */
  settings: UserSettings;
  /** Re-reads authoritative account state without discarding the current screen. */
  refresh: () => Promise<void>;
  /** Records a session the server has just accepted as the account's current session. */
  applySession: (session: LearningSession) => void;
  /** Records an attempt commit the server has acknowledged. */
  applyCommit: (commit: AttemptCommit) => void;
  /** Records settings the server has saved. */
  applySettings: (changes: Partial<UserSettings>) => void;
  /** Records a bookmark state the server has saved. */
  applyBookmark: (senseId: string, saved: boolean) => void;
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; code: string }
  | { status: 'ready'; catalog: Catalog; snapshot: LearningSnapshot };

const LearningContext = createContext<LearningContextValue | null>(null);

export function useLearning(): LearningContextValue {
  const value = use(LearningContext);
  if (!value) throw new Error('useLearning must be used inside LearningProvider');
  return value;
}

/** Loads one account's catalog and learning state. Remounted (keyed) whenever the account changes. */
export function LearningProvider({ auth, children }: { auth: PrivateAuth; children: ReactNode }) {
  const { t } = useTranslation();
  const repository = useMemo(() => createLearningRepository(auth.client), [auth]);
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  const load = useCallback(async () => {
    try {
      const [catalog, snapshot] = await Promise.all([loadCatalog(auth.client), repository.load()]);
      setState({ status: 'ready', catalog, snapshot });
    } catch (error) {
      setState((current) => current.status === 'ready'
        ? current
        : { status: 'error', code: (error as { code?: string }).code ?? 'unavailable' });
      throw error;
    }
  }, [auth, repository]);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  // Acknowledged writes are applied locally; the server state is exactly the accepted payload.
  const updateSnapshot = useCallback((change: (snapshot: LearningSnapshot) => LearningSnapshot) => {
    setState((current) => current.status === 'ready' ? { ...current, snapshot: change(current.snapshot) } : current);
  }, []);
  const applySession = useCallback((session: LearningSession) => {
    updateSnapshot((snapshot) => ({ ...snapshot, currentSession: session }));
  }, [updateSnapshot]);
  const applyCommit = useCallback((commit: AttemptCommit) => {
    updateSnapshot((snapshot) => ({
      ...snapshot,
      currentSession: commit.session,
      cards: [...snapshot.cards.filter((card) => card.senseId !== commit.progress.senseId), commit.progress],
      attempts: [...snapshot.attempts.filter((attempt) => attempt.id !== commit.attempt.id), commit.attempt],
    }));
  }, [updateSnapshot]);
  const applySettings = useCallback((changes: Partial<UserSettings>) => {
    updateSnapshot((snapshot) => ({ ...snapshot, settings: { ...DEFAULT_SETTINGS, ...snapshot.settings, ...changes } }));
  }, [updateSnapshot]);

  const applyBookmark = useCallback((senseId: string, saved: boolean) => {
    updateSnapshot((snapshot) => ({
      ...snapshot,
      bookmarks: [...snapshot.bookmarks.filter((bookmark) => bookmark.senseId !== senseId), ...(saved ? [{ senseId }] : [])],
    }));
  }, [updateSnapshot]);

  const locale = state.status === 'ready' ? state.snapshot.settings?.locale : undefined;
  useEffect(() => {
    applyLocale(locale);
    return () => applyLocale('en');
  }, [locale]);

  const value = useMemo(() => state.status === 'ready' ? {
    auth, repository, catalog: state.catalog, snapshot: state.snapshot,
    settings: { ...DEFAULT_SETTINGS, ...state.snapshot.settings },
    refresh: load, applySession, applyCommit, applySettings, applyBookmark,
  } : null, [auth, repository, state, load, applySession, applyCommit, applySettings, applyBookmark]);

  if (state.status === 'loading') {
    return (
      <main className="center-screen">
        <p role="status" className="muted">{t('account.loading')}</p>
      </main>
    );
  }
  if (state.status === 'error') {
    const ended = state.code === 'unauthenticated';
    return (
      <main className="center-screen">
        <StatePanel
          title={ended ? t('account.sessionEnded') : t('account.loadFailed')}
          body={ended ? undefined : t('account.loadFailedBody')}
          action={ended
            ? { label: t('signIn.submit'), onClick: () => void auth.signOut() }
            : { label: t('common.retry'), onClick: () => { setState({ status: 'loading' }); load().catch(() => undefined); } }}
        />
      </main>
    );
  }
  return <LearningContext value={value}>{children}</LearningContext>;
}
