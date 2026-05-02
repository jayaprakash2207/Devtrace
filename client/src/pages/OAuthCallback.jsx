import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function OAuthCallback() {
  const [params]   = useSearchParams();
  const { login }  = useAuth();
  const toast      = useToast();
  const navigate   = useNavigate();

  useEffect(() => {
    const token    = params.get('token');
    const userStr  = params.get('user');
    const error    = params.get('error');

    if (error || !token) {
      toast.error('Sign-in was cancelled or failed. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    try {
      const user = JSON.parse(userStr);
      login(token, user);
      toast.success(`Welcome${user.username ? `, ${user.username}` : ''}! You're all set.`);
      navigate('/dashboard', { replace: true });
    } catch {
      toast.error('Something went wrong. Please sign in again.');
      navigate('/login', { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--bg)', flexDirection: 'column', gap: '1rem',
    }}>
      <span className="spinner" style={{ width: 32, height: 32 }} />
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Completing sign-in…</p>
    </div>
  );
}
