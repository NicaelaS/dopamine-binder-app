import styles from './ConfirmDeleteModal.module.css';

function ConfirmDeleteModal({
  isOpen,
  title,
  message,
  confirmLabel,
  isDeleting,
  error,
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  const showConfirmButton = Boolean(confirmLabel);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{title}</h2>

        <p className={styles.message}>{message}</p>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button type="button" onClick={onClose} className={styles.cancelButton}>
            {showConfirmButton ? 'Cancel' : 'Close'}
          </button>

          {showConfirmButton ? (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className={styles.confirmButton}
            >
              {isDeleting ? 'Deleting...' : confirmLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
