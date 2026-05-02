import { useEffect, useRef, useState } from 'react';
import styles from './ActivityChart.module.css';

export default function ActivityChart({ data = [], loading = false }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!data.length) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [data]);

  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.barsRow}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={styles.barCol}>
              <div className="skeleton" style={{ width: '100%', height: `${30 + Math.random() * 50}%`, borderRadius: 4 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) return <p className={styles.empty}>No activity data yet.</p>;

  const max = Math.max(...data.map((d) => d.count), 1);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className={styles.wrap} ref={ref}>
      <div className={styles.barsRow}>
        {data.map(({ date, count }) => {
          const pct = (count / max) * 100;
          const isToday = date === today;
          return (
            <div key={date} className={styles.barCol} title={`${date}: ${count} action${count !== 1 ? 's' : ''}`}>
              <span className={styles.count}>{count > 0 ? count : ''}</span>
              <div className={styles.track}>
                <div
                  className={`${styles.bar} ${isToday ? styles.today : ''}`}
                  style={{ height: animated && count > 0 ? `${Math.max(pct, 4)}%` : '0%' }}
                />
              </div>
              <span className={`${styles.dayLabel} ${isToday ? styles.todayLabel : ''}`}>
                {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </div>
          );
        })}
      </div>
      <div className={styles.xAxis} />
    </div>
  );
}
