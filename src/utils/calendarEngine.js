// ============================================================
//  CALENDAR ENGINE — ported from dual_moon_calendar Python script
// ============================================================

export const NUM_MONTHS = 13;
export const DAYS_PER_MONTH = 30;
export const WEEK_LENGTH = 7;
export const MAJOR_PERIOD = 30.0;
export const WEEKLY_PERIOD = 7.6;
export const MAJOR_ANOMALISTIC_PERIOD = 33.0;
export const WEEKLY_ANOMALISTIC_PERIOD = 8.2;
export const YEAR_LENGTH = (NUM_MONTHS * DAYS_PER_MONTH) + 2;

export const TIDE_ORDER = ["Low", "Moderate", "High", "Mega"];
export const TIDE_RANK = TIDE_ORDER.reduce((acc, t, idx) => {
  acc[t] = idx;
  return acc;
}, {});

export const MONTH_NAMES = {
  1:"Beres", 2:"Brit", 3:"Avos", 4:"Emos", 5:"Umshei", 6:"Idrel",
  7:"Yamei", 8:"Mila", 9:"Leida", 10:"Divar", 11:"Kohav", 12:"Shiv", 13:"Midia"
};

export const SEASON_NAMES = ["Spring", "Summer", "Autumn", "Winter"];
export const WEEKDAY_NAMES = ["First","Second","Third","Fourth","Fifth","Sixth","Seventh"];

export const MOON_ICONS = { New:"🌑", Waxing:"🌓", Full:"🌕", Waning:"🌗" };

export function yearBaseDay(year) {
  const yearIndex = Math.max(0, (year | 0) - 1);
  return yearIndex * YEAR_LENGTH;
}

export function moonPhase(day, period) {
  return (day % period) / period;
}

export function moonPhaseName(phase) {
  if (phase < 0.125 || phase >= 0.875) return "New";
  if (phase < 0.375) return "Waxing";
  if (phase < 0.625) return "Full";
  return "Waning";
}

export function tideLevel(majorPhase, weeklyPhase, dayIndex = 0) {
  let phaseDiff = Math.abs(majorPhase - weeklyPhase);
  phaseDiff = Math.min(phaseDiff, 1 - phaseDiff);

  const majorAnomaly = ((dayIndex % MAJOR_ANOMALISTIC_PERIOD) / MAJOR_ANOMALISTIC_PERIOD) * 2 * Math.PI;
  const weeklyAnomaly = ((dayIndex % WEEKLY_ANOMALISTIC_PERIOD) / WEEKLY_ANOMALISTIC_PERIOD) * 2 * Math.PI;

  const majorDistanceScale = 1 / Math.pow(1 - 0.08 * Math.cos(majorAnomaly), 3);
  const weeklyDistanceScale = 1 / Math.pow(1 - 0.12 * Math.cos(weeklyAnomaly), 3);

  const alignmentScore = 1 - (phaseDiff * 2);
  const distanceWeightedScale = (majorDistanceScale * 0.85) + (weeklyDistanceScale * 0.15);
  const tideStrength = alignmentScore * distanceWeightedScale;

  if (tideStrength >= 0.95) return "Mega";
  if (tideStrength >= 0.72) return "High";
  if (tideStrength >= 0.46) return "Moderate";
  return "Low";
}

export function adjustTide(tide, offset = 0) {
  const idx = TIDE_RANK[tide] ?? 0;
  const next = Math.max(0, Math.min(TIDE_ORDER.length - 1, idx + offset));
  return TIDE_ORDER[next];
}

export function buildSeasonMap(extraMonthSeason) {
  const map = {};
  let n = 1;
  for (let si = 0; si < 4; si++) {
    const count = si === extraMonthSeason ? 4 : 3;
    for (let j = 0; j < count; j++) map[n++] = SEASON_NAMES[si];
  }
  return map;
}

export function eventForDay(month, day, majorPhase, weeklyPhase, weekday) {
  const mName = moonPhaseName(majorPhase);
  const wName = moonPhaseName(weeklyPhase);
  if (month === 1 && day === 0) return "🎊 New Year's Festival";
  if (mName === "Full" && wName === "Full") return "🌕 Dual-Full Festival";
  if (weekday === 2) return "🛒 Weekly Market";
  if (month === 7 && mName === "Full") return "🌾 Harvest Moon";
  return "";
}

// Seeded random number generator for deterministic randomness per year
function seededRandom(year) {
  let seed = year;
  seed = (seed ^ 0xdeadbeef) + (seed << 5);
  seed = Math.imul(seed ^ (seed >>> 16), 0x21f0aaad);
  seed = seed ^ (seed >>> 15);
  seed = Math.imul(seed | 1, 0x735a2d97);
  seed = (seed ^ (seed >>> 15)) >>> 0;
  return seed / 0x100000000;
}

export function generateCalendar(year) {
  // Use seeded random to determine which season gets the extra month (0-3)
  const extraMonthSeason = Math.floor(seededRandom(year) * 4);
  const seasonMap = buildSeasonMap(extraMonthSeason);
  const baseDay = yearBaseDay(year);
  const rows = [];
  let dayCounter = 0, weekdayCounter = 0;

  for (let month = 1; month <= NUM_MONTHS; month++) {
    // Intercalary day at start of Month 1
    if (month === 1) {
      const absoluteDay = dayCounter + baseDay;
      const mp = moonPhase(absoluteDay, MAJOR_PERIOD);
      const wp = moonPhase(absoluteDay, WEEKLY_PERIOD);
      rows.push({
        absoluteDay: dayCounter,
        month, day: 0, weekday: (weekdayCounter % WEEK_LENGTH) + 1,
        major: moonPhaseName(mp), minor: moonPhaseName(wp),
        majorPhase: mp, minorPhase: wp,
        tide: tideLevel(mp, wp, absoluteDay), season: "Spring",
        event: "🎊 New Year's Festival", intercalary: true,
      });
      dayCounter++; weekdayCounter++;
    }

    for (let day = 1; day <= DAYS_PER_MONTH; day++) {
      const weekday = (weekdayCounter % WEEK_LENGTH) + 1;
      const absoluteDay = dayCounter + baseDay;
      const mp = moonPhase(absoluteDay, MAJOR_PERIOD);
      const wp = moonPhase(absoluteDay, WEEKLY_PERIOD);
      rows.push({
        absoluteDay: dayCounter,
        month, day, weekday,
        major: moonPhaseName(mp), minor: moonPhaseName(wp),
        majorPhase: mp, minorPhase: wp,
        tide: tideLevel(mp, wp, absoluteDay), season: seasonMap[month],
        event: eventForDay(month, day, mp, wp, weekday),
        intercalary: false,
      });
      dayCounter++; weekdayCounter++;
    }

    // Intercalary day at end of Month 13
    if (month === NUM_MONTHS) {
      const absoluteDay = dayCounter + baseDay;
      const mp = moonPhase(absoluteDay, MAJOR_PERIOD);
      const wp = moonPhase(absoluteDay, WEEKLY_PERIOD);
      rows.push({
        absoluteDay: dayCounter,
        month, day: 31, weekday: (weekdayCounter % WEEK_LENGTH) + 1,
        major: moonPhaseName(mp), minor: moonPhaseName(wp),
        majorPhase: mp, minorPhase: wp,
        tide: tideLevel(mp, wp, absoluteDay), season: "Winter",
        event: "🎊 New Year's Eve Festival", intercalary: true,
      });
      dayCounter++; weekdayCounter++;
    }
  }

  return { rows, extraMonthSeason, seasonMap };
}

// Groups flat rows into { [month]: [dayRow, ...] }
export function groupByMonth(rows) {
  const md = {};
  for (let m = 1; m <= NUM_MONTHS; m++) md[m] = [];
  for (const r of rows) {
    if (!md[r.month]) md[r.month] = [];
    md[r.month].push(r);
  }
  return md;
}
