import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../api/dashboard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatCard     from '../components/StatCard';
import InsightCard  from '../components/InsightCard';
import ActivityChart from '../components/ActivityChart';
import styles from './Dashboard.module.css';

/* ── helpers ─────────────────────────────────────────────────────────── */

function greet() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  if (h < 22) return 'Good evening';
  return 'Burning midnight oil';
}

const ACTION_LABELS = {
  login: 'Signed in',
  signup: 'Joined DevTrace',
  view_dashboard: 'Viewed dashboard',
  create_note: 'Created a note',
  update_note: 'Updated a note',
  delete_note: 'Deleted a note',
  create_task: 'Created a task',
  update_task: 'Updated a task',
  delete_task: 'Deleted a task',
  complete_task: 'Completed a task',
  custom: 'Custom event',
};

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

  const trendText = stats.weeklyTrend
    ? stats.weeklyTrend.direction === 'new'  ? 'First week!'
    : stats.weeklyTrend.direction === 'up'   ? `↑ ${stats.weeklyTrend.pct}% this week`
    : `↓ ${stats.weeklyTrend.pct}% this week`
    : null;

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
          value={stats.productivity != null ? `${stats.productivity}` : null}
          sub={trendText ?? ''}
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
            <span className={styles.panelBadge}>Daily actions</span>
          </div>
          <ActivityChart data={chart} loading={loading} />
        </section>

        {/* Insights */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>AI Insights</h2>
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
            <p className={styles.summaryVal}>{loading ? '…' : (stats.productivity != null ? `${stats.productivity}/100` : '—')}</p>
            <p className={styles.summaryLabel}>Productivity score</p>
          </div>
        </div>
      </div>

    </div>
  );
}
