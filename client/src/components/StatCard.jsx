import styles from './StatCard.module.css';

// label + value + caption
function StatCard({ label, value, caption }) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      <p className={styles.caption}>{caption}</p>
    </div>
  );
}

export default StatCard;