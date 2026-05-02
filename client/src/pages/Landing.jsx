import { Link } from 'react-router-dom';
import styles from './Landing.module.css';

/* ── Section: Navbar ──────────────────────────────────────────────────── */
function LandingNav() {
  return (
    <header className={styles.nav}>
      <div className={styles.navInner}>
        <div className={styles.navBrand}>
          <span className={styles.navLogo}>⬡</span>
          <span className={styles.navName}>DevTrace</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
        </div>
        <div className={styles.navCta}>
          <Link to="/login" className={styles.navLogin}>Sign in</Link>
          <Link to="/signup" className={styles.navSignup}>Get started</Link>
        </div>
      </div>
    </header>
  );
}

/* ── Section: Hero ────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroGlow} />
      <div className={styles.heroContent}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          Now in public beta — free forever for developers
        </div>
        <h1 className={styles.heroTitle}>
          Track your dev activity.
          <br />
          <span className="gradient-text">Unlock your potential.</span>
        </h1>
        <p className={styles.heroSub}>
          DevTrace automatically logs your sessions, tracks your productivity streak,
          and surfaces AI-powered insights so you always know where your time goes.
        </p>
        <div className={styles.heroBtns}>
          <Link to="/signup" className={styles.heroPrimary}>
            Start for free →
          </Link>
          <a href="#how" className={styles.heroSecondary}>
            See how it works
          </a>
        </div>
        {/* Mock dashboard preview */}
        <div className={styles.preview}>
          <div className={styles.previewBar}>
            <span className={styles.dot} style={{ background: '#ef4444' }} />
            <span className={styles.dot} style={{ background: '#f59e0b' }} />
            <span className={styles.dot} style={{ background: '#10b981' }} />
            <span className={styles.previewTitle}>DevTrace — Dashboard</span>
          </div>
          <div className={styles.previewBody}>
            <div className={styles.previewCards}>
              {[
                { icon: '🔥', label: 'Streak', val: '12 days' },
                { icon: '⚡', label: 'Score',  val: '94 / 100' },
                { icon: '🖥️', label: 'Sessions', val: '87' },
                { icon: '✅', label: 'Tasks',  val: '42 / 50' },
              ].map(({ icon, label, val }) => (
                <div key={label} className={styles.previewCard}>
                  <span className={styles.previewCardIcon}>{icon}</span>
                  <div>
                    <p className={styles.previewCardLabel}>{label}</p>
                    <p className={styles.previewCardVal}>{val}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.previewChart}>
              <p className={styles.previewChartTitle}>7-Day Activity</p>
              <div className={styles.previewBars}>
                {[35, 55, 40, 80, 65, 90, 70].map((h, i) => (
                  <div
                    key={i}
                    className={styles.previewBar2}
                    style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Section: Features ────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: '🔐',
    title: 'Secure by default',
    desc: 'JWT authentication, bcrypt password hashing, and rate-limited endpoints protect every account.',
  },
  {
    icon: '📊',
    title: 'Smart analytics',
    desc: 'See your peak coding hours, weekly trends, and a productivity score — all computed from your real activity.',
  },
  {
    icon: '📝',
    title: 'Developer notes',
    desc: 'Capture ideas, snippets, and decisions with a pinnable, taggable notes system built for developers.',
  },
  {
    icon: '🤖',
    title: 'AI-style insights',
    desc: 'Logic-driven insights like "You\'re most active at night" and "Activity dropped 30% this week" help you stay on track.',
  },
  {
    icon: '🔥',
    title: 'Streak tracking',
    desc: 'Build a daily activity streak. Log in and complete tasks every day to maintain your momentum.',
  },
  {
    icon: '⚡',
    title: 'Real-time session log',
    desc: 'Every login, note, and task is timestamped and stored so you always have a full audit trail.',
  },
];

function Features() {
  return (
    <section className={styles.features} id="features">
      <div className={styles.sectionWrap}>
        <p className={styles.sectionEye}>Features</p>
        <h2 className={styles.sectionTitle}>Everything a developer needs</h2>
        <p className={styles.sectionSub}>
          From authentication to analytics, DevTrace ships with every layer pre-built.
        </p>
        <div className={styles.featureGrid}>
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className={styles.featureCard}>
              <span className={styles.featureIcon}>{icon}</span>
              <h3 className={styles.featureTitle}>{title}</h3>
              <p className={styles.featureDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Section: How it works ────────────────────────────────────────────── */
const STEPS = [
  { n: '01', title: 'Create your account', desc: 'Sign up in seconds with just an email and password. No credit card required.' },
  { n: '02', title: 'Use the app naturally', desc: 'Log in daily, manage notes and tasks. Every action is automatically tracked.' },
  { n: '03', title: 'Review your insights', desc: 'Open the dashboard to see your stats, productivity score, and AI-style insights.' },
];

function HowItWorks() {
  return (
    <section className={styles.how} id="how">
      <div className={styles.sectionWrap}>
        <p className={styles.sectionEye}>How it works</p>
        <h2 className={styles.sectionTitle}>Up and running in minutes</h2>
        <div className={styles.steps}>
          {STEPS.map(({ n, title, desc }, i) => (
            <div key={n} className={styles.step}>
              <div className={styles.stepNum}>{n}</div>
              {i < STEPS.length - 1 && <div className={styles.stepLine} />}
              <div className={styles.stepBody}>
                <h3 className={styles.stepTitle}>{title}</h3>
                <p className={styles.stepDesc}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Section: Stats bar ───────────────────────────────────────────────── */
const STATS = [
  { val: '100%', label: 'Open source' },
  { val: '< 1s',  label: 'API response time' },
  { val: '0',     label: 'Third-party trackers' },
  { val: '∞',     label: 'Notes & tasks' },
];

function StatsBar() {
  return (
    <div className={styles.statsBar}>
      {STATS.map(({ val, label }) => (
        <div key={label} className={styles.statItem}>
          <span className={styles.statVal}>{val}</span>
          <span className={styles.statLabel}>{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Section: CTA ─────────────────────────────────────────────────────── */
function CTA() {
  return (
    <section className={styles.cta}>
      <div className={styles.ctaGlow} />
      <div className={styles.ctaInner}>
        <h2 className={styles.ctaTitle}>Ready to trace your dev journey?</h2>
        <p className={styles.ctaSub}>
          Join developers who use DevTrace to understand and improve their workflow.
        </p>
        <Link to="/signup" className={styles.ctaBtn}>
          Get started for free →
        </Link>
      </div>
    </section>
  );
}

/* ── Footer ───────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerBrand}>
          <span className={styles.navLogo} style={{ fontSize: '1.1rem' }}>⬡</span>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>DevTrace</span>
        </div>
        <p className={styles.footerCopy}>© {new Date().getFullYear()} DevTrace. Built for developers.</p>
      </div>
    </footer>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */
export default function Landing() {
  return (
    <div className={styles.page}>
      <LandingNav />
      <Hero />
      <StatsBar />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}
