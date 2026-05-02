const Activity = require('../models/Activity');
const Task = require('../models/Task');

const HOUR_LABELS = {
  morning: [6, 7, 8, 9, 10, 11],
  afternoon: [12, 13, 14, 15, 16, 17],
  evening: [18, 19, 20, 21],
  night: [22, 23, 0, 1, 2, 3, 4, 5],
};

function classifyHour(hour) {
  for (const [period, hours] of Object.entries(HOUR_LABELS)) {
    if (hours.includes(hour)) return period;
  }
  return 'night';
}

function getMostActiveHour(activities) {
  const counts = {};
  activities.forEach((a) => {
    const h = new Date(a.timestamp).getHours();
    counts[h] = (counts[h] || 0) + 1;
  });
  if (!Object.keys(counts).length) return null;
  return parseInt(Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]);
}

function calcStreak(activities, user) {
  return user.streakDays || 0;
}

function calcProductivityScore(tasks, activities, streakDays) {
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const total = tasks.length || 1;
  const completionRate = doneTasks / total;
  const highPriority = tasks.filter((t) => t.priority === 'high' && t.status === 'done').length;
  const activityBonus = Math.min(activities.length / 50, 1);
  const streakBonus = Math.min(streakDays / 30, 1);
  const score = Math.round((completionRate * 50 + highPriority * 5 + activityBonus * 25 + streakBonus * 20));
  return Math.min(score, 100);
}

function getWeeklyTrend(activities) {
  const now = Date.now();
  const msWeek = 7 * 24 * 60 * 60 * 1000;
  const thisWeek = activities.filter((a) => now - new Date(a.timestamp).getTime() < msWeek).length;
  const lastWeek = activities.filter((a) => {
    const age = now - new Date(a.timestamp).getTime();
    return age >= msWeek && age < 2 * msWeek;
  }).length;
  if (lastWeek === 0) return { direction: 'new', pct: 100 };
  const pct = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  return { direction: pct >= 0 ? 'up' : 'down', pct: Math.abs(pct) };
}

async function generateInsights(userId, user) {
  const [allActivities, recentActivities, tasks] = await Promise.all([
    Activity.find({ userId }).sort({ timestamp: -1 }).limit(500).lean(),
    Activity.find({ userId, timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }).lean(),
    Task.find({ userId }).lean(),
  ]);

  const mostActiveHour = getMostActiveHour(allActivities);
  const period = mostActiveHour !== null ? classifyHour(mostActiveHour) : null;
  const trend = getWeeklyTrend(allActivities);
  const streak = calcStreak(allActivities, user);
  const productivity = calcProductivityScore(tasks, allActivities, streak);

  const insights = [];

  if (period) {
    insights.push({
      type: 'peak_time',
      icon: period === 'night' ? '🌙' : period === 'morning' ? '🌅' : period === 'evening' ? '🌆' : '☀️',
      title: 'Peak Activity Time',
      message: `You are most active in the ${period} (around ${mostActiveHour}:00).`,
    });
  }

  if (trend.direction === 'down' && trend.pct > 10) {
    insights.push({
      type: 'trend_down',
      icon: '📉',
      title: 'Activity Drop Detected',
      message: `Your activity dropped ${trend.pct}% compared to last week. Time to get back on track!`,
    });
  } else if (trend.direction === 'up' && trend.pct > 10) {
    insights.push({
      type: 'trend_up',
      icon: '📈',
      title: 'On a Roll!',
      message: `Activity up ${trend.pct}% this week versus last week. Keep the momentum!`,
    });
  } else if (trend.direction === 'new') {
    insights.push({
      type: 'new_user',
      icon: '🚀',
      title: 'Just Getting Started',
      message: 'Welcome! Build your streak by logging in and completing tasks daily.',
    });
  }

  if (streak >= 7) {
    insights.push({
      type: 'streak',
      icon: '🔥',
      title: `${streak}-Day Streak!`,
      message: `Impressive! You have been active for ${streak} consecutive days.`,
    });
  }

  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const pendingHigh = tasks.filter((t) => t.priority === 'high' && t.status !== 'done').length;
  if (pendingHigh > 0) {
    insights.push({
      type: 'high_priority',
      icon: '⚡',
      title: 'High Priority Tasks Pending',
      message: `You have ${pendingHigh} high-priority task${pendingHigh > 1 ? 's' : ''} waiting. Focus on those first.`,
    });
  }

  if (doneTasks > 0 && doneTasks >= tasks.length * 0.8) {
    insights.push({
      type: 'task_champion',
      icon: '🏆',
      title: 'Task Champion',
      message: `You have completed ${doneTasks} out of ${tasks.length} tasks. Outstanding work!`,
    });
  }

  const activityLast30Days = allActivities.filter(
    (a) => Date.now() - new Date(a.timestamp).getTime() < 30 * 24 * 60 * 60 * 1000
  ).length;
  if (activityLast30Days < 5 && allActivities.length > 0) {
    insights.push({
      type: 'low_activity',
      icon: '😴',
      title: 'Low Activity Recently',
      message: 'You have been quiet lately. Try completing a few tasks to boost your productivity score.',
    });
  }

  return {
    insights: insights.slice(0, 4),
    stats: {
      totalSessions: user.totalSessions,
      streak,
      productivity,
      mostActiveHour,
      mostActivePeriod: period,
      weeklyTrend: trend,
      totalTasks: tasks.length,
      completedTasks: doneTasks,
    },
  };
}

module.exports = { generateInsights };
