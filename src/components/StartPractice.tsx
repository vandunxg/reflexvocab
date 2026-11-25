import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLearning } from '../app/LearningProvider';
import type { LearningSession, QueueEntry, SessionConfig } from '../domain/model';
import { buildQueue } from '../domain/session';
import { ConfirmDialog } from './ConfirmDialog';
import { Icon } from './Icon';

const VARIANTS = { primary: 'btn btn-primary', secondary: 'btn btn-secondary', white: 'btn btn-white' };

/**
 * Builds a session for `config`, saves it as the current session, then enters it. When an unfinished
 * session exists, the learner chooses between resuming it and replacing it; saved answers are kept.
 */
export function StartPractice({ config, label, variant = 'primary' }: {
  config: SessionConfig;
  label: string;
  variant?: keyof typeof VARIANTS;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { catalog, snapshot, settings, repository, applySession } = useLearning();
  const [state, setState] = useState<'idle' | 'confirm' | 'starting' | 'empty' | 'failed'>('idle');
  const [pending, setPending] = useState<QueueEntry[] | null>(null);
  const unfinished = snapshot.currentSession?.status === 'current' ? snapshot.currentSession : null;

  async function start(queue: QueueEntry[]) {
    const now = new Date();
    const session: LearningSession = {
      id: crypto.randomUUID(), config, queue, cursor: 0, revision: 0, retryCounts: {},
      status: 'current', startedAt: now.toISOString(), updatedAt: now.toISOString(),
    };
    setState('starting');
    try {
      await repository.startSession(session);
    } catch {
      setState('failed');
      return;
    }
    applySession(session);
    navigate('/session');
  }

  function request() {
    if (state === 'starting') return;
    const queue = buildQueue({
      config, topics: catalog.topics, lessons: catalog.lessons, senses: catalog.senses,
      exercises: catalog.exercises, progress: snapshot.cards, now: new Date(),
      timezone: settings.timezone, newPerDay: settings.newPerDay,
    });
    if (queue.length === 0) {
      setState('empty');
    } else if (unfinished) {
      setPending(queue);
      setState('confirm');
    } else {
      void start(queue);
    }
  }

  return (
    <div className="start-practice">
      <button type="button" className={VARIANTS[variant]} onClick={request} disabled={state === 'starting'}>
        {state === 'starting' ? t('start.starting') : label}
        {state !== 'starting' && <Icon name="arrowRight" />}
      </button>
      {state === 'empty' && <p className="notice" role="status">{t('start.empty')}</p>}
      {state === 'failed' && <p className="notice notice-error" role="alert"><Icon name="alert" size={18} />{t('start.failed')}</p>}
      {unfinished && (
        <ConfirmDialog
          open={state === 'confirm'}
          title={t('start.replaceTitle')}
          body={t('start.replaceBody', { answered: unfinished.cursor, total: unfinished.queue.length })}
          cancelLabel={t('start.keepCurrent')}
          confirmLabel={t('start.replace')}
          onCancel={() => navigate('/session')}
          onDismiss={() => setState('idle')}
          onConfirm={() => { if (pending) void start(pending); }}
        />
      )}
    </div>
  );
}
