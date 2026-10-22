import styles from './ItemCard.module.css';

function ItemCard({ item, binder, onClick }) {
  // Convert binder color names to chip hex colors for the item card UI.
  const binderColorMap = {
    white: '#f7f7f7',
    pink: '#f8b4d9',
    purple: '#b39ddb',
    yellow: '#ffe082',
    blue: '#90caf9',
    red: '#ef9a9a',
    black: '#616161',
    green: '#a5d6a7',
    orange: '#ffcc80',
  };

  const binderName = binder?.name || 'No binder';
  const binderColorName = (binder?.color || 'orange').toLowerCase();
  const binderColor = binderColorMap[binderColorName] || binderColorMap.orange;

  const typeLabel = item?.type === 'TCG'
    ? 'Trading card'
    : item?.type === 'BOOK'
      ? 'Book'
      : 'Item';

  return (
    <div className={styles.card} onClick={onClick}>
      <h3 className={styles.title}>{item?.title || 'Untitled item'}</h3>

      <div className={styles.binderRow}>
        <span className={styles.binderDot} style={{ backgroundColor: binderColor }} />
        <span className={styles.binderName}>{binderName}</span>
      </div>

      <p className={styles.typeLabel}>{typeLabel}</p>
    </div>
  );
}

export default ItemCard;
