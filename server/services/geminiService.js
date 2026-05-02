const { GoogleGenerativeAI } = require('@google/generative-ai');

let _client = null;

function getClient() {
  if (!_client) {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');
    _client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _client;
}

/**
 * Generate text from a prompt.
 * @param {string} prompt
 * @param {{ model?: string, temperature?: number, maxTokens?: number }} opts
 * @returns {Promise<string>}
 */
async function generate(prompt, opts = {}) {
  const {
    model       = 'gemini-2.0-flash',
    temperature = 0.7,
    maxTokens   = 1024,
  } = opts;

  const instance = getClient().getGenerativeModel({
    model,
    generationConfig: { temperature, maxOutputTokens: maxTokens },
  });

  const result = await instance.generateContent(prompt);
  return result.response.text();
}

/**
 * Extract a JSON array from a Gemini response that may contain markdown fences.
 * Returns null if no array can be parsed.
 */
function extractJsonArray(raw) {
  // Try raw first
  try { const v = JSON.parse(raw.trim()); if (Array.isArray(v)) return v; } catch {}
  // Strip markdown fences
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    try { const v = JSON.parse(fenced[1].trim()); if (Array.isArray(v)) return v; } catch {}
  }
  // Find first [...] block
  const bracket = raw.match(/\[[\s\S]*\]/);
  if (bracket) {
    try { const v = JSON.parse(bracket[0]); if (Array.isArray(v)) return v; } catch {}
  }
  return null;
}

module.exports = { generate, extractJsonArray };
