import { useState } from 'react';
import { useAuth }  from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { updateProfile } from '../api/auth';
import styles from './Profile.module.css';

const PROVIDER_LABEL = { google: 'Google', github: 'GitHub', local: 'Email / Password' };
const PROVIDER_COLOR = { google: '#ea4335', github: '#24292f', local: 'var(--primary)' };

function getStrength(pw) {
  if (!pw) return null;
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Za-z]/.test(pw) && /[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { level: 1, label: 'Weak',   color: '#ef4444' };
  if (s <= 2) return { level: 2, label: 'Medium',  color: '#f59e0b' };
  return        { level: 3, label: 'Strong',  color: '#10b981' };
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [username, setUsername] = useState(user?.username || '');
  const [unameErr, setUnameErr] = useState('');
  const [unameLoading, setUnameLoading] = useState(false);

  const [curPw,  setCurPw]  = useState('');
  const [newPw,  setNewPw]  = useState('');
  const [newPw2, setNewPw2] = useState('');
  const [pwErr,  setPwErr]  = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '?';

  const provider = user?.provider || 'local';
  const isOAuth  = provider !== 'local';

  const strength = getStrength(newPw);

  async function handleUsernameSubmit(e) {
    e.preventDefault();
    setUnameErr('');
    const trimmed = username.trim();
    if (!trimmed) return setUnameErr('Username is required');
    if (!/^[a-zA-Z0-9_]{2,30}$/.test(trimmed)) return setUnameErr('2–30 chars, letters/numbers/underscores only');
    if (trimmed === user?.username) return setUnameErr('No changes to save');
    setUnameLoading(true);
    try {
      const res = await updateProfile({ username: trimmed });
      updateUser(res.user);
      toast.success('Username updated!');
    } catch (err) {
      setUnameErr(err.response?.data?.message || 'Update failed');
    } finally {
      setUnameLoading(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPwErr('');
    if (!curPw)  return setPwErr('Current password is required');
    if (!newPw)  return setPwErr('New password is required');
    if (newPw !== newPw2) return setPwErr('Passwords do not match');
    if (newPw.length < 8 || !/[A-Za-z]/.test(newPw) || !/[0-9]/.test(newPw)) {
      return setPwErr('New password must be ≥ 8 chars with a letter and a number');
    }
    setPwLoading(true);
    try {
      await updateProfile({ currentPassword: curPw, newPassword: newPw });
      setCurPw(''); setNewPw(''); setNewPw2('');
      toast.success('Password changed successfully!');
    } catch (err) {
      setPwErr(err.response?.data?.message || 'Password change failed');
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="page-wrap">
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Profile</h1>
        <p className={styles.sub}>Manage your account settings</p>
      </div>

      <div className={styles.layout}>

        {/* ── Left: identity card ── */}
        <div className={styles.identityCard}>
          <div className={styles.avatarWrap}>
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" className={styles.avatarImg} referrerPolicy="no-referrer" />
              : <div className={styles.avatarFallback}>{initials}</div>
            }
          </div>
          <p className={styles.displayName}>{user?.username || 'User'}</p>
          <p className={styles.displayEmail}>{user?.email}</p>

          <div
            className={styles.providerBadge}
            style={{ '--badge-color': PROVIDER_COLOR[provider] }}
          >
            {provider === 'google' && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {provider === 'github' && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            )}
            {provider === 'local' && <span style={{ fontSize: '0.7rem' }}>✉</span>}
            {PROVIDER_LABEL[provider]}
          </div>

          {/* Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <span className={styles.statNum}>{user?.streakDays ?? 0}</span>
              <span className={styles.statLbl}>Day streak</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statBox}>
              <span className={styles.statNum}>{user?.totalSessions ?? 0}</span>
              <span className={styles.statLbl}>Sessions</span>
            </div>
          </div>

          <p className={styles.joinedAt}>
            Member since {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              : 'recently'}
          </p>
        </div>

        {/* ── Right: forms ── */}
        <div className={styles.forms}>

          {/* Edit username */}
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Edit username</h2>
            <form onSubmit={handleUsernameSubmit} noValidate>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  className={`${styles.input} ${unameErr ? styles.inputErr : ''}`}
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setUnameErr(''); }}
                  placeholder="your_handle"
                  maxLength={30}
                />
                {unameErr && <p className={styles.errMsg}>{unameErr}</p>}
                <p className={styles.hint}>2–30 characters. Letters, numbers, and underscores only.</p>
              </div>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={unameLoading}
              >
                {unameLoading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Save username'}
              </button>
            </form>
          </div>

          {/* Change password — hidden for OAuth users */}
          {isOAuth ? (
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>Password</h2>
              <p className={styles.oauthNote}>
                Your account uses {PROVIDER_LABEL[provider]} for authentication. Password management is handled by {PROVIDER_LABEL[provider]}.
              </p>
            </div>
          ) : (
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>Change password</h2>
              <form onSubmit={handlePasswordSubmit} noValidate>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="curPw">Current password</label>
                  <input
                    id="curPw"
                    type="password"
                    className={`${styles.input} ${pwErr ? styles.inputErr : ''}`}
                    value={curPw}
                    onChange={(e) => { setCurPw(e.target.value); setPwErr(''); }}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="newPw">New password</label>
                  <input
                    id="newPw"
                    type="password"
                    className={`${styles.input} ${pwErr ? styles.inputErr : ''}`}
                    value={newPw}
                    onChange={(e) => { setNewPw(e.target.value); setPwErr(''); }}
                    placeholder="Min 8 chars, letter + number"
                    autoComplete="new-password"
                  />
                  {newPw && strength && (
                    <div className={styles.strengthWrap}>
                      <div className={styles.strengthTrack}>
                        <div
                          className={styles.strengthFill}
                          style={{ width: `${(strength.level / 3) * 100}%`, background: strength.color }}
                        />
                      </div>
                      <span className={styles.strengthLabel} style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                  )}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="newPw2">Confirm new password</label>
                  <input
                    id="newPw2"
                    type="password"
                    className={`${styles.input} ${pwErr ? styles.inputErr : ''}`}
                    value={newPw2}
                    onChange={(e) => { setNewPw2(e.target.value); setPwErr(''); }}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                  {pwErr && <p className={styles.errMsg}>{pwErr}</p>}
                </div>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={pwLoading}
                >
                  {pwLoading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Update password'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
