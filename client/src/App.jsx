import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing       from './pages/Landing';
import Login         from './pages/Login';
import Signup        from './pages/Signup';
import OAuthCallback from './pages/OAuthCallback';
import Dashboard     from './pages/Dashboard';
import Notes         from './pages/Notes';
import Tasks         from './pages/Tasks';
import Profile       from './pages/Profile';
import Sidebar       from './components/Sidebar';

function FullPageSpinner() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--bg)' }}>
      <span className="spinner" style={{ width:28, height:28 }} />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!token)  return <Navigate to="/login" replace />;
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">{children}</main>
    </div>
  );
}

function PublicRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  return token ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/"              element={<Landing />} />
      <Route path="/login"         element={<PublicRoute><Login  /></PublicRoute>} />
      <Route path="/signup"        element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/auth/callback" element={<OAuthCallback />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/notes"     element={<ProtectedRoute><Notes     /></ProtectedRoute>} />
      <Route path="/tasks"     element={<ProtectedRoute><Tasks     /></ProtectedRoute>} />
      <Route path="/profile"   element={<ProtectedRoute><Profile   /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
