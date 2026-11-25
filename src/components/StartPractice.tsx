import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLearning } from '../app/LearningProvider';
import type { LearningSession, SessionConfig } from '../domain/model';
import { buildQueue } from '../domain/session';
import { Icon } from './Icon';

/** Builds a session for `config`, saves it as the current session, then enters it. */
export function StartPractice({ config, label }: { config: SessionConfig; label: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { catalog, snapshot, settings, repository, applySession } = useLearning();
  const [state, setState] = useState<'idle' | 'starting' | 'empty' | 'failed'>('idle');

  async function start() {
    if (state === 'starting') return;
    const now = new Date();
    const queue = buildQueue({
      config, topics: catalog.topics, lessons: catalog.lessons, senses: catalog.senses,
      exercises: catalog.exercises, progress: snapshot.cards, now,
      timezone: settings.timezone, newPerDay: settings.newPerDay,
    });
    if (queue.length === 0) {
      setState('empty');
      return;
    }
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

  return (
    <div className="start-practice">
      <button type="button" className="btn btn-primary" onClick={start} disabled={state === 'starting'}>
        {state === 'starting' ? t('start.starting') : label}
        {state !== 'starting' && <Icon name="arrowRight" />}
      </button>
      {state === 'empty' && <p className="notice" role="status">{t('start.empty')}</p>}
      {state === 'failed' && <p className="notice notice-error" role="alert"><Icon name="alert" size={18} />{t('start.failed')}</p>}
    </div>
  );
}
