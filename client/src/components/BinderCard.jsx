import styles from './BinderCard.module.css';
import { binderImages } from '../assets/binderImages';

// binder = { name, color, _id } or folder = { name, color } — size = 'large' | 'small' — onClick = navigation handler
function BinderCard({ binder, folder, size = 'large', onClick }) {
  const card = binder || folder || { name: '', color: 'orange' };

  // look up the correct binder image for this folder's color
  // falls back to orange if an unknown/missing color is passed in, so it never renders broken
  const binderImage = binderImages[card.color] || binderImages.orange;

  const handleClick = () => {
    if (typeof onClick === 'function') {
      onClick(card._id);
    }
  };

  return (
    <div
      className={`${styles.binderCard} ${styles[size]}`}
      onClick={handleClick}
    >
      <img src={binderImage} alt={`${card.color || 'orange'} binder`} className={styles.binderImage} />
      <p className={styles.binderName}>{card.name}</p>
    </div>
  );
}

export default BinderCard;
