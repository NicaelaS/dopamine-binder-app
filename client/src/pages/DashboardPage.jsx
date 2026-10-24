import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import BinderCard from '../components/BinderCard';
import CreateBinderModal from '../components/CreateBinderModal';
import Avatar from '../components/Avatar';
import { getBinders, getItems } from '../services/api';

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

function DashboardPage({ user }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [binders, setBinders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsRequestFailed, setItemsRequestFailed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateBinderOpen, setIsCreateBinderOpen] = useState(false);
  const searchRef = useRef(null);
  const favoriteCount = 0;
  const pinnedCount = 0;

  const loadData = async () => {
    try {
      setLoading(true);
      setItemsRequestFailed(false);

      const [itemsResult, bindersResult] = await Promise.allSettled([
        getItems(),
        getBinders(),
      ]);

      if (itemsResult.status === 'rejected') {
        console.error('Failed to fetch items:', itemsResult.reason);
        setItemsRequestFailed(true);
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

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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

  const searchResults = useMemo(() => {
    const trimmedTerm = searchTerm.trim().toLowerCase();

    if (!trimmedTerm) {
      return { binderResults: [], itemResults: [] };
    }

    const binderResults = binders
      .filter((binder) => String(binder?.name || '').toLowerCase().includes(trimmedTerm))
      .slice(0, 4);

    const itemResults = items
      .map((item) => {
        const binder = resolveBinderForItem(item);
        const binderName = binder?.name || 'No binder';
        const tagText = Array.isArray(item?.tags) ? item.tags.join(' ') : '';
        const haystack = [
          item?.title || '',
          tagText,
          binderName,
        ].join(' ').toLowerCase();

        return {
          item,
          binderName,
          binderId: binder?._id || null,
          haystack,
        };
      })
      .filter(({ haystack }) => haystack.includes(trimmedTerm))
      .slice(0, 6);

    return { binderResults, itemResults };
  }, [binders, items, searchTerm]);

  const latestItem = useMemo(() => {
    if (!items.length) return null;

    return items.reduce((latest, item) => {
      const itemDate = item?.createdAt ? new Date(item.createdAt) : new Date(0);
      const latestDate = latest?.createdAt ? new Date(latest.createdAt) : new Date(0);

      return itemDate > latestDate ? item : latest;
    }, items[0]);
  }, [items]);

  const totalItemsValue = loading ? '...' : itemsRequestFailed ? '-' : items.length;

  const latestBinder = latestItem ? resolveBinderForItem(latestItem) : null;
  const latestBinderColorName = (latestBinder?.color || 'orange').toLowerCase();
  const latestBinderColor = binderColorMap[latestBinderColorName] || binderColorMap.orange;
  const latestItemType = latestItem?.type === 'TCG'
    ? 'Trading card'
    : latestItem?.type === 'BOOK'
      ? 'Book'
      : 'Item';
  const latestItemDate = latestItem?.createdAt
    ? new Date(latestItem.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const handleNewBinder = () => {
    setIsCreateBinderOpen(true);
  };

  const handleBinderCreated = async () => {
    setIsCreateBinderOpen(false);
    await loadData();
  };

  const handleNewItem = () => {
    navigate('/items', { state: { openAddItem: true } });
  };

  const handleSearchSelect = (targetPath) => {
    setSearchTerm('');
    setIsSearchOpen(false);
    navigate(targetPath);
  };

  const handlePinnedEmptyStateClick = () => {
    navigate('/binders');
  };

  return (
    <div className={`background-page ${styles.page}`}>
      <Sidebar activePath="/dashboard" />

      <main className={styles.main}>
        <CreateBinderModal
          isOpen={isCreateBinderOpen}
          mode="create"
          onClose={() => setIsCreateBinderOpen(false)}
          onCreated={handleBinderCreated}
        />

        <div className={styles.topBar}>
          <h1 className={styles.pageTitle}>Dashboard</h1>

          <div className={styles.searchWrap} ref={searchRef}>
            <input
              type="text"
              value={searchTerm}
              onFocus={() => setIsSearchOpen(Boolean(searchTerm.trim()))}
              onChange={(event) => {
                const nextValue = event.target.value;
                setSearchTerm(nextValue);
                setIsSearchOpen(Boolean(nextValue.trim()));
              }}
              placeholder="Search collections, items, or tags..."
              className={styles.searchInput}
            />

            {isSearchOpen && searchTerm.trim() && (
              <div className={styles.searchDropdown}>
                {loading || itemsRequestFailed ? (
                  <div className={styles.searchEmpty}>No results for "{searchTerm.trim()}"</div>
                ) : searchResults.binderResults.length === 0 && searchResults.itemResults.length === 0 ? (
                  <div className={styles.searchEmpty}>No results for "{searchTerm.trim()}"</div>
                ) : (
                  <>
                    {searchResults.binderResults.length > 0 && (
                      <div className={styles.searchGroup}>
                        <div className={styles.searchGroupTitle}>Binders</div>
                        {searchResults.binderResults.map((binder) => (
                          <div
                            key={binder._id}
                            className={styles.searchRow}
                            onClick={() => handleSearchSelect(`/binders/${binder._id}`)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                handleSearchSelect(`/binders/${binder._id}`);
                              }
                            }}
                          >
                            {binder.name}
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults.itemResults.length > 0 && (
                      <div className={styles.searchGroup}>
                        <div className={styles.searchGroupTitle}>Items</div>
                        {searchResults.itemResults.map(({ item, binderName, binderId }) => {
                          const itemType = item?.type === 'TCG' ? 'Trading card' : 'Book';

                          return (
                            <div
                              key={item?._id || item?.title || binderName}
                              className={styles.searchRow}
                              onClick={() => handleSearchSelect(binderId ? `/binders/${binderId}` : '/items')}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  handleSearchSelect(binderId ? `/binders/${binderId}` : '/items');
                                }
                              }}
                            >
                              <div>{item?.title || 'Untitled item'}</div>
                              <div className={styles.searchMeta}>{binderName} · {itemType}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <Avatar />
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
          <StatCard label="Total items" value={totalItemsValue} caption="No items added yet" />

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

            {loading ? (
              <div className={styles.emptyBox}>
                <p className={styles.emptyText}>Loading...</p>
              </div>
            ) : !latestItem ? (
              <div className={styles.emptyBox}>
                <button className={styles.uploadButton} onClick={handleNewItem}>
                  Upload item
                </button>
                <p className={styles.emptyText}>
                  Upload your first item to see the latest activity here, including the item name, collection, and upload details.
                </p>
              </div>
            ) : (
              <div className={styles.latestItemBox}>
                <div className={styles.latestItemHeader}>
                  <span
                    className={styles.latestBinderDot}
                    style={{ backgroundColor: latestBinderColor }}
                  />
                  <span className={styles.latestBinderName}>{latestBinder?.name || 'No binder'}</span>
                </div>

                <p className={styles.latestItemTitle}>{latestItem.title}</p>
                <p className={styles.latestItemType}>{latestItemType}</p>
                <p className={styles.latestItemDate}>{latestItemDate}</p>
              </div>
            )}
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
