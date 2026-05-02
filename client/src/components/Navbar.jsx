import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>
        <span className={styles.logo}>⬡</span>
        <span className={styles.brandName}>DevTrace</span>
      </div>
      <div className={styles.links}>
        <Link to="/dashboard" className={`${styles.link} ${pathname === '/dashboard' ? styles.active : ''}`}>
          Dashboard
        </Link>
        <Link to="/tasks" className={`${styles.link} ${pathname === '/tasks' ? styles.active : ''}`}>
          Tasks
        </Link>
      </div>
      <div className={styles.right}>
        <span className={styles.user}>{user?.username}</span>
        <button className={styles.logout} onClick={handleLogout}>Sign out</button>
      </div>
    </nav>
  );
}
