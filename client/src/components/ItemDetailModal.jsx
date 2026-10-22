import { useState } from 'react';
import { deleteItem } from '../services/api';
import AddItemModal from './AddItemModal';
import styles from './ItemDetailModal.module.css';

function ItemDetailModal({ isOpen, item, binderName, binders, onClose, onSaved, onDeleted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this item? This action cannot be undone.');
    if (!confirmed) return;

    setIsDeleting(true);
    setError('');

    try {
      await deleteItem(item._id);
      onDeleted();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete item.');
    } finally {
      setIsDeleting(false);
    }
  };

  const subtitle = item.type === 'BOOK' ? 'Book' : 'Trading card';

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
          <h2 className={styles.title}>{item.title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Binder</span>
            <span className={styles.infoValue}>{binderName || 'Unassigned'}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Quantity</span>
            <span className={styles.infoValue}>{item.quantity || 1}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Tags</span>
            <span className={styles.infoValue}>
              {Array.isArray(item.tags) && item.tags.length > 0 ? item.tags.join(', ') : 'None'}
            </span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Notes</span>
            <span className={styles.infoValue}>{item.notes || 'No notes'}</span>
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.actions}>
            <button type="button" className={styles.editButton} onClick={() => setIsEditing(true)}>
              Edit
            </button>
            <button
              type="button"
              className={styles.deleteButton}
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            <button type="button" className={styles.closeButton} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>

      <AddItemModal
        isOpen={isEditing}
        mode="edit"
        initialItem={item}
        binders={binders}
        onClose={() => setIsEditing(false)}
        onSaved={() => {
          setIsEditing(false);
          onSaved();
        }}
      />
    </>
  );
}

export default ItemDetailModal;
