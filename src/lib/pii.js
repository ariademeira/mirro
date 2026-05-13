// PII masking before content reaches Sonnet.
// Removes: emails, phone numbers, and proper-name patterns from raw text.
// Names substituted with [PERSON_N] tokens for audit traceability.

const EMAIL_RE    = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g
const PHONE_RE    = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/g
// Simple heuristic: Title-cased word sequences (2-3 words) that look like names
const NAME_RE     = /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2})\b/g

export function maskPII(text) {
  if (!text) return ''
  let counter = 1
  const nameMap = {}

  return text
    .replace(EMAIL_RE, '[EMAIL]')
    .replace(PHONE_RE, '[PHONE]')
    .replace(NAME_RE, (match) => {
      if (!(match in nameMap)) {
        nameMap[match] = `[PERSON_${counter++}]`
      }
      return nameMap[match]
    })
}

export function hasPII(text) {
  return EMAIL_RE.test(text) || PHONE_RE.test(text)
}
