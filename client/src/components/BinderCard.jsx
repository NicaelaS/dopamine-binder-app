import styles from './BinderCard.module.css';

function BinderCard({ folder = { name: '', color: 'orange' }, size = 'small', onClick }) {
  const folderName = folder?.name || 'New binder';
  const tint = folder?.color || 'orange';

  return (
    <button
      type="button"
      className={`${styles.card} ${styles[size]} ${styles[tint]}`}
      onClick={onClick}
      aria-label={folderName}
    >
      <span className={styles.folderIcon} aria-hidden="true" />
      <span className={styles.folderLabel}>{folderName}</span>
    </button>
  );
}

export default BinderCard;
