// ── Framing language (Phase 1 A/B testable via env) ──────────────────────────
export const framing = {
  colleagueNotes: import.meta.env.VITE_FRAMING_COLLEAGUE_NOTES || 'Personal Observations',
  userInsights:   import.meta.env.VITE_FRAMING_USER_INSIGHTS   || 'Patterns',
  improvements:  import.meta.env.VITE_FRAMING_IMPROVEMENTS     || 'Growth Edges',
}

// ── Insight display format (Phase 1 testable) ─────────────────────────────────
// Values: 'three-layer' | 'insight-only' | 'suggestion-only'
export const insightFormat = import.meta.env.VITE_INSIGHT_FORMAT || 'three-layer'

// ── Free-tier limits (Phase 1 will tune these; never hard-code below) ─────────
export const freeTierConfig = {
  maxColleagues:         parseInt(import.meta.env.VITE_FREE_COLLEAGUES    || '5'),
  maxInteractionsPerDay: parseInt(import.meta.env.VITE_FREE_INTERACTIONS  || '50'),
  maxInsightsPerDay:     parseInt(import.meta.env.VITE_FREE_INSIGHTS      || '5'),
  maxHistoryDays:        parseInt(import.meta.env.VITE_FREE_HISTORY_DAYS  || '7'),
}

// ── System prompt version (multiple prompt files in /prompts/) ─────────────────
export const sonnetPromptVersion = import.meta.env.VITE_SONNET_PROMPT_VERSION || 'v1_empowering'

// ── HITL confidence threshold (configurable) ──────────────────────────────────
export const hitlThreshold = parseFloat(import.meta.env.VITE_HITL_THRESHOLD || '0.7')

// ── Daily ritual defaults (stored in user settings; these are fallbacks) ──────
export const ritualDefaults = {
  morningPromptTime:      '08:00',
  eveningReflectionTime:  '17:00',
  digestDay:              'Sunday',
  digestTime:             '19:00',
}
