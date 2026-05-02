import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from './Auth.module.css';

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const { login }   = useAuth();
  const toast       = useToast();
  const navigate    = useNavigate();

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await loginApi(form);
      login(token, user);
      toast.success(`Welcome back, ${user.username || user.email}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left branding panel */}
      <div className={styles.left}>
        <div className={styles.leftGlow} />
        <div className={styles.leftContent}>
          <div className={styles.leftBrand}>
            <span className={styles.leftLogo}>⬡</span>
            <span className={styles.leftBrandName}>DevTrace</span>
          </div>
          <h2 className={styles.leftTitle}>
            Welcome back.<br />
            <span className="gradient-text">Your streak awaits.</span>
          </h2>
          <p className={styles.leftSub}>
            Sign in to view your dashboard, track your productivity streak,
            and pick up where you left off.
          </p>
          <div className={styles.leftQuotes}>
            <div className={styles.quote}>
              <p className={styles.quoteText}>"DevTrace helped me realise I was most productive late at night — and I reshaped my workflow around that."</p>
              <p className={styles.quoteAuthor}>— Developer using DevTrace</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className={styles.right}>
        <div className={styles.formCard}>
          <h1 className={styles.formTitle}>Sign in</h1>
          <p className={styles.formSub}>
            No account?{' '}
            <Link to="/signup">Create one for free →</Link>
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error}>
                <span>⚠</span> {error}
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading
                ? <><span className="spinner" style={{ width:15,height:15,borderWidth:2 }} /> Signing in…</>
                : 'Sign in →'
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
