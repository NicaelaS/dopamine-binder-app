import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import BinderCard from '../components/BinderCard';
import ItemCard from '../components/ItemCard';
import AddItemModal from '../components/AddItemModal';
import ItemDetailModal from '../components/ItemDetailModal';
import { getBinders, getItems } from '../services/api';
import styles from './ItemsPage.module.css';

function ItemsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [binders, setBinders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Keep one refresh function so future popups can call it after mutations.
  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, bindersData] = await Promise.all([getItems(), getBinders()]);
      setItems(Array.isArray(itemsData) ? itemsData : []);
      setBinders(Array.isArray(bindersData) ? bindersData : []);
    } catch (error) {
      console.error('Failed to fetch items or binders:', error);
      setItems([]);
      setBinders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (location.state?.openAddItem) {
      setIsAddModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Build a binder lookup map for fast binderId resolution.
  const binderById = useMemo(() => {
    const map = new Map();
    binders.forEach((binder) => {
      if (binder?._id) {
        map.set(String(binder._id), binder);
      }
    });
    return map;
  }, [binders]);

  // Handle both string binderId and populated binder objects.
  const resolveBinderForItem = (item) => {
    const binderRef = item?.binderId;

    if (!binderRef) {
      return null;
    }

    if (typeof binderRef === 'object') {
      return {
        _id: binderRef._id,
        name: binderRef.name || 'No binder',
        color: binderRef.color || 'orange',
      };
    }

    return binderById.get(String(binderRef)) || null;
  };

  // Filter by item title, tags, and binder name.
  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return items;

    return items.filter((item) => {
      const titleMatches = (item?.title || '').toLowerCase().includes(query);
      const tagsMatches = Array.isArray(item?.tags)
        ? item.tags.some((tag) => String(tag).toLowerCase().includes(query))
        : false;
      const binderName = resolveBinderForItem(item)?.name || 'No binder';
      const binderMatches = binderName.toLowerCase().includes(query);

      return titleMatches || tagsMatches || binderMatches;
    });
  }, [items, searchTerm, binderById]);

  const handleNewItem = () => {
    setIsAddModalOpen(true);
  };

  const handleOpenItem = (item) => {
    setSelectedItem(item);
  };

  const renderEmptyState = () => (
    <div className={styles.emptyState}>
      <div className={styles.emptyInner}>
        <h2 className={styles.emptyTitle}>No items yet</h2>
        <p className={styles.emptyText}>
          You haven&apos;t added any items to your collections. Start by creating a new item for your books or trading cards.
        </p>

        <div className={styles.decorativeBinderWrap}>
          <BinderCard
            binder={{ name: 'Starter Binder', color: 'orange' }}
            size="large"
            onClick={() => {}}
          />
        </div>

        <p className={styles.inventoryCount}>0 items created</p>
        <p className={styles.inventoryLabel}>Total items in your inventory</p>

        <div className={styles.emptyActionWrap}>
          <Button variant="newItem" onClick={handleNewItem}>
            New Item
          </Button>
          <p className={styles.emptyCaption}>Create a new item</p>
        </div>
      </div>
    </div>
  );

  const renderPopulatedState = () => (
    <div className={styles.gridWrapper}>
      <div className={styles.populatedSummary}>
        <p className={styles.inventoryCountSmall}>{filteredItems.length} items created</p>
        <p className={styles.inventoryLabel}>Total items in your inventory</p>
      </div>

      <div className={styles.itemGrid}>
        {filteredItems.map((item) => (
          <ItemCard
            key={item._id || item.id}
            item={item}
            binder={resolveBinderForItem(item)}
            onClick={() => handleOpenItem(item)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <Sidebar activePath="/items" />

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>All Items</h1>

          <div className={styles.headerActions}>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search items, tags, or collections..."
              className={styles.searchInput}
            />

            <Button variant="newItem" onClick={handleNewItem}>
              New Item
            </Button>

            <div className={styles.avatar}>JD</div>
          </div>
        </header>

        <p className={styles.subheading}>
          Track your books, trading cards, and other collectibles in one place.
        </p>

        <section className={styles.contentCard}>
          {loading ? (
            <div className={styles.loadingState}>Loading items...</div>
          ) : filteredItems.length === 0 ? (
            renderEmptyState()
          ) : (
            renderPopulatedState()
          )}
        </section>
      </main>

      <AddItemModal
        isOpen={isAddModalOpen}
        mode="add"
        initialItem={null}
        binders={binders}
        onClose={() => setIsAddModalOpen(false)}
        onSaved={loadData}
      />

      <ItemDetailModal
        isOpen={Boolean(selectedItem)}
        item={selectedItem}
        binderName={selectedItem ? resolveBinderForItem(selectedItem)?.name : ''}
        binders={binders}
        onClose={() => setSelectedItem(null)}
        onSaved={async () => {
          await loadData();
          setSelectedItem(null);
        }}
        onDeleted={async () => {
          await loadData();
          setSelectedItem(null);
        }}
      />
    </div>
  );
}

export default ItemsPage;
