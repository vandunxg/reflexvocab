import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * How many items of a long list to render. The count belongs to one `resetKey` (e.g. the active
 * filters); any other key starts from `initial`. Derived during render, not synchronized in an effect.
 */
export function useIncremental(step: number, resetKey: string, initial = step) {
  const [state, setState] = useState({ key: resetKey, count: initial });
  const count = state.key === resetKey ? state.count : initial;
  const showMore = useCallback(() => setState({ key: resetKey, count: count + step }), [resetKey, count, step]);
  return { count, showMore };
}

/**
 * Footer for an incrementally rendered list: the next step loads as it nears the viewport, and the
 * button does the same for keyboard users or browsers without IntersectionObserver.
 */
export function LoadMore({ shown, total, onMore }: { shown: number; total: number; onMore: () => void }) {
  const { t } = useTranslation();
  const sentinel = useCallback((node: HTMLDivElement | null) => {
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) onMore();
    }, { rootMargin: '0px 0px 600px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [onMore]);
  if (shown >= total) return null;
  return (
    <div className="load-more" ref={sentinel}>
      <p className="muted" role="status">{t('common.showing', { shown, total })}</p>
      <button type="button" className="btn btn-secondary" onClick={onMore}>{t('common.showMore')}</button>
    </div>
  );
}
