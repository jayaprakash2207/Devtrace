import styles from './StatCard.module.css';

const COLOR_MAP = {
  primary: { icon: 'var(--primary-dim)',  glow: 'var(--primary)',       text: 'var(--primary-light)' },
  accent:  { icon: 'var(--accent-dim)',   glow: 'var(--accent)',        text: 'var(--accent)'        },
  success: { icon: 'var(--success-dim)',  glow: 'var(--success)',       text: 'var(--success)'       },
  warning: { icon: 'var(--warning-dim)',  glow: 'var(--warning)',       text: 'var(--warning)'       },
};

export default function StatCard({ icon, label, value, sub, color = 'primary', loading = false }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.primary;

  if (loading) {
    return (
      <div className={styles.card}>
        <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 28, width: '45%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 10, width: '70%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card} style={{ '--glow': c.glow }}>
      <div className={styles.iconWrap} style={{ background: c.icon }}>
        <span className={styles.icon}>{icon}</span>
      </div>
      <div className={styles.body}>
        <p className={styles.label}>{label}</p>
        <p className={styles.value} style={{ color: c.text }}>{value ?? '—'}</p>
        {sub && <p className={styles.sub}>{sub}</p>}
      </div>
    </div>
  );
}
