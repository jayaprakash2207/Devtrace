import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../api/dashboard';
import { useAuth }      from '../context/AuthContext';
import { useToast }     from '../context/ToastContext';
import StatCard         from '../components/StatCard';
import InsightCard      from '../components/InsightCard';
import ActivityChart    from '../components/ActivityChart';
import styles from './Dashboard.module.css';

/* ── helpers ─────────────────────────────────────────────────────────── */

function greet() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  if (h < 22) return 'Good evening';
  return 'Burning midnight oil';
}

/* ── ScoreBar ─────────────────────────────────────────────────────────── */

const FACTOR_COLORS = {
  'Task Completion':     '#10b981',
  'Consistency':         '#6366f1',
  'Daily Streak':        '#f59e0b',
  'Session Depth':       '#22d3ee',
  'High-Priority Focus': '#ef4444',
};

function ScoreBar({ label, score, max }) {
  const pct     = max > 0 ? Math.round((score / max) * 100) : 0;
  const color   = FACTOR_COLORS[label] ?? 'var(--primary)';
  const barRef  = useRef(null);

  useEffect(() => {
    if (!barRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          barRef.current.style.width = `${pct}%`;
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(barRef.current.parentElement);
    return () => obs.disconnect();
  }, [pct]);

  return (
    <div className={styles.scoreBarRow}>
      <div className={styles.scoreBarMeta}>
        <span className={styles.scoreBarLabel}>{label}</span>
        <span className={styles.scoreBarVal} style={{ color }}>{score}/{max}</span>
      </div>
      <div className={styles.scoreBarTrack}>
        <div
          ref={barRef}
          className={styles.scoreBarFill}
          style={{ width: 0, background: color }}
        />
      </div>
    </div>
  );
}

/* ── PeriodChart ─────────────────────────────────────────────────────── */

const PERIOD_META = {
  morning:   { label: 'Morning',   icon: '🌅' },
  afternoon: { label: 'Afternoon', icon: '☀️' },
  evening:   { label: 'Evening',   icon: '🌆' },
  night:     { label: 'Night',     icon: '🌙' },
};

function PeriodChart({ distribution }) {
  if (!distribution) {
    return <div className={styles.periodEmpty}>Not enough data yet.</div>;
  }
  const entries = Object.entries(distribution);
  return (
    <div className={styles.periodGrid}>
      {entries.map(([key, pct]) => {
        const meta = PERIOD_META[key] ?? { label: key, icon: '⏰' };
        return (
          <div key={key} className={styles.periodCell}>
            <span className={styles.periodIcon}>{meta.icon}</span>
            <div className={styles.periodBarTrack}>
              <div
                className={styles.periodBarFill}
                style={{ height: `${pct}%`, minHeight: pct > 0 ? 3 : 0 }}
              />
            </div>
            <span className={styles.periodPct}>{pct}%</span>
            <span className={styles.periodLabel}>{meta.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── MomentumBadge ───────────────────────────────────────────────────── */

const MOMENTUM_CONFIG = {
  rising:  { icon: '📈', color: 'var(--success)',  label: 'Rising' },
  falling: { icon: '📉', color: 'var(--danger)',   label: 'Falling' },
  stable:  { icon: '➡️', color: 'var(--muted)',    label: 'Stable' },
};

function MomentumBadge({ weeklyTrend }) {
  if (!weeklyTrend) return null;
  const cfg = MOMENTUM_CONFIG[weeklyTrend.direction] ?? MOMENTUM_CONFIG.stable;
  return (
    <span className={styles.momentumBadge} style={{ color: cfg.color, borderColor: cfg.color }}>
      {cfg.icon} {cfg.label} {weeklyTrend.pct > 0 ? `${weeklyTrend.pct}%` : ''}
    </span>
  );
}

/* ── component ───────────────────────────────────────────────────────── */

export default function Dashboard() {
  const { user } = useAuth();
  const toast    = useToast();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDashboard();
      setData(result);
    } catch {
      toast.error('Failed to load dashboard. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const stats    = data?.stats    ?? {};
  const insights = data?.insights ?? [];
  const chart    = data?.chart    ?? [];

  const breakdown  = stats.scoreBreakdown   ? Object.values(stats.scoreBreakdown)   : [];
  const periodDist = stats.periodDistribution ?? null;

  return (
    <div className="page-wrap">

      {/* ── Page header ──────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.greeting}>
            {greet()}, <span className="gradient-text">{user?.username || 'dev'}</span> 👋
          </h1>
          <p className={styles.date}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link to="/notes" className={styles.headerBtn}>+ New Note</Link>
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────── */}
      <div className={styles.statsGrid}>
        <StatCard
          icon="🖥️"
          label="Sessions"
          value={stats.totalSessions}
          sub="total logins"
          color="primary"
          loading={loading}
        />
        <StatCard
          icon="🔥"
          label="Streak"
          value={stats.streak != null ? `${stats.streak}d` : null}
          sub={stats.streak >= 7 ? 'On fire! Keep going' : 'Log in daily to build streak'}
          color="warning"
          loading={loading}
        />
        <StatCard
          icon="⏰"
          label="Peak time"
          value={stats.mostActivePeriod
            ? stats.mostActivePeriod.charAt(0).toUpperCase() + stats.mostActivePeriod.slice(1)
            : null}
          sub={stats.mostActiveHour != null ? `Around ${stats.mostActiveHour}:00` : 'Not enough data yet'}
          color="accent"
          loading={loading}
        />
        <StatCard
          icon="⚡"
          label="Productivity"
          value={stats.productivity != null
            ? `${stats.productivity}/100 ${stats.grade ? stats.grade.grade : ''}`
            : null}
          sub={stats.grade ? stats.grade.label : ''}
          color="success"
          loading={loading}
        />
      </div>

      {/* ── Main two-column grid ──────────────────────────── */}
      <div className={styles.mainGrid}>

        {/* Chart */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>7-Day Activity</h2>
            <MomentumBadge weeklyTrend={stats.weeklyTrend} />
          </div>
          <ActivityChart data={chart} loading={loading} />
        </section>

        {/* Insights */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Intelligence Insights</h2>
            <span className={styles.panelBadge}>{insights.length} active</span>
          </div>
          {loading ? (
            <div className={styles.insightsSkeleton}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 68, borderRadius: 10 }} />
              ))}
            </div>
          ) : insights.length === 0 ? (
            <div className={styles.emptyInsights}>
              <span>🤖</span>
              <p>Complete more tasks and log in daily to unlock insights.</p>
            </div>
          ) : (
            <div className={styles.insightsList}>
              {insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
            </div>
          )}
        </section>
      </div>

      {/* ── Intelligence engine panels ────────────────────── */}
      <div className={styles.analyticsGrid}>

        {/* Score breakdown */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Score Breakdown</h2>
            {stats.grade && !loading && (
              <span
                className={styles.gradeBadge}
                style={{ color: stats.grade.color, borderColor: stats.grade.color }}
              >
                {stats.grade.grade} · {stats.grade.label}
              </span>
            )}
          </div>
          {loading ? (
            <div className={styles.insightsSkeleton}>
              {[1,2,3,4,5].map(i => (
                <div key={i} className="skeleton" style={{ height: 36, borderRadius: 6 }} />
              ))}
            </div>
          ) : breakdown.length === 0 ? (
            <p className={styles.noData}>Log more activity to see your breakdown.</p>
          ) : (
            <div className={styles.breakdownList}>
              {breakdown.map(f => <ScoreBar key={f.label} {...f} />)}
            </div>
          )}
        </section>

        {/* Period distribution */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>When You Work</h2>
            {stats.peakDayName && !loading && (
              <span className={styles.panelBadge}>Best day: {stats.peakDayName}</span>
            )}
          </div>
          {loading ? (
            <div className={styles.periodSkeleton}>
              {[1,2,3,4].map(i => (
                <div key={i} className="skeleton" style={{ height: 80, borderRadius: 6, flex: 1 }} />
              ))}
            </div>
          ) : (
            <PeriodChart distribution={periodDist} />
          )}
        </section>
      </div>

      {/* ── Summary row ──────────────────────────────────── */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}>📝</span>
          <div>
            <p className={styles.summaryVal}>{loading ? '…' : (stats.totalNotes ?? '—')}</p>
            <p className={styles.summaryLabel}>Notes saved</p>
          </div>
          <Link to="/notes" className={styles.summaryLink}>View all →</Link>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}>✅</span>
          <div>
            <p className={styles.summaryVal}>{loading ? '…' : `${stats.completedTasks ?? '—'}/${stats.totalTasks ?? '—'}`}</p>
            <p className={styles.summaryLabel}>Tasks completed</p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}>🏆</span>
          <div>
            <p className={styles.summaryVal} style={{ color: stats.grade?.color }}>
              {loading ? '…' : (stats.productivity != null ? `${stats.productivity}/100` : '—')}
            </p>
            <p className={styles.summaryLabel}>Productivity score</p>
          </div>
        </div>
      </div>

    </div>
  );
}
