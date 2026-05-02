import styles from './InsightCard.module.css';

const TYPE_THEME = {
  trend_up:      { border: 'var(--success)',  bg: 'var(--success-dim)'  },
  trend_down:    { border: 'var(--danger)',   bg: 'var(--danger-dim)'   },
  streak:        { border: 'var(--warning)',  bg: 'var(--warning-dim)'  },
  peak_time:     { border: 'var(--primary)',  bg: 'var(--primary-dim)'  },
  high_priority: { border: 'var(--warning)',  bg: 'var(--warning-dim)'  },
  task_champion: { border: 'var(--success)',  bg: 'var(--success-dim)'  },
  low_activity:  { border: 'var(--muted)',    bg: 'rgba(100,116,139,.08)' },
  new_user:      { border: 'var(--accent)',   bg: 'var(--accent-dim)'   },
};

export default function InsightCard({ icon, title, message, type }) {
  const theme = TYPE_THEME[type] ?? TYPE_THEME.new_user;
  return (
    <div
      className={styles.card}
      style={{ '--stripe': theme.border, background: theme.bg }}
    >
      <span className={styles.emoji}>{icon}</span>
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}
