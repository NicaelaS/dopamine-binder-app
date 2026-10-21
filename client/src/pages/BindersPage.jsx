import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import BinderCard from '../components/BinderCard';
import CreateBinderModal from '../components/CreateBinderModal';
import { getBinders } from '../services/api';
import styles from './BindersPage.module.css';

function BindersPage() {
  const navigate = useNavigate();

  const [binders, setBinders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadBinders = async () => {
    try {
      setLoading(true);
      const data = await getBinders();
      setBinders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch binders:', error);
      setBinders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBinders();
  }, []);


  const filteredBinders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return binders;

    return binders.filter((binder) =>
      binder?.name?.toLowerCase().includes(query)
    );
  }, [binders, searchTerm]);

  const handleNewItem = () => {
    navigate('/items/new');
  };

  const handleCreateSuccess = (newBinder) => {
    setIsCreateModalOpen(false);
    loadBinders(); // refresh the list to include the new binder
  };

  const handleOpenCreateBinder = () => {
    setIsCreateModalOpen(true);
  };

  const renderEmptyState = () => (
    <div className={styles.emptyState}>
      <div className={styles.emptyInner}>
        <h2 className={styles.emptyTitle}>No collections yet</h2>
        <p className={styles.emptyText}>
          Start building your collection by creating your first binder.
        </p>

        <div className={styles.decorativeBinderWrap}>
          <BinderCard
            binder={{ name: 'Starter Binder', color: 'orange' }}
            size="large"
            onClick={() => {}}
          />
        </div>

        <div className={styles.emptyActionWrap}>
          <Button variant="newBinder" onClick={() => setIsCreateModalOpen(true)}>
            New Binder
          </Button>
          <p className={styles.emptyCaption}>Create a new binder</p>
        </div>
      </div>
    </div>
  );

  const renderPopulatedState = () => (
    <div className={styles.gridWrapper}>
      <div className={styles.binderGrid}>
        {filteredBinders.map((binder) => (
          <BinderCard
            key={binder._id || binder.id}
            binder={binder}
            size="large"
            onClick={() => navigate(`/binders/${binder._id || binder.id}`)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <Sidebar activePath="/BindersPage" />

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>All Binders</h1>

          <div className={styles.headerActions}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search binders"
              className={styles.searchInput}
            />

            <Button variant="newItem" onClick={handleNewItem}>
              New Item
            </Button>

            <Button variant="newBinder" onClick={handleOpenCreateBinder}>
              New Binder
            </Button>

            <div className={styles.avatar}>JD</div>
          </div>
        </header>

        <p className={styles.subheading}>
          Track your books, trading cards, and other collectibles in one place.
        </p>

        <section className={styles.contentCard}>
          {loading ? (
            <div className={styles.loadingState}>Loading binders...</div>
          ) : filteredBinders.length === 0 ? (
            renderEmptyState()
          ) : (
            renderPopulatedState()
          )}
        </section>
      </main>

      {isCreateModalOpen && (
        <CreateBinderModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}

export default BindersPage;