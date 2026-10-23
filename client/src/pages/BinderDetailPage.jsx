import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import BinderCard from '../components/BinderCard';
import ItemCard from '../components/ItemCard';
import AddItemModal from '../components/AddItemModal';
import ItemDetailModal from '../components/ItemDetailModal';
import CreateBinderModal from '../components/CreateBinderModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import Avatar from '../components/Avatar';
import { getBinders, getItems, deleteBinder } from '../services/api';
import styles from './BinderDetailPage.module.css';

function BinderDetailPage() {
  const { binderId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [binders, setBinders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const [itemsResult, bindersResult] = await Promise.allSettled([
        getItems(),
        getBinders(),
      ]);

      if (itemsResult.status === 'rejected') {
        console.error('Failed to fetch items:', itemsResult.reason);
      }

      if (bindersResult.status === 'rejected') {
        console.error('Failed to fetch binders:', bindersResult.reason);
      }

      setItems(
        itemsResult.status === 'fulfilled' && Array.isArray(itemsResult.value)
          ? itemsResult.value
          : []
      );
      setBinders(
        bindersResult.status === 'fulfilled' && Array.isArray(bindersResult.value)
          ? bindersResult.value
          : []
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedBinder = useMemo(
    () => binders.find((binder) => String(binder._id) === String(binderId)) || null,
    [binders, binderId]
  );

  const binderItems = useMemo(() => {
    if (!items.length) return [];

    return items.filter((item) => {
      const itemBinderId =
        typeof item?.binderId === 'object' ? item?.binderId?._id : item?.binderId;

      return String(itemBinderId) === String(binderId);
    });
  }, [items, binderId]);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return binderItems;

    return binderItems.filter((item) => {
      const titleMatches = (item?.title || '').toLowerCase().includes(query);
      const tagsMatches = Array.isArray(item?.tags)
        ? item.tags.some((tag) => String(tag).toLowerCase().includes(query))
        : false;

      return titleMatches || tagsMatches;
    });
  }, [binderItems, searchTerm]);

  const binderById = useMemo(() => {
    const map = new Map();
    binders.forEach((binder) => {
      if (binder?._id) {
        map.set(String(binder._id), binder);
      }
    });
    return map;
  }, [binders]);

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

  const handleNewItem = () => {
    setIsAddModalOpen(true);
  };

  const handleEditBinder = () => {
    setIsEditOpen(true);
  };

  const handleBinderUpdated = async () => {
    setIsEditOpen(false);
    await loadData();
  };

  const handleDeleteBinder = () => {
    setDeleteError('');
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBinder) return;

    setIsDeleting(true);
    setDeleteError('');

    try {
      const freshItems = await getItems();

      const remainingItems = freshItems.filter((item) => {
        const itemBinderId =
          typeof item?.binderId === 'object' ? item?.binderId?._id : item?.binderId;

        return String(itemBinderId) === String(binderId);
      });

      if (remainingItems.length > 0) {
        setDeleteError(
          `This binder still has ${remainingItems.length} items. Move or delete them first.`
        );
        return;
      }

      await deleteBinder(selectedBinder._id);
      navigate('/binders');
    } catch (error) {
      setDeleteError(error.message || 'Failed to delete binder. Try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenItem = (item) => {
    setSelectedItem(item);
  };

  return (
    <div className={styles.page}>
      <Sidebar activePath="/binders" />

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>{selectedBinder?.name || 'Binder'}</h1>

          <div className={styles.headerActions}>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search items in this binder..."
              className={styles.searchInput}
            />

            <Button variant="newItem" onClick={handleNewItem}>
              New Item
            </Button>

            <Button variant="editBinder" onClick={handleEditBinder}>
              Edit Binder
            </Button>

            <Button variant="deleteBinder" onClick={handleDeleteBinder}>
              Delete Binder
            </Button>

            <Avatar />
          </div>
        </header>

        {selectedBinder && isEditOpen ? (
          <CreateBinderModal
            isOpen={isEditOpen}
            mode="edit"
            initialBinder={selectedBinder}
            onClose={() => setIsEditOpen(false)}
            onCreated={handleBinderUpdated}
          />
        ) : null}

        {selectedBinder && isDeleteOpen ? (
          <ConfirmDeleteModal
            isOpen={isDeleteOpen}
            title={binderItems.length > 0 ? 'Cannot delete binder' : 'Delete this binder?'}
            message={
              binderItems.length > 0
                ? `This binder still has ${binderItems.length} items. Move or delete them first.`
                : "This can't be undone."
            }
            confirmLabel={binderItems.length > 0 ? null : 'Delete binder'}
            isDeleting={isDeleting}
            error={deleteError}
            onConfirm={handleConfirmDelete}
            onClose={() => {
              setDeleteError('');
              setIsDeleteOpen(false);
            }}
          />
        ) : null}

        <AddItemModal
          isOpen={isAddModalOpen}
          mode="add"
          initialItem={null}
          binders={binders}
          defaultBinderId={binderId}
          onClose={() => setIsAddModalOpen(false)}
          onSaved={loadData}
          onBinderCreated={loadData}
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

        <button type="button" className={styles.backLink} onClick={() => navigate('/binders')}>
          ← All Binders
        </button>

        <p className={styles.subheading}>Items stored in this binder.</p>

        <section className={styles.contentCard}>
          {loading ? (
            <div className={styles.loadingState}>Loading items...</div>
          ) : !selectedBinder ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyInner}>
                <h2 className={styles.emptyTitle}>Binder not found</h2>
                <p className={styles.emptyText}>This binder could not be found.</p>

                <div className={styles.emptyActionWrap}>
                  <Button variant="newItem" onClick={() => navigate('/binders')}>
                    Back to binders
                  </Button>
                </div>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyInner}>
                <h2 className={styles.emptyTitle}>No items in this binder yet</h2>

                <div className={styles.decorativeBinderWrap}>
                  <BinderCard
                    binder={{
                      name: selectedBinder.name,
                      color: selectedBinder.color || 'orange',
                    }}
                    size="large"
                    onClick={() => {}}
                  />
                </div>

                <p className={styles.inventoryCount}>0 items in this binder</p>

                <div className={styles.emptyActionWrap}>
                  <Button variant="newItem" onClick={handleNewItem}>
                    New Item
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.gridWrapper}>
              <div className={styles.populatedSummary}>
                <p className={styles.inventoryCountSmall}>
                  {filteredItems.length} items in this binder
                </p>
              </div>

              <div className={styles.itemGrid}>
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item._id || item.id}
                    item={item}
                    binder={selectedBinder}
                    onClick={() => handleOpenItem(item)}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default BinderDetailPage;
