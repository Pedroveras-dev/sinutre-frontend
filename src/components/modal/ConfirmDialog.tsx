interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  busy?: boolean; // ação em andamento: desabilita os botões
  error?: string | null; // motivo de a ação ter falhado
  onConfirm: () => void;
  onCancel: () => void;
}

// Diálogo de confirmação para ações que não podem ser desfeitas (apagar).
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  busy = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="modal modal-open"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div className="modal-box">
        <h3 id="confirm-dialog-title" className="font-bold text-lg">
          {title}
        </h3>
        <p id="confirm-dialog-message" className="py-3 text-base-content/80">
          {message}
        </p>

        {error && (
          <div role="alert" className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <div className="modal-action">
          <button type="button" className="btn" onClick={onCancel} disabled={busy}>
            {error ? 'Fechar' : 'Cancelar'}
          </button>
          {/* Depois de um erro (ex.: alimento em uso) não adianta repetir. */}
          {!error && (
            <button
              type="button"
              className="btn btn-error"
              onClick={onConfirm}
              disabled={busy}
            >
              {busy && <span className="loading loading-spinner loading-sm" />}
              {busy ? 'Apagando...' : confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
