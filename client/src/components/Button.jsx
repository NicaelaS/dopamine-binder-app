import styles from './Button.module.css';

// variant controls which gradient + shadow this button uses
// matches your Figma "New Binder / Delete Binder / New Item / Delete Item" variant set
function Button({ variant = 'newBinder', onClick, children }) {
  return (
    // we combine the base "button" class with a variant-specific class
    // styles.button applies to every button; styles[variant] applies only the gradient for that one
    <button className={`${styles.button} ${styles[variant]}`} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;