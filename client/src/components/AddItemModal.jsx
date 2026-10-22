import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { binderImages } from '../assets/binderImages';
import { createItem, updateItem } from '../services/api';
import styles from './AddItemModal.module.css';

const initialForm = {
  title: '',
  type: 'TCG',
  quantity: 1,
  notes: '',
  tags: '',
  binderId: '',
  cardDetails: {
    game: 'pokemon',
    set: '',
    cardNumber: '',
    rarity: '',
    condition: '',
    graded: false,
    gradingCompany: '',
    grade: '',
    variant: 'none',
    language: 'English',
    edition: '',
    marketPrice: 0,
  },
  bookDetails: {
    authors: [],
    isbn: '',
    publisher: '',
    publishedDate: '',
    condition: '',
    format: '',
    signed: false,
    printing: '',
  },
};

function AddItemModal({ isOpen, mode, initialItem, binders, onClose, onSaved }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Prefill values for edit mode or reset defaults for add mode.
  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && initialItem) {
      const binderRef = initialItem.binderId;
      const resolvedBinderId = typeof binderRef === 'object'
        ? String(binderRef?._id || '')
        : String(binderRef || '');

      setForm({
        title: initialItem.title || '',
        type: initialItem.type || 'TCG',
        quantity: Number(initialItem.quantity || 1),
        notes: initialItem.notes || '',
        tags: Array.isArray(initialItem.tags) ? initialItem.tags.join(', ') : '',
        binderId: resolvedBinderId,
        cardDetails: {
          ...initialForm.cardDetails,
          ...(initialItem.cardDetails || {}),
        },
        bookDetails: {
          ...initialForm.bookDetails,
          ...(initialItem.bookDetails || {}),
          authors: Array.isArray(initialItem.bookDetails?.authors)
            ? initialItem.bookDetails.authors
            : [],
        },
      });
    } else {
      setForm({
        ...initialForm,
        binderId: binders?.[0]?._id ? String(binders[0]._id) : '',
      });
    }

    setError('');
  }, [isOpen, mode, initialItem, binders]);

  if (!isOpen) return null;

  const setValue = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setDetailValue = (group, field, value) => {
    setForm((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [field]: value,
      },
    }));
  };

  // Keep payload aligned with backend normalizeItemPayload.
  const buildPayload = () => {
    const payload = {
      ...form,
      quantity: Number(form.quantity || 1),
      tags: String(form.tags || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      notes: form.notes || '',
      favorite: false,
      photos: [],
    };

    if (payload.type === 'TCG') {
      delete payload.bookDetails;
    } else {
      delete payload.cardDetails;
      payload.bookDetails = {
        ...payload.bookDetails,
        authors: Array.isArray(payload.bookDetails?.authors)
          ? payload.bookDetails.authors
          : [],
      };
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.binderId) {
      setError('Binder is required.');
      return;
    }

    if (!String(form.title || '').trim()) {
      setError('Title is required.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const payload = buildPayload();

      if (mode === 'edit' && initialItem?._id) {
        await updateItem(initialItem._id, payload);
      } else {
        await createItem(payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save item.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    // Click outside closes modal.
    <div className={styles.overlay} onClick={onClose}>
      {/* Stop click bubbling so inner interactions do not close modal. */}
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <h2 className={styles.title}>{mode === 'edit' ? 'Edit item' : 'New item'}</h2>

        <form onSubmit={handleSubmit}>
          {/* Type toggle row */}
          <div className={styles.row}>
            <label className={styles.label}>Type</label>
            <div className={styles.value}>
              <label className={styles.inlineLabel}>
                <input
                  type="radio"
                  checked={form.type === 'TCG'}
                  onChange={() => setValue('type', 'TCG')}
                />
                Trading card
              </label>
              <label className={styles.inlineLabel}>
                <input
                  type="radio"
                  checked={form.type === 'BOOK'}
                  onChange={() => setValue('type', 'BOOK')}
                />
                Book
              </label>
            </div>
          </div>

          {/* Binder swatch picker */}
          <div className={styles.row}>
            <label className={styles.label}>Binder</label>
            <div className={styles.value}>
              {binders.length === 0 ? (
                <div className={styles.noBinders}>
                  <p className={styles.muted}>Create a binder first.</p>
                  <button
                    type="button"
                    className={styles.linkButton}
                    onClick={() => {
                      onClose();
                      navigate('/binders');
                    }}
                  >
                    Go to binders
                  </button>
                </div>
              ) : (
                <div className={styles.swatchGrid}>
                  {binders.map((binder) => {
                    const isSelected = String(form.binderId) === String(binder._id);
                    const binderImg = binderImages[binder.color] || binderImages.orange;

                    return (
                      <button
                        type="button"
                        key={binder._id}
                        className={`${styles.swatch} ${isSelected ? styles.swatchSelected : ''}`}
                        onClick={() => setValue('binderId', String(binder._id))}
                      >
                        <img src={binderImg} alt={binder.color} className={styles.swatchImage} />
                        <span className={styles.swatchLabel}>{binder.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Title</label>
            <div className={styles.value}>
              <input
                className={styles.input}
                value={form.title}
                onChange={(event) => setValue('title', event.target.value)}
              />
            </div>
          </div>

          {form.type === 'TCG' ? (
            <>
              <div className={styles.row}>
                <label className={styles.label}>Game</label>
                <div className={styles.value}>
                  <select
                    className={styles.input}
                    value={form.cardDetails.game}
                    onChange={(event) => setDetailValue('cardDetails', 'game', event.target.value)}
                  >
                    <option value="pokemon">Pokemon</option>
                    <option value="onepiece">One Piece</option>
                    <option value="magic">Magic</option>
                  </select>
                </div>
              </div>

              <div className={styles.row}>
                <label className={styles.label}>Set</label>
                <div className={styles.value}>
                  <input
                    className={styles.input}
                    value={form.cardDetails.set}
                    onChange={(event) => setDetailValue('cardDetails', 'set', event.target.value)}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <label className={styles.label}>Card number</label>
                <div className={styles.value}>
                  <input
                    className={styles.input}
                    value={form.cardDetails.cardNumber}
                    onChange={(event) => setDetailValue('cardDetails', 'cardNumber', event.target.value)}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <label className={styles.label}>Rarity</label>
                <div className={styles.value}>
                  <input
                    className={styles.input}
                    value={form.cardDetails.rarity}
                    onChange={(event) => setDetailValue('cardDetails', 'rarity', event.target.value)}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <label className={styles.label}>Condition</label>
                <div className={styles.value}>
                  <select
                    className={styles.input}
                    value={form.cardDetails.condition}
                    onChange={(event) => setDetailValue('cardDetails', 'condition', event.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Mint">Mint</option>
                    <option value="Near Mint">Near Mint</option>
                    <option value="Lightly Played">Lightly Played</option>
                    <option value="Moderately Played">Moderately Played</option>
                    <option value="Heavily Played">Heavily Played</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.row}>
                <label className={styles.label}>Authors</label>
                <div className={styles.value}>
                  <input
                    className={styles.input}
                    value={form.bookDetails.authors.join(', ')}
                    onChange={(event) =>
                      setDetailValue(
                        'bookDetails',
                        'authors',
                        event.target.value.split(',').map((v) => v.trim()).filter(Boolean)
                      )
                    }
                  />
                </div>
              </div>

              <div className={styles.row}>
                <label className={styles.label}>ISBN</label>
                <div className={styles.value}>
                  <input
                    className={styles.input}
                    value={form.bookDetails.isbn}
                    onChange={(event) => setDetailValue('bookDetails', 'isbn', event.target.value)}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <label className={styles.label}>Publisher</label>
                <div className={styles.value}>
                  <input
                    className={styles.input}
                    value={form.bookDetails.publisher}
                    onChange={(event) => setDetailValue('bookDetails', 'publisher', event.target.value)}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <label className={styles.label}>Condition</label>
                <div className={styles.value}>
                  <select
                    className={styles.input}
                    value={form.bookDetails.condition}
                    onChange={(event) => setDetailValue('bookDetails', 'condition', event.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Like New">Like New</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Good">Good</option>
                    <option value="Acceptable">Acceptable</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className={styles.row}>
            <label className={styles.label}>Quantity</label>
            <div className={styles.value}>
              <input
                className={styles.input}
                type="number"
                min="1"
                value={form.quantity}
                onChange={(event) => setValue('quantity', Number(event.target.value))}
              />
            </div>
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Tags</label>
            <div className={styles.value}>
              <input
                className={styles.input}
                value={form.tags}
                onChange={(event) => setValue('tags', event.target.value)}
              />
            </div>
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Notes</label>
            <div className={styles.value}>
              <textarea
                className={styles.textarea}
                value={form.notes}
                onChange={(event) => setValue('notes', event.target.value)}
              />
            </div>
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || binders.length === 0}
              className={styles.saveButton}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddItemModal;
