import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

const navItems = [
  { label: 'Dashboard', path: '/DashboardPage' },
  { label: 'All Binders', path: '/BindersPage' },
  { label: 'All Items', path: '/ItemsPage' },
];

const normalizePath = (path = '') => path.toLowerCase();

function Sidebar({ activePath }) {
  const location = useLocation();
  const currentPath = normalizePath(activePath || location.pathname);

  return (
    <nav className={styles.sidebar}>
      <div className={styles.branding}>
        <p className={styles.appName}>Dopamine Binder</p>
        <p className={styles.appTagline}>Collection Inventory App</p>
      </div>

      <div className={styles.navList}>
        {navItems.map((item) => {
          const normalizedItemPath = normalizePath(item.path);
          const isActive =
            currentPath === normalizedItemPath ||
            (currentPath === '/dashboardpage' && normalizedItemPath === '/dashboard') ||
            (currentPath === '/binderspage' && normalizedItemPath === '/binders') ||
            (currentPath === '/itemspage' && normalizedItemPath === '/items');

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default Sidebar;