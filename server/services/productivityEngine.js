/**
 * ─────────────────────────────────────────────────────────────────
 *  Productivity Intelligence Engine
 *  Pure algorithmic analysis — zero external API calls.
 *
 *  Scoring model (100 pts total):
 *    Task completion rate      → 30 pts
 *    Activity consistency      → 25 pts
 *    Login streak              → 20 pts
 *    Session depth             → 15 pts
 *    High-priority task focus  → 10 pts
 *
 *  Additional signals computed:
 *    • Peak hour / period detection   (hourly frequency analysis)
 *    • Weekly momentum                (linear regression on 14-day series)
 *    • Day-of-week heatmap            (most productive weekday)
 *    • Activity consistency           (coefficient of variation)
 *    • Burnout / overwork detection   (spike analysis)
 *    • Focus session quality          (actions-per-session)
 * ─────────────────────────────────────────────────────────────────
 */

const Activity = require('../models/Activity');
const Task     = require('../models/Task');

/* ── Constants ───────────────────────────────────────────────────── */

const WEIGHTS = {
  taskCompletion:      30,
  activityConsistency: 25,
  streak:              20,
  sessionDepth:        15,
  highPriorityFocus:   10,
};

const PERIODS = {
  morning:   { hours: [6,7,8,9,10,11],    label: 'Morning',   icon: '🌅' },
  afternoon: { hours: [12,13,14,15,16,17], label: 'Afternoon', icon: '☀️' },
  evening:   { hours: [18,19,20,21],       label: 'Evening',   icon: '🌆' },
  night:     { hours: [22,23,0,1,2,3,4,5], label: 'Night',    icon: '🌙' },
};

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

/* ── Math helpers ────────────────────────────────────────────────── */

function mean(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function stdDev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

// Coefficient of variation — lower = more consistent
function coefficientOfVariation(arr) {
  const m = mean(arr);
  return m === 0 ? 1 : stdDev(arr) / m;
}

// Ordinary least squares slope — positive = trending up
function olsSlope(points) {
  const n = points.length;
  if (n < 2) return 0;
  const xBar = (n - 1) / 2;
  const yBar = mean(points);
  const num  = points.reduce((s, y, x) => s + (x - xBar) * (y - yBar), 0);
  const den  = points.reduce((s, _, x) => s + (x - xBar) ** 2, 0);
  return den === 0 ? 0 : num / den;
}

// Map a value from [inMin, inMax] to [0, outMax], clamped
function clampMap(value, inMin, inMax, outMax) {
  return Math.round(Math.min(outMax, Math.max(0, ((value - inMin) / (inMax - inMin)) * outMax)));
}

/* ── Time helpers ────────────────────────────────────────────────── */

function dayKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function daysAgo(n) {
  return new Date(Date.now() - n * 86400000);
}

function periodOf(hour) {
  for (const [key, p] of Object.entries(PERIODS)) {
    if (p.hours.includes(hour)) return key;
  }
  return 'night';
}

/* ── Session segmentation ────────────────────────────────────────── */

// Split a sorted activity list into sessions (gap > 2 hours = new session)
function segmentSessions(activities, gapMs = 2 * 3600 * 1000) {
  const sessions = [];
  let current    = [];

  for (const act of activities) {
    if (
      current.length === 0 ||
      new Date(act.timestamp) - new Date(current[current.length - 1].timestamp) < gapMs
    ) {
      current.push(act);
    } else {
      sessions.push(current);
      current = [act];
    }
  }
  if (current.length) sessions.push(current);
  return sessions;
}

/* ── Score calculators ───────────────────────────────────────────── */

function scoreTaskCompletion(tasks) {
  if (!tasks.length) return 0;
  const done  = tasks.filter(t => t.status === 'done').length;
  const total = tasks.length;
  const rate  = done / total;
  return Math.round(rate * WEIGHTS.taskCompletion);
}

function scoreConsistency(dailyCounts) {
  if (dailyCounts.length < 3) return Math.round(WEIGHTS.activityConsistency * 0.4);
  const activeDays = dailyCounts.filter(c => c > 0);
  if (!activeDays.length) return 0;

  // Penalise days with zero activity in the window
  const zeroRatio    = (dailyCounts.length - activeDays.length) / dailyCounts.length;
  const cv           = coefficientOfVariation(activeDays);
  const cvPenalty    = Math.min(1, cv);
  const zeroPenalty  = zeroRatio;

  const raw = WEIGHTS.activityConsistency * (1 - cvPenalty * 0.6 - zeroPenalty * 0.4);
  return Math.max(0, Math.round(raw));
}

function scoreStreak(streakDays) {
  // 10+ consecutive days = full marks
  return clampMap(streakDays, 0, 10, WEIGHTS.streak);
}

function scoreSessionDepth(sessions) {
  if (!sessions.length) return 0;
  const avgLen = mean(sessions.map(s => s.length));
  // 8+ actions per session = full marks
  return clampMap(avgLen, 1, 8, WEIGHTS.sessionDepth);
}

function scoreHighPriority(tasks) {
  const highTotal = tasks.filter(t => t.priority === 'high').length;
  if (!highTotal) return Math.round(WEIGHTS.highPriorityFocus * 0.5); // neutral
  const done = tasks.filter(t => t.priority === 'high' && t.status === 'done').length;
  return Math.round((done / highTotal) * WEIGHTS.highPriorityFocus);
}

/* ── Peak time detection ─────────────────────────────────────────── */

function detectPeakTime(activities) {
  const hourBuckets = Array(24).fill(0);
  const dayBuckets  = Array(7).fill(0);

  activities.forEach(a => {
    const d = new Date(a.timestamp);
    hourBuckets[d.getHours()]++;
    dayBuckets[d.getDay()]++;
  });

  const peakHour   = hourBuckets.indexOf(Math.max(...hourBuckets));
  const peakDay    = dayBuckets.indexOf(Math.max(...dayBuckets));
  const peakPeriod = periodOf(peakHour);

  // Period distribution — percentage of activity in each period
  const periodCounts = {};
  for (const [key, p] of Object.entries(PERIODS)) {
    periodCounts[key] = p.hours.reduce((s, h) => s + hourBuckets[h], 0);
  }
  const totalPeriod = Object.values(periodCounts).reduce((a, b) => a + b, 0) || 1;
  const periodDist  = {};
  for (const [k, v] of Object.entries(periodCounts)) {
    periodDist[k] = Math.round((v / totalPeriod) * 100);
  }

  return {
    peakHour,
    peakPeriod,
    peakPeriodLabel: PERIODS[peakPeriod].label,
    peakPeriodIcon:  PERIODS[peakPeriod].icon,
    peakDayName:     DAYS[peakDay],
    peakDayIndex:    peakDay,
    hourBuckets,
    dayBuckets,
    periodDistribution: periodDist,
  };
}

/* ── Momentum (14-day trend) ─────────────────────────────────────── */

function detectMomentum(activities) {
  // Build a 14-day daily count series
  const series = [];
  for (let i = 13; i >= 0; i--) {
    const key = dayKey(daysAgo(i));
    series.push(0); // will fill below
    const idx = series.length - 1;
    series[idx] = activities.filter(a => dayKey(a.timestamp) === key).length;
  }

  const slope = olsSlope(series);
  const thisWeek = series.slice(7).reduce((a, b) => a + b, 0);
  const lastWeek = series.slice(0, 7).reduce((a, b) => a + b, 0);
  const weekDelta = lastWeek === 0
    ? (thisWeek > 0 ? 100 : 0)
    : Math.round(((thisWeek - lastWeek) / lastWeek) * 100);

  let direction;
  if      (slope >  0.4) direction = 'rising';
  else if (slope < -0.4) direction = 'falling';
  else                   direction = 'stable';

  return { slope: +slope.toFixed(2), direction, weekDelta, series };
}

/* ── Burnout / overwork detection ────────────────────────────────── */

function detectBurnout(activities, sessions) {
  // Look at last 7 days
  const recent = activities.filter(a => new Date(a.timestamp) >= daysAgo(7));
  const dailyCounts = [];
  for (let i = 6; i >= 0; i--) {
    const key = dayKey(daysAgo(i));
    dailyCounts.push(recent.filter(a => dayKey(a.timestamp) === key).length);
  }

  const avg    = mean(dailyCounts);
  const maxDay = Math.max(...dailyCounts);
  const spike  = avg > 0 ? maxDay / avg : 0;

  // Long sessions (> 4 hours) count
  const longSessions = sessions.filter(s => {
    if (s.length < 2) return false;
    const dur = new Date(s[s.length - 1].timestamp) - new Date(s[0].timestamp);
    return dur > 4 * 3600000;
  }).length;

  return {
    spikeRatio:   +spike.toFixed(2),
    longSessions,
    isBurning:    spike > 3 && avg > 10,
    isOverworked: longSessions >= 3,
  };
}

/* ── Insight generator ───────────────────────────────────────────── */

function generateInsights(analysis) {
  const { peakTime, momentum, tasks, streak, score, burnout, sessions } = analysis;
  const insights = [];

  /* 1 — Peak performance window */
  if (analysis.totalActivities > 5) {
    insights.push({
      type:    'peak_time',
      icon:    peakTime.peakPeriodIcon,
      title:   'Your Peak Performance Window',
      message: `You consistently do your best work in the ${peakTime.peakPeriodLabel.toLowerCase()} — especially around ${peakTime.peakHour}:00. Schedule your most demanding tasks during this window for maximum output.`,
      priority: 10,
    });
  }

  /* 2 — Weekly momentum */
  if (momentum.direction === 'rising' && momentum.weekDelta > 10) {
    insights.push({
      type:    'trend_up',
      icon:    '📈',
      title:   'Strong Upward Momentum',
      message: `Activity is up ${momentum.weekDelta}% compared to last week. You're building a powerful work habit — maintain this pace and your productivity score will keep climbing.`,
      priority: 9,
    });
  } else if (momentum.direction === 'falling' && momentum.weekDelta < -10) {
    insights.push({
      type:    'trend_down',
      icon:    '📉',
      title:   'Activity Declining',
      message: `You logged ${Math.abs(momentum.weekDelta)}% fewer actions this week than last. Even a small daily habit — one note or one task — will reverse this trend quickly.`,
      priority: 9,
    });
  } else if (momentum.direction === 'stable') {
    insights.push({
      type:    'stable',
      icon:    '➡️',
      title:   'Consistent Pace',
      message: `Your activity has been steady over the past two weeks. Consistency is the foundation of high performance — now try to gradually increase session depth.`,
      priority: 4,
    });
  }

  /* 3 — Streak */
  if (streak >= 14) {
    insights.push({
      type:    'streak',
      icon:    '🔥',
      title:   `${streak}-Day Streak — Exceptional`,
      message: `Two weeks of consecutive daily activity. Research shows habits formed over 14+ days are significantly more likely to stick. You're in the zone.`,
      priority: 8,
    });
  } else if (streak >= 7) {
    insights.push({
      type:    'streak',
      icon:    '🔥',
      title:   `${streak}-Day Streak`,
      message: `A full week of daily activity. You're building real momentum. Keep showing up daily to push the streak — and your productivity score — higher.`,
      priority: 7,
    });
  } else if (streak === 0) {
    insights.push({
      type:    'streak',
      icon:    '⚡',
      title:   'Start Your Streak Today',
      message: `Daily consistency beats intensity. Log in and complete one task every day — even weekends. Your streak counter starts today.`,
      priority: 5,
    });
  }

  /* 4 — High priority tasks */
  const pendingHigh = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
  const doneHigh    = tasks.filter(t => t.priority === 'high' && t.status === 'done').length;
  if (pendingHigh > 0) {
    insights.push({
      type:    'high_priority',
      icon:    '🎯',
      title:   `${pendingHigh} High-Priority Task${pendingHigh > 1 ? 's' : ''} Waiting`,
      message: `Your high-priority queue has ${pendingHigh} open item${pendingHigh > 1 ? 's' : ''}. Tackle the hardest one first — during your ${peakTime.peakPeriodLabel.toLowerCase()} peak window if possible.`,
      priority: 8,
    });
  } else if (doneHigh >= 3) {
    insights.push({
      type:    'task_champion',
      icon:    '🏆',
      title:   'High-Priority Champion',
      message: `You've cleared ${doneHigh} high-priority tasks. That level of focus on what matters most is what separates productive developers from busy ones.`,
      priority: 6,
    });
  }

  /* 5 — Productivity score band */
  if (score >= 80) {
    insights.push({
      type:    'score_high',
      icon:    '🚀',
      title:   `Elite Productivity — ${score}/100`,
      message: `Top-tier score. You're completing tasks, staying consistent, and building streak momentum. Share your workflow — others could learn from it.`,
      priority: 7,
    });
  } else if (score >= 50) {
    insights.push({
      type:    'score_mid',
      icon:    '💡',
      title:   `Solid Foundation — ${score}/100`,
      message: `Good score with room to grow. Your quickest wins: clear the high-priority backlog (+10 pts) and log in daily for 7 days straight (+20 pts).`,
      priority: 5,
    });
  } else {
    insights.push({
      type:    'score_low',
      icon:    '🌱',
      title:   `Building Phase — ${score}/100`,
      message: `Every expert was once a beginner. Create one task, complete it, and come back tomorrow. Those three actions alone will add ~15 points to your score.`,
      priority: 5,
    });
  }

  /* 6 — Session depth */
  const avgActions = sessions.length ? mean(sessions.map(s => s.length)) : 0;
  if (avgActions >= 8) {
    insights.push({
      type:    'deep_focus',
      icon:    '🧠',
      title:   'Deep Focus Sessions',
      message: `Your average session contains ${Math.round(avgActions)} actions — well above average. You're getting into deep work states, which is where real productivity lives.`,
      priority: 6,
    });
  } else if (avgActions > 0 && avgActions < 3) {
    insights.push({
      type:    'shallow_sessions',
      icon:    '⏱️',
      title:   'Increase Session Depth',
      message: `Sessions average only ${avgActions.toFixed(1)} actions. Try the "minimum 5" rule: before closing DevTrace, complete at least 5 actions each visit.`,
      priority: 4,
    });
  }

  /* 7 — Burnout warning */
  if (burnout.isBurning) {
    insights.push({
      type:    'burnout',
      icon:    '⚠️',
      title:   'Spike Detected — Watch for Burnout',
      message: `One day this week had 3× your normal activity. High-intensity spikes followed by crashes are a burnout pattern. Aim for steady daily output instead.`,
      priority: 9,
    });
  }

  /* 8 — Best day of week */
  if (analysis.totalActivities > 14) {
    insights.push({
      type:    'best_day',
      icon:    '📅',
      title:   `${peakTime.peakDayName} Is Your Power Day`,
      message: `Your data shows ${peakTime.peakDayName} consistently has your highest activity. Protect that day — block distractions and schedule creative or complex work then.`,
      priority: 4,
    });
  }

  /* 9 — New user */
  if (analysis.totalActivities < 5) {
    insights.push({
      type:    'new_user',
      icon:    '🚀',
      title:   'Welcome — Your Journey Starts Here',
      message: `DevTrace needs at least a week of data to generate personalised insights. Log in daily, create tasks, and write notes. The engine will learn your patterns.`,
      priority: 10,
    });
  }

  // Sort by priority desc, return top 5
  return insights
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5)
    .map(({ priority, ...rest }) => rest); // strip internal priority field
}

/* ── Score label ─────────────────────────────────────────────────── */

function scoreLabel(score) {
  if (score >= 85) return { grade: 'A+', label: 'Elite',       color: '#10b981' };
  if (score >= 70) return { grade: 'A',  label: 'High',        color: '#6366f1' };
  if (score >= 55) return { grade: 'B',  label: 'Solid',       color: '#22d3ee' };
  if (score >= 40) return { grade: 'C',  label: 'Building',    color: '#f59e0b' };
  return              { grade: 'D',  label: 'Getting Started', color: '#ef4444' };
}

/* ── AI insight generator (Gemini) ──────────────────────────────── */

async function generateAIInsights(analysis) {
  const { peakTime, momentum, tasks, streak, score, burnout, totalActivities } = analysis;

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const pendingHigh    = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
  const pd             = peakTime.periodDistribution || {};

  const prompt = `You are an AI productivity coach inside DevTrace, a developer productivity tracker.
Generate exactly 5 personalised, data-driven insights for this developer.

REAL USER DATA:
- Productivity Score: ${score}/100
- Daily Login Streak: ${streak} days
- Peak Work Period: ${peakTime.peakPeriodLabel} (around ${peakTime.peakHour}:00)
- Most Productive Day: ${peakTime.peakDayName}
- 14-Day Trend: ${momentum.direction} (${momentum.weekDelta > 0 ? '+' : ''}${momentum.weekDelta}% vs last week)
- Total Activities Logged: ${totalActivities}
- Tasks Completed: ${completedTasks} of ${tasks.length}
- High-Priority Tasks Pending: ${pendingHigh}
- Burnout Signal: ${burnout.isBurning ? 'YES — activity spike detected' : 'None'}
- Long Sessions (4 h+): ${burnout.longSessions}
- Period Split: Morning ${pd.morning || 0}%, Afternoon ${pd.afternoon || 0}%, Evening ${pd.evening || 0}%, Night ${pd.night || 0}%

Return ONLY a valid JSON array — no markdown, no explanation.
Each of the 5 objects must have exactly these keys:
  "type"    — one of: peak_time | trend_up | trend_down | stable | streak | high_priority | task_champion | score_high | score_mid | score_low | deep_focus | shallow_sessions | burnout | best_day | new_user
  "icon"    — one relevant emoji
  "title"   — ≤ 8 words
  "message" — 2-3 sentences, reference the actual numbers, be actionable`;

  try {
    const { generate, extractJsonArray } = require('./geminiService');
    const raw      = await generate(prompt, { temperature: 0.75, maxTokens: 1200 });
    const insights = extractJsonArray(raw);

    if (!insights || insights.length === 0) throw new Error('Empty insights from Gemini');

    return insights
      .slice(0, 5)
      .map(({ priority, ...rest }) => rest);
  } catch (err) {
    console.warn('[ProductivityEngine] Gemini insights failed — using rule-based fallback:', err.message);
    return generateInsights(analysis);
  }
}

/* ── Main export ─────────────────────────────────────────────────── */

async function runProductivityEngine(userId, user) {
  // ── Fetch all data in parallel ──────────────────────────────────
  const [allActivities, tasks] = await Promise.all([
    Activity.find({ userId }).sort({ timestamp: 1 }).lean(),
    Task.find({ userId }).lean(),
  ]);

  const last30 = allActivities.filter(a => new Date(a.timestamp) >= daysAgo(30));
  const last14 = allActivities.filter(a => new Date(a.timestamp) >= daysAgo(14));
  const last7  = allActivities.filter(a => new Date(a.timestamp) >= daysAgo(7));

  // ── Daily counts (30-day window for consistency) ────────────────
  const dailyCounts30 = [];
  for (let i = 29; i >= 0; i--) {
    const key = dayKey(daysAgo(i));
    dailyCounts30.push(last30.filter(a => dayKey(a.timestamp) === key).length);
  }

  // ── Session segmentation ────────────────────────────────────────
  const sessions = segmentSessions(allActivities);

  // ── Individual scores ───────────────────────────────────────────
  const taskScore        = scoreTaskCompletion(tasks);
  const consistencyScore = scoreConsistency(dailyCounts30);
  const streakScore      = scoreStreak(user.streakDays || 0);
  const depthScore       = scoreSessionDepth(sessions);
  const highPrioScore    = scoreHighPriority(tasks);

  const totalScore = Math.min(
    100,
    taskScore + consistencyScore + streakScore + depthScore + highPrioScore
  );

  // ── Signal detection ────────────────────────────────────────────
  const peakTime = detectPeakTime(allActivities);
  const momentum = detectMomentum(allActivities);
  const burnout  = detectBurnout(last7, sessions);

  // ── Breakdown for radar/detail view ────────────────────────────
  const scoreBreakdown = {
    taskCompletion:      { score: taskScore,        max: WEIGHTS.taskCompletion,      label: 'Task Completion'    },
    activityConsistency: { score: consistencyScore,  max: WEIGHTS.activityConsistency, label: 'Consistency'        },
    streak:              { score: streakScore,        max: WEIGHTS.streak,              label: 'Daily Streak'       },
    sessionDepth:        { score: depthScore,         max: WEIGHTS.sessionDepth,        label: 'Session Depth'      },
    highPriorityFocus:   { score: highPrioScore,      max: WEIGHTS.highPriorityFocus,   label: 'High-Priority Focus'},
  };

  // ── Build analysis object for insight generator ─────────────────
  const analysis = {
    totalActivities: allActivities.length,
    score:           totalScore,
    streak:          user.streakDays || 0,
    peakTime,
    momentum,
    burnout,
    sessions,
    tasks,
  };

  // ── Insights (Gemini AI with rule-based fallback) ────────────────
  const insights = await generateAIInsights(analysis);

  // ── Stats for dashboard cards ───────────────────────────────────
  const stats = {
    totalSessions:      user.totalSessions || 0,
    streak:             user.streakDays    || 0,
    productivity:       totalScore,
    grade:              scoreLabel(totalScore),
    mostActiveHour:     allActivities.length > 3 ? peakTime.peakHour : null,
    mostActivePeriod:   allActivities.length > 3 ? peakTime.peakPeriod : null,
    peakDayName:        peakTime.peakDayName,
    weeklyTrend:        { direction: momentum.direction, pct: Math.abs(momentum.weekDelta) },
    totalTasks:         tasks.length,
    completedTasks:     tasks.filter(t => t.status === 'done').length,
    scoreBreakdown,
    periodDistribution: peakTime.periodDistribution,
    momentum14d:        momentum.series,
    burnout,
  };

  return { stats, insights };
}

module.exports = { runProductivityEngine, scoreLabel };
