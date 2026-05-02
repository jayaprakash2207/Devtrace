const { runProductivityEngine } = require('../services/productivityEngine');
const { generate }              = require('../services/geminiService');

/**
 * POST /api/chat
 * Body: { message: string, history: [{ role: 'user'|'ai', content: string }] }
 *
 * Fetches the user's live productivity stats, injects them as context,
 * and streams a Gemini response back.
 */
exports.chat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Fetch live stats for context — reuse the same engine the dashboard uses
    const { stats } = await runProductivityEngine(req.user._id, req.user);

    const bd = Object.values(stats.scoreBreakdown || {})
      .map(f => `  • ${f.label}: ${f.score}/${f.max}`)
      .join('\n');

    const systemContext = `You are DevTrace AI, a personal productivity coach built into a developer productivity tracker called DevTrace.
You have access to this developer's live data pulled right now:

📊 PRODUCTIVITY SNAPSHOT
  • Score: ${stats.productivity}/100  (${stats.grade?.grade} — ${stats.grade?.label})
  • Daily streak: ${stats.streak} days
  • Total sessions: ${stats.totalSessions}
  • Peak work period: ${stats.mostActivePeriod || 'unknown'} (around ${stats.mostActiveHour ?? '?'}:00)
  • Best day of week: ${stats.peakDayName || 'unknown'}
  • 14-day trend: ${stats.weeklyTrend?.direction || 'stable'} (${stats.weeklyTrend?.pct || 0}% vs last week)
  • Tasks completed: ${stats.completedTasks} / ${stats.totalTasks}
  • Notes saved: ${stats.totalNotes || 0}
  • Burnout risk: ${stats.burnout?.isBurning ? '⚠ HIGH — activity spike detected' : 'Low'}

📈 SCORE BREAKDOWN
${bd}

RULES:
- Keep every reply to 2–4 sentences max
- Always reference the real numbers above when relevant — never invent data
- Be encouraging, specific, and actionable
- If asked something unrelated to productivity or software development, politely redirect to their data
- Do NOT repeat the stats back verbatim unless the user asks`;

    // Build conversation string from recent history (last 8 turns)
    const recentHistory = history
      .slice(-8)
      .map(m => `${m.role === 'user' ? 'Developer' : 'DevTrace AI'}: ${m.content}`)
      .join('\n');

    const fullPrompt = `${systemContext}

${recentHistory ? `CONVERSATION SO FAR:\n${recentHistory}\n` : ''}Developer: ${message.trim()}
DevTrace AI:`;

    const reply = await generate(fullPrompt, { temperature: 0.7, maxTokens: 512 });

    res.json({ success: true, reply: reply.trim() });
  } catch (err) {
    next(err);
  }
};
