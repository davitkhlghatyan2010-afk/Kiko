// Generates the follow-up verification question asked after a task summary
// is submitted. Uses Google's Gemini API when GOOGLE_API_KEY is set; falls
// back to a templated question (the original stub, before any provider was
// configured) if the key is missing or the call fails, so a flaky external
// API never blocks someone from finishing a task.

const TEMPLATES = [
  (summary) => `What was the trickiest part of "${truncate(summary)}"?`,
  (summary) => `What would you do differently next time on "${truncate(summary)}"?`,
  (summary) => `What's one detail about "${truncate(summary)}" you didn't mention?`,
  (summary) => `How do you know "${truncate(summary)}" is actually done?`,
];

function truncate(text, max = 60) {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max)}...` : trimmed;
}

function templatedQuestion(summary) {
  const template = TEMPLATES[summary.length % TEMPLATES.length];
  return template(summary);
}

const MODEL = process.env.GOOGLE_AI_MODEL || "gemini-3.6-flash";

const PROMPT_PREFIX =
  "A user just finished a task and wrote this summary of what they did: ";
const PROMPT_SUFFIX =
  "\n\nWrite exactly one short, specific follow-up question that would be hard to answer " +
  "convincingly if the summary were fabricated. Ask about a concrete detail, not something " +
  "generic. Reply with only the question itself -- no preamble, no quotation marks, no extra commentary.";

export async function generateFollowUpQuestion(summary) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return templatedQuestion(summary);
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${PROMPT_PREFIX}"${summary.trim()}"${PROMPT_SUFFIX}` }] }],
        }),
      },
    );

    if (!res.ok) {
      throw new Error(`Gemini API returned ${res.status}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      throw new Error("Gemini API returned no question text");
    }
    return text;
  } catch (err) {
    console.error("[llm] Gemini call failed, falling back to templated question:", err.message);
    return templatedQuestion(summary);
  }
}
