// STUB: no LLM provider is configured yet (pilot decision -- see docs/phases).
// Returns one templated follow-up question grounded in the user's summary.
// The function is async so a real API call (e.g. the Anthropic Claude API)
// can replace the body later without changing any call site.

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

export async function generateFollowUpQuestion(summary) {
  const template = TEMPLATES[summary.length % TEMPLATES.length];
  return template(summary);
}
