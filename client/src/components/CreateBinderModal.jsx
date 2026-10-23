import { useEffect, useState } from 'react';
import styles from './CreateBinderModal.module.css';
import { binderImages, binderColors } from '../assets/binderImages';
import { createBinder, editBinder } from '../services/api';

// onClose: called to dismiss the modal without saving
// onCreated: called after a successful save, with the new binder, so the
// parent page (e.g. BindersPage) can add it to its list without a full refetch
function CreateBinderModal({ onClose, onCreated, mode = 'create', initialBinder = null, isOpen = true }) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('orange'); // sensible default
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && initialBinder) {
      setName(initialBinder.name || '');
      setSelectedColor(initialBinder.color || 'orange');
    } else {
      setName('');
      setSelectedColor('orange');
    }

    setError('');
  }, [isOpen, mode, initialBinder]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the browser's default full-page form submit

    if (!name.trim()) {
      setError('Give your binder a name first.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      if (mode === 'edit' && initialBinder?._id) {
        const updatedBinder = await editBinder(initialBinder._id, {
          name: name.trim(),
          color: selectedColor,
        });
        onCreated?.(updatedBinder);
      } else {
        const newBinder = await createBinder({ name: name.trim(), color: selectedColor });
        onCreated?.(newBinder);
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong saving your binder. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    // clicking the dark overlay closes the modal; clicking inside the card does not
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{mode === 'edit' ? 'Edit binder' : 'New binder'}</h2>

        <form onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="binderName">Name</label>
          <input
            id="binderName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Pokemon rares"
            className={styles.input}
          />

          <p className={styles.label}>Color</p>
          <div className={styles.colorGrid}>
            {binderColors.map((color) => (
              <button
                type="button" // prevents this from submitting the form on click
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`${styles.swatch} ${selectedColor === color ? styles.swatchSelected : ''}`}
              >
                <img src={binderImages[color]} alt={color} className={styles.swatchImage} />
              </button>
            ))}
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className={styles.createButton}>
              {isSaving ? (mode === 'edit' ? 'Saving...' : 'Creating...') : mode === 'edit' ? 'Save changes' : 'Create binder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBinderModal;