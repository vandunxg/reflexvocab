import type { ReactNode } from 'react';

/** Shared empty/error panel: a text heading, optional explanation and one recovery action. */
export function StatePanel({ title, body, action, children, role }: {
  title: string;
  body?: string;
  action?: { label: string; onClick: () => void };
  children?: ReactNode;
  role?: 'alert' | 'status';
}) {
  return (
    <section className="state-panel" role={role}>
      <h2>{title}</h2>
      {body && <p className="muted">{body}</p>}
      {children}
      {action && (
        <button type="button" className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </section>
  );
}
