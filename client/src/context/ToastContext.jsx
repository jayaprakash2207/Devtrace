import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastCtx = createContext(null);

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'info', duration = 3800) => {
      const id = ++_id;
      setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const toast = {
    success: (msg, dur) => push(msg, 'success', dur),
    error:   (msg, dur) => push(msg, 'error',   dur ?? 5000),
    warning: (msg, dur) => push(msg, 'warning', dur),
    info:    (msg, dur) => push(msg, 'info',    dur),
  };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);

/* ── Inline renderer (no extra file needed) ──────────────────────────── */
const ICONS = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div style={stackStyle}>
      {toasts.map((t) => (
        <div key={t.id} style={{ ...toastStyle, ...typeStyle[t.type] }}>
          <span style={iconStyle(t.type)}>{ICONS[t.type]}</span>
          <span style={{ flex: 1, fontSize: '0.875rem' }}>{t.message}</span>
          <button onClick={() => onDismiss(t.id)} style={closeStyle}>✕</button>
        </div>
      ))}
    </div>
  );
}

const stackStyle = {
  position: 'fixed', bottom: '24px', right: '24px',
  zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px',
  maxWidth: '380px', width: 'calc(100vw - 48px)',
};

const toastStyle = {
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '12px 14px', borderRadius: '10px',
  border: '1px solid', backdropFilter: 'blur(8px)',
  animation: 'fadeIn 200ms ease',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

const typeStyle = {
  success: { background: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.3)', color: '#6ee7b7' },
  error:   { background: 'rgba(239,68,68,0.12)',  borderColor: 'rgba(239,68,68,0.3)',  color: '#fca5a5' },
  warning: { background: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.3)', color: '#fcd34d' },
  info:    { background: 'rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.3)', color: '#a5b4fc' },
};

const iconStyle = (type) => ({
  width: '22px', height: '22px', borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
  background: typeStyle[type].borderColor,
});

const closeStyle = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  opacity: 0.6, fontSize: '0.75rem', padding: '2px 4px',
  color: 'inherit', flexShrink: 0,
  transition: 'opacity 150ms',
};
