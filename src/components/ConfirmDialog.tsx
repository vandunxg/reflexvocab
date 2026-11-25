import { useEffect, useId, useRef } from 'react';

/** Modal confirmation built on the native dialog element (focus containment and Escape included). */
export function ConfirmDialog({ open, title, body, cancelLabel, confirmLabel, onCancel, onConfirm }: {
  open: boolean;
  title: string;
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onCancel(); }}
    >
      <h2 id={titleId}>{title}</h2>
      <p className="muted">{body}</p>
      <div className="confirm-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>{cancelLabel}</button>
        <button type="button" className="btn btn-primary" onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </dialog>
  );
}
