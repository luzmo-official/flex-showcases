export interface MatchInfo {
  /** ISO 8601 UTC date-time string */
  utc: string
  stadium: string
  city: string
  /** Nearest major city when the venue is in a suburb */
  majorCity: string
  /** IANA timezone of the venue */
  tz: string
}

/**
 * Official FIFA schedule for all 2026 World Cup knockout stage matches.
 * Times are stored as UTC; the UI converts to the browser's local timezone.
 * Keyed by our internal bracket match ID.
 */
export const MATCH_SCHEDULE: Record<number, MatchInfo> = {
  // ─── Round of 32 ────────────────────────────────────────────────────
  73:  { utc: '2026-06-28T19:00:00Z', stadium: 'SoFi Stadium',            city: 'Inglewood',       majorCity: 'Los Angeles',  tz: 'America/Los_Angeles' },
  74:  { utc: '2026-06-29T20:30:00Z', stadium: 'Gillette Stadium',        city: 'Foxborough',      majorCity: 'Boston',       tz: 'America/New_York' },
  75:  { utc: '2026-06-30T01:00:00Z', stadium: 'Estadio BBVA',            city: 'Guadalupe',       majorCity: 'Monterrey',    tz: 'America/Monterrey' },
  76:  { utc: '2026-06-29T17:00:00Z', stadium: 'NRG Stadium',             city: 'Houston',         majorCity: 'Houston',      tz: 'America/Chicago' },
  77:  { utc: '2026-06-30T21:00:00Z', stadium: 'MetLife Stadium',         city: 'East Rutherford', majorCity: 'New York',     tz: 'America/New_York' },
  78:  { utc: '2026-06-30T17:00:00Z', stadium: 'AT&T Stadium',            city: 'Arlington',       majorCity: 'Dallas',       tz: 'America/Chicago' },
  79:  { utc: '2026-07-01T01:00:00Z', stadium: 'Estadio Azteca',          city: 'Mexico City',     majorCity: 'Mexico City',  tz: 'America/Mexico_City' },
  80:  { utc: '2026-07-01T16:00:00Z', stadium: 'Mercedes-Benz Stadium',   city: 'Atlanta',         majorCity: 'Atlanta',      tz: 'America/New_York' },
  81:  { utc: '2026-07-02T00:00:00Z', stadium: "Levi's Stadium",          city: 'Santa Clara',     majorCity: 'San Francisco', tz: 'America/Los_Angeles' },
  82:  { utc: '2026-07-01T20:00:00Z', stadium: 'Lumen Field',             city: 'Seattle',         majorCity: 'Seattle',      tz: 'America/Los_Angeles' },
  83:  { utc: '2026-07-02T23:00:00Z', stadium: 'BMO Field',               city: 'Toronto',         majorCity: 'Toronto',      tz: 'America/Toronto' },
  84:  { utc: '2026-07-02T19:00:00Z', stadium: 'SoFi Stadium',            city: 'Inglewood',       majorCity: 'Los Angeles',  tz: 'America/Los_Angeles' },
  85:  { utc: '2026-07-03T03:00:00Z', stadium: 'BC Place',                city: 'Vancouver',       majorCity: 'Vancouver',    tz: 'America/Vancouver' },
  86:  { utc: '2026-07-03T22:00:00Z', stadium: 'Hard Rock Stadium',       city: 'Miami Gardens',   majorCity: 'Miami',        tz: 'America/New_York' },
  87:  { utc: '2026-07-04T01:30:00Z', stadium: 'Arrowhead Stadium',       city: 'Kansas City',     majorCity: 'Kansas City',  tz: 'America/Chicago' },
  88:  { utc: '2026-07-03T18:00:00Z', stadium: 'AT&T Stadium',            city: 'Arlington',       majorCity: 'Dallas',       tz: 'America/Chicago' },

  // ─── Round of 16 ────────────────────────────────────────────────────
  89:  { utc: '2026-07-04T21:00:00Z', stadium: 'Lincoln Financial Field', city: 'Philadelphia',    majorCity: 'Philadelphia', tz: 'America/New_York' },
  90:  { utc: '2026-07-04T17:00:00Z', stadium: 'NRG Stadium',             city: 'Houston',         majorCity: 'Houston',      tz: 'America/Chicago' },
  91:  { utc: '2026-07-05T20:00:00Z', stadium: 'MetLife Stadium',         city: 'East Rutherford', majorCity: 'New York',     tz: 'America/New_York' },
  92:  { utc: '2026-07-06T00:00:00Z', stadium: 'Estadio Azteca',          city: 'Mexico City',     majorCity: 'Mexico City',  tz: 'America/Mexico_City' },
  93:  { utc: '2026-07-06T19:00:00Z', stadium: 'AT&T Stadium',            city: 'Arlington',       majorCity: 'Dallas',       tz: 'America/Chicago' },
  94:  { utc: '2026-07-07T00:00:00Z', stadium: 'Lumen Field',             city: 'Seattle',         majorCity: 'Seattle',      tz: 'America/Los_Angeles' },
  95:  { utc: '2026-07-07T16:00:00Z', stadium: 'Mercedes-Benz Stadium',   city: 'Atlanta',         majorCity: 'Atlanta',      tz: 'America/New_York' },
  96:  { utc: '2026-07-07T20:00:00Z', stadium: 'BC Place',                city: 'Vancouver',       majorCity: 'Vancouver',    tz: 'America/Vancouver' },

  // ─── Quarterfinals ──────────────────────────────────────────────────
  97:  { utc: '2026-07-09T20:00:00Z', stadium: 'Gillette Stadium',        city: 'Foxborough',      majorCity: 'Boston',       tz: 'America/New_York' },
  98:  { utc: '2026-07-10T19:00:00Z', stadium: 'SoFi Stadium',            city: 'Inglewood',       majorCity: 'Los Angeles',  tz: 'America/Los_Angeles' },
  99:  { utc: '2026-07-11T21:00:00Z', stadium: 'Hard Rock Stadium',       city: 'Miami Gardens',   majorCity: 'Miami',        tz: 'America/New_York' },
  100: { utc: '2026-07-12T01:00:00Z', stadium: 'Arrowhead Stadium',       city: 'Kansas City',     majorCity: 'Kansas City',  tz: 'America/Chicago' },

  // ─── Semifinals ─────────────────────────────────────────────────────
  101: { utc: '2026-07-14T19:00:00Z', stadium: 'AT&T Stadium',            city: 'Arlington',       majorCity: 'Dallas',       tz: 'America/Chicago' },
  102: { utc: '2026-07-15T19:00:00Z', stadium: 'Mercedes-Benz Stadium',   city: 'Atlanta',         majorCity: 'Atlanta',      tz: 'America/New_York' },

  // ─── Final & Third Place ────────────────────────────────────────────
  103: { utc: '2026-07-19T19:00:00Z', stadium: 'MetLife Stadium',         city: 'East Rutherford', majorCity: 'New York',     tz: 'America/New_York' },
  104: { utc: '2026-07-18T21:00:00Z', stadium: 'Hard Rock Stadium',       city: 'Miami Gardens',   majorCity: 'Miami',        tz: 'America/New_York' },
}

const shortDateFmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })

/** "Jun 28" in the browser's locale */
export function formatShortDate(info: MatchInfo): string {
  return shortDateFmt.format(new Date(info.utc))
}

/** "3:00 PM" in the given IANA timezone */
export function formatTimeInTz(utc: string, tz: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric', minute: '2-digit', timeZone: tz,
  }).format(new Date(utc))
}

/** "Sat, July 19" in the given IANA timezone */
export function formatDateInTz(utc: string, tz: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short', month: 'long', day: 'numeric', timeZone: tz,
  }).format(new Date(utc))
}

/** Short timezone label, e.g. "EDT", "CDT" */
export function tzAbbr(utc: string, tz: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, timeZoneName: 'short',
  }).formatToParts(new Date(utc))
  return parts.find(p => p.type === 'timeZoneName')?.value ?? tz
}

/** Date + time in the browser's timezone (e.g. "Sun, July 19 at 8:00 PM") */
export function formatUserDateTime(utc: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(new Date(utc))
}

/** "Your time" timezone abbr (e.g. "CEST") */
export function userTzAbbr(utc: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZoneName: 'short',
  }).formatToParts(new Date(utc))
  return parts.find(p => p.type === 'timeZoneName')?.value ?? ''
}

/** Multiline tooltip for the match header */
export function getMatchTooltip(matchId: number): string {
  const info = MATCH_SCHEDULE[matchId]
  if (!info) return `Match ${matchId}`

  const date = formatDateInTz(info.utc, info.tz)
  const location = info.city === info.majorCity
    ? `${info.stadium}, ${info.city}`
    : `${info.stadium}, ${info.city} (${info.majorCity})`

  const venueTime = `${formatTimeInTz(info.utc, info.tz)} ${tzAbbr(info.utc, info.tz)}`

  const userBrowserTz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const sameTimezone = userBrowserTz === info.tz
  const yourTime = sameTimezone
    ? null
    : `${formatUserDateTime(info.utc)} ${userTzAbbr(info.utc)}`

  const lines = [
    `Match ${matchId} \u2022 ${date}`,
    ``,
    `\u{1F4CD} ${location}`,
    `\u{1F552} Local: ${venueTime}`,
  ]
  if (yourTime) {
    lines.push(`\u{1F30D} Your time: ${yourTime}`)
  }

  return lines.join('\n')
}

/** Compact label: "Jun 28 \u00B7 Los Angeles" */
export function getMatchCompactLabel(matchId: number): string {
  const info = MATCH_SCHEDULE[matchId]
  if (!info) return `M${matchId}`
  return `${formatShortDate(info)} \u00B7 ${info.majorCity}`
}
