import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from './Sidebar.module.css';

const NAV = [
  { to: '/dashboard', icon: '▦',  label: 'Dashboard' },
  { to: '/notes',     icon: '✎',  label: 'Notes'     },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('Signed out successfully');
    navigate('/login');
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '?';

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>⬡</div>
        <span className={styles.brandName}>DevTrace</span>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <p className={styles.navLabel}>Menu</p>
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.navIcon}>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom user card */}
      <div className={styles.footer}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.userInfo}>
          <p className={styles.userName}>{user?.username || 'User'}</p>
          <p className={styles.userEmail}>{user?.email}</p>
        </div>
        <button
          className={styles.logoutBtn}
          onClick={handleLogout}
          title="Sign out"
        >
          ⇥
        </button>
      </div>
    </aside>
  );
}
