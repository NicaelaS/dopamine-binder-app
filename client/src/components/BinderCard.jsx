import styles from './BinderCard.module.css';

// import every binder color image once, up front
import whiteBinder from '../assets/binders/white.svg';
import pinkBinder from '../assets/binders/pink.svg';
import purpleBinder from '../assets/binders/purple.svg';
import yellowBinder from '../assets/binders/yellow.svg';
import blueBinder from '../assets/binders/blue.svg';
import redBinder from '../assets/binders/red.svg';
import blackBinder from '../assets/binders/black.svg';
import greenBinder from '../assets/binders/green.svg';
import orangeBinder from '../assets/binders/orange.svg';

// a lookup object: given a color name (lowercase), get back the matching image
// this is what replaces the stock folder picture
const binderImages = {
  white: whiteBinder,
  pink: pinkBinder,
  purple: purpleBinder,
  yellow: yellowBinder,
  blue: blueBinder,
  red: redBinder,
  black: blackBinder,
  green: greenBinder,
  orange: orangeBinder,
};

// folder = { name, color } — size = 'large' | 'small' — onClick = navigation handler
function BinderCard({ folder, size = 'large', onClick }) {
  // look up the correct binder image for this folder's color
  // falls back to orange if an unknown/missing color is passed in, so it never renders broken
  const binderImage = binderImages[folder.color] || binderImages.orange;

  return (
    <div
      className={`${styles.binderCard} ${styles[size]}`}
      onClick={() => onClick(folder._id)}
    >
      <img src={binderImage} alt={`${folder.color} binder`} className={styles.binderImage} />
      <p className={styles.binderName}>{folder.name}</p>
    </div>
  );
}

export default BinderCard;
