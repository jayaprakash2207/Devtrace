import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup as signupApi } from '../api/auth';
import { useAuth }  from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from './Auth.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ── OAuth icon components ──────────────────────────────────────────── */

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  );
}

/* ── Password strength ──────────────────────────────────────────────── */

function getStrength(pw) {
  if (!pw) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)               score++;
  if (pw.length >= 12)              score++;
  if (/[A-Z]/.test(pw))            score++;
  if (/[0-9]/.test(pw))            score++;
  if (/[^A-Za-z0-9]/.test(pw))    score++;
  if (score <= 1) return { level: 1, label: 'Weak',   color: '#ef4444' };
  if (score <= 3) return { level: 2, label: 'Medium',  color: '#f59e0b' };
  return             { level: 3, label: 'Strong',  color: '#10b981' };
}

/* ── component ──────────────────────────────────────────────────────── */

export default function Signup() {
  const [form,    setForm]    = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const { login }  = useAuth();
  const toast      = useToast();
  const navigate   = useNavigate();

  const strength = getStrength(form.password);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim())
      errs.username = 'Username is required';
    else if (form.username.trim().length < 2)
      errs.username = 'Username must be at least 2 characters';
    else if (form.username.trim().length > 30)
      errs.username = 'Username must be 30 characters or fewer';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username.trim()))
      errs.username = 'Letters, numbers, and underscores only';

    if (!form.email)
      errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = 'Enter a valid email address';

    if (!form.password)
      errs.password = 'Password is required';
    else if (form.password.length < 8)
      errs.password = 'Password must be at least 8 characters';
    else if (!/[A-Za-z]/.test(form.password))
      errs.password = 'Password must contain at least one letter';
    else if (!/[0-9]/.test(form.password))
      errs.password = 'Password must contain at least one number';

    if (!form.confirm)
      errs.confirm = 'Please confirm your password';
    else if (form.confirm !== form.password)
      errs.confirm = 'Passwords do not match';

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setErrors({});
    setLoading(true);
    try {
      const { token, user } = await signupApi({
        username: form.username.trim(),
        email:    form.email,
        password: form.password,
      });
      login(token, user);
      toast.success('Account created! Welcome to DevTrace.');
      navigate('/dashboard');
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors?.length) {
        const fieldMap = {};
        apiErrors.forEach(({ field, message }) => { fieldMap[field] = message; });
        setErrors(fieldMap);
      } else {
        const msg = err.response?.data?.message || 'Sign up failed. Please try again.';
        setErrors({ global: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left branding */}
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

      {/* Right form */}
      <div className={styles.right}>
        <div className={styles.formCard}>
          <h1 className={styles.formTitle}>Create account</h1>
          <p className={styles.formSub}>
            Already have one?{' '}
            <Link to="/login">Sign in →</Link>
          </p>

          {/* OAuth buttons */}
          <div className={styles.oauthBtns}>
            <a href={`${API_BASE}/api/auth/google`} className={`${styles.oauthBtn} ${styles.oauthBtnGoogle}`}>
              <GoogleIcon /> Continue with Google
            </a>
            <a href={`${API_BASE}/api/auth/github`} className={`${styles.oauthBtn} ${styles.oauthBtnGithub}`}>
              <GitHubIcon /> Continue with GitHub
            </a>
          </div>

          <div className={styles.divider}>or create with email</div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {errors.global && (
              <div className={styles.error}><span>⚠</span> {errors.global}</div>
            )}

            <div className={styles.field}>
              <label className={styles.label} htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="devname"
                value={form.username}
                onChange={set('username')}
                autoFocus
                autoComplete="username"
                className={errors.username ? styles.inputError : ''}
              />
              {errors.username
                ? <span className={styles.fieldError}>{errors.username}</span>
                : <span className={styles.fieldHint}>Letters, numbers, underscores · 2–30 chars</span>
              }
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
                className={errors.email ? styles.inputError : ''}
              />
              {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Min. 8 chars, letters + numbers"
                value={form.password}
                onChange={set('password')}
                autoComplete="new-password"
                className={errors.password ? styles.inputError : ''}
              />
              {form.password && (
                <div className={styles.strengthRow}>
                  <div className={styles.strengthTrack}>
                    <div
                      className={styles.strengthFill}
                      style={{
                        width: `${(strength.level / 3) * 100}%`,
                        background: strength.color,
                      }}
                    />
                  </div>
                  <span className={styles.strengthLabel} style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
              {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="confirm">Confirm password</label>
              <input
                id="confirm"
                type="password"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={set('confirm')}
                autoComplete="new-password"
                className={errors.confirm ? styles.inputError : ''}
              />
              {errors.confirm && <span className={styles.fieldError}>{errors.confirm}</span>}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading
                ? <><span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> Creating account…</>
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
