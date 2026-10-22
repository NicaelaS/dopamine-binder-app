import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import BinderCard from '../components/BinderCard';

function DashboardPage({ user }) {
  const navigate = useNavigate();
  const totalItems = 0;
  const favoriteCount = 0;
  const pinnedCount = 0;

  const handleNewBinder = () => {
    console.log('Open new binder form');
  };

  const handleNewItem = () => {
    navigate('/items', { state: { openAddItem: true } });
  };

  const handlePinnedEmptyStateClick = () => {
    navigate('/binders');
  };

  return (
    <div className={`background-page ${styles.page}`}>
      <Sidebar activePath="/dashboard" />

      <main className={styles.main}>
        <div className={styles.topBar}>
          <h1 className={styles.pageTitle}>Dashboard</h1>

          <input
            type="text"
            placeholder="Search collections, items, or tags..."
            className={styles.searchInput}
          />

          <span className={styles.accountLabel}>Account</span>
        </div>

        <div className={styles.headerRow}>
          <div>
            <h2 className={styles.welcomeTitle}>Welcome back, {user?.name || 'friend'}!</h2>
            <p className={styles.welcomeSubtitle}>
              Track pinned binders, favorite items, and the latest upload.
            </p>
          </div>

          <div className={styles.headerButtons}>
            <Button variant="newItem" onClick={handleNewItem}>
              New Item
            </Button>
            <Button variant="newBinder" onClick={handleNewBinder}>
              New Binder
            </Button>
          </div>
        </div>

        <div className={styles.statsRow}>
          <StatCard label="Total items" value={totalItems} caption="No items added yet" />

          <div className={styles.favoritesCard}>
            <div className={styles.favoritesHeader}>
              <h3 className={styles.cardTitle}>Favorite items</h3>
              <span className={styles.pill}>{favoriteCount} items</span>
            </div>
            <div className={styles.emptyBox}>
              <p className={styles.emptyText}>
                Once you add items, you can mark them as favorites to keep them easy to find from this list.
              </p>
            </div>
          </div>

          <div className={styles.lastUploadedCard}>
            <h3 className={styles.cardTitle}>Last uploaded</h3>
            <div className={styles.emptyBox}>
              <button className={styles.uploadButton} onClick={handleNewItem}>
                Upload item
              </button>
              <p className={styles.emptyText}>
                Upload your first item to see the latest activity here, including the item name, collection, and upload details.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.pinnedPanel}>
          <div className={styles.pinnedHeader}>
            <div>
              <h3 className={styles.cardTitle}>Pinned binders</h3>
              <p className={styles.pinnedSubtitle}>
                Have your most active or favorite binders be the first you see.
              </p>
            </div>
            <span className={styles.pill}>{pinnedCount} pinned</span>
          </div>

          <div className={styles.pinnedEmptyState}>
            <BinderCard binder={{ name: '', color: 'orange' }} size="small" onClick={handlePinnedEmptyStateClick} />
            <h3 className={styles.emptyTitle}>Nothing pinned yet...</h3>
            <p className={styles.emptyText}>
              You can pin binders from the full binders list.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
