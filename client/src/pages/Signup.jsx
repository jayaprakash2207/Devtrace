import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup as signupApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from './Auth.module.css';

export default function Signup() {
  const [form, setForm]       = useState({ username: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const { login }   = useAuth();
  const toast       = useToast();
  const navigate    = useNavigate();

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await signupApi(form);
      login(token, user);
      toast.success('Account created! Welcome to DevTrace.');
      navigate('/dashboard');
    } catch (err) {
      const errs = err.response?.data?.errors;
      const msg  = errs?.[0]?.message || err.response?.data?.message || 'Signup failed.';
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
            Start tracking.<br />
            <span className="gradient-text">Start growing.</span>
          </h2>
          <p className={styles.leftSub}>
            Create your free account and get immediate access to the activity dashboard,
            AI insights, smart notes, and streak tracking.
          </p>
          <div className={styles.leftQuotes}>
            <div className={styles.quote}>
              <p className={styles.quoteText}>"I built a 30-day streak and completed more tasks than in any prior month. DevTrace makes the invisible visible."</p>
              <p className={styles.quoteAuthor}>— Developer using DevTrace</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className={styles.right}>
        <div className={styles.formCard}>
          <h1 className={styles.formTitle}>Create account</h1>
          <p className={styles.formSub}>
            Already have one?{' '}
            <Link to="/login">Sign in →</Link>
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error}>
                <span>⚠</span> {error}
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label} htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="devname"
                value={form.username}
                onChange={set('username')}
                required
                minLength={2}
                maxLength={30}
                autoFocus
              />
            </div>

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
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={set('password')}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading
                ? <><span className="spinner" style={{ width:15,height:15,borderWidth:2 }} /> Creating account…</>
                : 'Create account →'
              }
            </button>

            <p className={styles.switchText} style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              By signing up you agree to our terms of service.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
