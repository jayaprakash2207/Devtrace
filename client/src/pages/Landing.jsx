import { Link } from 'react-router-dom';
import styles from './Landing.module.css';

/* ── Nav ──────────────────────────────────────────────────────────────── */
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
          <a href="#ai">AI Assistant</a>
          <a href="#how">How it works</a>
          <a href="#stack">Tech stack</a>
        </div>
        <div className={styles.navCta}>
          <Link to="/login"  className={styles.navLogin}>Sign in</Link>
          <Link to="/signup" className={styles.navSignup}>Get started free</Link>
        </div>
      </div>
    </header>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroGlow} />
      <div className={styles.heroContent}>

        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          Powered by Google Gemini AI · Full-stack · Open source
        </div>

        <h1 className={styles.heroTitle}>
          The developer productivity
          <br />
          <span className="gradient-text">tracker that thinks.</span>
        </h1>

        <p className={styles.heroSub}>
          DevTrace logs every session, scores your productivity in real time, and surfaces
          AI-generated insights through a Gemini-powered chat assistant — so you always know
          exactly where your focus goes.
        </p>

        <div className={styles.heroBtns}>
          <Link to="/signup" className={styles.heroPrimary}>
            Start for free →
          </Link>
          <a href="#ai" className={styles.heroSecondary}>
            See the AI assistant
          </a>
        </div>

        {/* Mock dashboard */}
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
                { icon: '🔥', label: 'Streak',   val: '14 days' },
                { icon: '⚡', label: 'Score',    val: '91 / 100' },
                { icon: '🖥️', label: 'Sessions', val: '103' },
                { icon: '✅', label: 'Tasks',    val: '38 / 42' },
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
                {[40, 60, 45, 85, 70, 95, 75].map((h, i) => (
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

/* ── Stats bar ────────────────────────────────────────────────────────── */
const STATS = [
  { val: 'Gemini',  label: 'AI engine' },
  { val: 'JWT',     label: 'Auth method' },
  { val: 'MongoDB', label: 'Database' },
  { val: '100%',    label: 'Free to use' },
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

/* ── Features ─────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: '🤖',
    title: 'Gemini AI chat assistant',
    desc: 'Ask anything about your productivity. The AI reads your live stats — score, streak, peak hours — and gives you personalised advice powered by Gemini 1.5 Flash.',
  },
  {
    icon: '📊',
    title: 'Real-time productivity score',
    desc: 'A 0–100 score updated every visit, backed by OLS trend analysis, coefficient of variation, burnout spike detection, and time-of-day segmentation.',
  },
  {
    icon: '🔥',
    title: 'Streak & session tracking',
    desc: 'Every login extends your streak. Miss a day and it resets. Total sessions, last-active date, and momentum badges keep you accountable.',
  },
  {
    icon: '✅',
    title: 'Smart task management',
    desc: 'Create, prioritise, and track tasks with due dates, labels, and completion status. All tasks feed into your productivity score.',
  },
  {
    icon: '📝',
    title: 'Developer notes',
    desc: 'Pinnable, taggable notes with full-text search. Capture decisions, snippets, and ideas without leaving your workflow.',
  },
  {
    icon: '🔐',
    title: 'Secure multi-provider auth',
    desc: 'Email/password with bcrypt, plus one-click OAuth via Google and GitHub. JWT-protected API, rate-limited endpoints, and Helmet security headers.',
  },
];

function Features() {
  return (
    <section className={styles.features} id="features">
      <div className={styles.sectionWrap}>
        <p className={styles.sectionEye}>Features</p>
        <h2 className={styles.sectionTitle}>Built for serious developers</h2>
        <p className={styles.sectionSub}>
          Every feature earns its place. No filler, no fluff — just the tools that help you
          understand and improve your workflow.
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

/* ── AI Section ───────────────────────────────────────────────────────── */
function AISection() {
  return (
    <section className={styles.aiSection} id="ai">
      <div className={styles.aiInner}>
        <div className={styles.aiText}>
          <p className={styles.sectionEye} style={{ textAlign: 'left', marginBottom: 12 }}>AI Assistant</p>
          <h2 className={styles.aiTitle}>
            Your personal productivity coach,{' '}
            <span className="gradient-text">powered by Gemini</span>
          </h2>
          <p className={styles.aiSub}>
            The built-in chat panel connects directly to Google Gemini 1.5 Flash and
            feeds it your live stats. Ask "why is my score dropping?" or "what should I
            focus on this week?" and get answers grounded in your actual data.
          </p>
          <ul className={styles.aiPoints}>
            {[
              'Reads your score, streak, peak hours, and task completion live',
              'Maintains conversation history for contextual follow-ups',
              'Falls back to rule-based insights if offline or rate-limited',
              'Rate-limited at 40 requests / 15 min to keep it fair',
            ].map((p) => (
              <li key={p} className={styles.aiPoint}>
                <span className={styles.aiCheck}>✓</span>
                {p}
              </li>
            ))}
          </ul>
          <Link to="/signup" className={styles.aiCta}>
            Try the AI assistant →
          </Link>
        </div>

        <div className={styles.chatDemo}>
          <div className={styles.chatDemoHeader}>
            <span className={styles.chatDemoIcon}>🤖</span>
            <span className={styles.chatDemoName}>DevTrace AI</span>
            <span className={styles.chatDemoOnline} />
          </div>
          <div className={styles.chatDemoBody}>
            {[
              { role: 'user',  text: 'Why did my score drop this week?' },
              { role: 'ai',    text: "Your score fell from 87 → 72 — mainly because your activity dropped 35% on Wednesday and Thursday, pushing the 7-day trend negative. Your peak hours are still 8–11 PM but you only logged sessions on 4 of 7 days. Try to close at least one task each evening to reverse the trend." },
              { role: 'user',  text: 'What time of day am I most productive?' },
              { role: 'ai',    text: '48% of your sessions happen in the Evening (6 PM–midnight). You finish more tasks and log longer sessions then vs. mornings. I\'d suggest scheduling your hardest tasks for 8–10 PM.' },
            ].map((m, i) => (
              <div
                key={i}
                className={`${styles.chatBubble} ${m.role === 'user' ? styles.chatUser : styles.chatAi}`}
              >
                {m.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── How it works ─────────────────────────────────────────────────────── */
const STEPS = [
  { n: '01', title: 'Create your account', desc: 'Sign up with email, or one click with Google or GitHub. Your account is ready in seconds.' },
  { n: '02', title: 'Use the app naturally', desc: 'Log in daily, create tasks, write notes. Every action is automatically tracked and timestamped.' },
  { n: '03', title: 'Check your dashboard', desc: 'Your productivity score, streak, and AI insights update in real time every time you open the app.' },
  { n: '04', title: 'Chat with your AI coach', desc: 'Open the chat panel to ask Gemini anything about your stats and get data-grounded advice.' },
];

function HowItWorks() {
  return (
    <section className={styles.how} id="how">
      <div className={styles.sectionWrap}>
        <p className={styles.sectionEye}>How it works</p>
        <h2 className={styles.sectionTitle}>Up and running in 30 seconds</h2>
        <p className={styles.sectionSub}>No configuration, no integrations to set up.</p>
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

/* ── Tech Stack ───────────────────────────────────────────────────────── */
const STACK = [
  { label: 'React 18',       color: '#61dafb' },
  { label: 'Vite',           color: '#a78bfa' },
  { label: 'Node.js',        color: '#68a063' },
  { label: 'Express',        color: '#999' },
  { label: 'MongoDB',        color: '#47a248' },
  { label: 'Mongoose',       color: '#880000' },
  { label: 'JWT',            color: '#f59e0b' },
  { label: 'Passport.js',    color: '#34beef' },
  { label: 'Gemini 1.5',     color: '#4285f4' },
  { label: 'bcrypt',         color: '#a78bfa' },
  { label: 'CSS Modules',    color: '#6366f1' },
  { label: 'Netlify',        color: '#00c7b7' },
];

function TechStack() {
  return (
    <section className={styles.stackSection} id="stack">
      <div className={styles.sectionWrap}>
        <p className={styles.sectionEye}>Tech stack</p>
        <h2 className={styles.sectionTitle}>Built with production-grade tools</h2>
        <p className={styles.sectionSub}>
          Every layer of the stack was chosen for correctness, security, and scalability.
        </p>
        <div className={styles.stackGrid}>
          {STACK.map(({ label, color }) => (
            <div key={label} className={styles.stackPill} style={{ '--pill-color': color }}>
              <span className={styles.stackDot} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA ──────────────────────────────────────────────────────────────── */
function CTA() {
  return (
    <section className={styles.cta}>
      <div className={styles.ctaGlow} />
      <div className={styles.ctaInner}>
        <h2 className={styles.ctaTitle}>Ready to understand your dev workflow?</h2>
        <p className={styles.ctaSub}>
          Create your free account in seconds. No credit card. No setup. Just insights.
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
        <p className={styles.footerCopy}>
          © {new Date().getFullYear()} DevTrace · Full-stack developer productivity tracker · Built with React, Node.js & Gemini AI
        </p>
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
      <AISection />
      <HowItWorks />
      <TechStack />
      <CTA />
      <Footer />
    </div>
  );
}
