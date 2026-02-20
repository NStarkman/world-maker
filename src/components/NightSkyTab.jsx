import { useEffect, useMemo, useRef, useState } from "react";
import {
  MAJOR_PERIOD,
  WEEKLY_PERIOD,
  MONTH_NAMES,
  moonPhase,
  moonPhaseName,
  yearBaseDay,
} from "../utils/calendarEngine";
import "./NightSkyTab.scss";

const SKY_WIDTH = 720;
const SKY_HEIGHT = 400;
const NIGHT_START = 18 / 24;
const NIGHT_END = 30 / 24;
const DEFAULT_SPEED = 2.2;

function makeRng(seed) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildStars(seed, count = 120) {
  const rng = makeRng(seed);
  const stars = [];
  for (let i = 0; i < count; i += 1) {
    const x = rng() * SKY_WIDTH;
    const y = rng() * (SKY_HEIGHT * 0.78);
    const r = 0.5 + rng() * 1.8;
    const alpha = 0.2 + rng() * 0.7;
    stars.push({ x, y, r, alpha });
  }
  return stars;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function skyPosition(angle, radius, centerX, horizonY) {
  const x = centerX + Math.cos(angle) * radius;
  const y = horizonY - Math.sin(angle) * radius;
  return { x, y };
}

function moonAnglesForTime(progressRaw, rawMajorPhase, rawWeeklyPhase) {
  const baseAngle = Math.PI * progressRaw;
  const phaseDiff = rawWeeklyPhase - rawMajorPhase;
  const wrappedDiff = ((phaseDiff + 0.5) % 1) - 0.5;
  const offsetScale = Math.PI * 0.45;
  const majorAngle = baseAngle - (wrappedDiff * offsetScale * 0.2);
  const weeklyAngle = baseAngle + (wrappedDiff * offsetScale);
  return {
    majorAngle: clamp(majorAngle, -0.25, Math.PI + 0.4),
    weeklyAngle: clamp(weeklyAngle, -0.25, Math.PI + 0.4),
  };
}

function normalizePhase(phase) {
  if (phase <= 0.02 || phase >= 0.98) return 0;
  if (Math.abs(phase - 0.5) <= 0.02) return 0.5;
  return phase;
}

function phaseClip(phase, r) {
  const p = normalizePhase(phase);
  const illumination = p <= 0.5 ? p * 2 : (1 - p) * 2;
  const width = Math.max(0, Math.min(2 * r, 2 * r * illumination));
  const clipX = p <= 0.5 ? r - width : -r;
  return { clipX, width };
}

function toTimeLabel(fraction) {
  const totalMinutes = Math.round((fraction % 1) * 24 * 60);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function NightSkyTab({ year, currentMonth, monthData }) {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [timeFraction, setTimeFraction] = useState(NIGHT_START);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);

  const monthRows = useMemo(
    () => monthData[selectedMonth] || [],
    [monthData, selectedMonth]
  );

  useEffect(() => {
    setSelectedMonth(currentMonth);
  }, [currentMonth]);

  useEffect(() => {
    const first = monthRows.find((row) => !row.intercalary) || monthRows[0] || null;
    setSelectedDay(first ? String(first.day) : null);
  }, [monthRows]);

  const selectedRow = useMemo(() => {
    if (!selectedDay) return null;
    return monthRows.find((row) => String(row.day) === selectedDay) || null;
  }, [monthRows, selectedDay]);

  const stepMonth = (delta) => {
    const next = Math.max(1, Math.min(13, selectedMonth + delta));
    if (next === selectedMonth) return;
    setSelectedMonth(next);
  };

  const stepDay = (delta) => {
    if (!monthRows.length) return;
    const currentIndex = selectedRow
      ? monthRows.findIndex((row) => row === selectedRow)
      : -1;
    let nextIndex = currentIndex + delta;
    if (nextIndex < 0) {
      const prevMonth = Math.max(1, selectedMonth - 1);
      const prevRows = monthData[prevMonth] || [];
      if (prevRows.length) {
        setSelectedMonth(prevMonth);
        setSelectedDay(String(prevRows[prevRows.length - 1].day));
      }
      return;
    }
    if (nextIndex >= monthRows.length) {
      const nextMonth = Math.min(13, selectedMonth + 1);
      const nextRows = monthData[nextMonth] || [];
      if (nextRows.length) {
        setSelectedMonth(nextMonth);
        setSelectedDay(String(nextRows[0].day));
      }
      return;
    }
    setSelectedDay(String(monthRows[nextIndex].day));
  };

  useEffect(() => {
    setTimeFraction(NIGHT_START);
  }, [selectedRow, selectedMonth]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const tick = (now) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      setTimeFraction((prev) => {
        const hours = delta * speed;
        const next = prev + hours / 24;
        if (next <= NIGHT_END) return next;
        if (!selectedRow) return NIGHT_START + (next - NIGHT_END);
        const baseDay = yearBaseDay(year);
        const absoluteDay = baseDay + selectedRow.absoluteDay + next;
        const rawMajorPhase = moonPhase(absoluteDay, MAJOR_PERIOD);
        const rawWeeklyPhase = moonPhase(absoluteDay, WEEKLY_PERIOD);
        const progressRaw = (next - NIGHT_START) / (NIGHT_END - NIGHT_START);
        const centerX = SKY_WIDTH * 0.5;
        const horizonY = SKY_HEIGHT * 0.78;
        const angles = moonAnglesForTime(progressRaw, rawMajorPhase, rawWeeklyPhase);
        const majorPos = skyPosition(angles.majorAngle, SKY_WIDTH * 0.34, centerX, horizonY);
        const weeklyPos = skyPosition(angles.weeklyAngle, SKY_WIDTH * 0.22, centerX, horizonY);
        const majorBelow = majorPos.y > horizonY - 2;
        const weeklyBelow = weeklyPos.y > horizonY - 2;
        if (majorBelow && weeklyBelow) {
          return NIGHT_START + (next - NIGHT_END);
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
    };
  }, [isPlaying, speed, selectedRow, year]);

  const stars = useMemo(() => {
    if (!selectedRow) return [];
    return buildStars(year * 4099 + selectedRow.absoluteDay * 17, 120);
  }, [selectedRow, year]);

  const skyData = useMemo(() => {
    if (!selectedRow) return null;
    const baseDay = yearBaseDay(year);
    const absoluteDay = baseDay + selectedRow.absoluteDay + timeFraction;
    const rawMajorPhase = moonPhase(absoluteDay, MAJOR_PERIOD);
    const rawWeeklyPhase = moonPhase(absoluteDay, WEEKLY_PERIOD);
    const majorPhase = normalizePhase(rawMajorPhase);
    const weeklyPhase = normalizePhase(rawWeeklyPhase);
    const centerX = SKY_WIDTH * 0.5;
    const horizonY = SKY_HEIGHT * 0.78;
    const progressRaw = (timeFraction - NIGHT_START) / (NIGHT_END - NIGHT_START);
    const angles = moonAnglesForTime(progressRaw, rawMajorPhase, rawWeeklyPhase);
    const majorPos = skyPosition(angles.majorAngle, SKY_WIDTH * 0.34, centerX, horizonY);
    const weeklyPos = skyPosition(angles.weeklyAngle, SKY_WIDTH * 0.22, centerX, horizonY);
    const majorAbove = majorPos.y <= horizonY - 2;
    const weeklyAbove = weeklyPos.y <= horizonY - 2;
    return {
      majorPhase,
      weeklyPhase,
      majorPos,
      weeklyPos,
      majorAbove,
      weeklyAbove,
      horizonY,
      timeLabel: toTimeLabel(timeFraction),
    };
  }, [selectedRow, timeFraction, year]);

  const onSpeedChange = (event) => {
    setSpeed(Number(event.target.value));
  };

  return (
    <div className="night-sky-tab">
      <div className="night-sky-tab__header">
        <div>
          <div className="night-sky-tab__title">Night Sky Animator</div>
          <div className="night-sky-tab__subtitle">
            Year {year} · {selectedRow ? `${MONTH_NAMES[selectedRow.month]}, Day ${selectedRow.day}` : "Pick a day"}
            {skyData ? ` · ${skyData.timeLabel}` : ""}
          </div>
        </div>

        <div className="night-sky-tab__controls">
          <div className="night-sky-tab__control">
            <button
              type="button"
              className="night-sky-tab__play-btn"
              onClick={() => setIsPlaying((prev) => !prev)}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <div className="night-sky-tab__speed">
              <label htmlFor="skySpeed">Speed</label>
              <input
                id="skySpeed"
                type="range"
                min="0.5"
                max="6"
                step="0.5"
                value={speed}
                onChange={onSpeedChange}
              />
              <span>{speed.toFixed(1)}x</span>
            </div>
          </div>

          <div className="night-sky-tab__selectors">
            <div className="night-sky-tab__stepper">
              <button
                type="button"
                className="night-sky-tab__step-btn"
                onClick={() => stepMonth(-1)}
                aria-label="Previous month"
              >
                ◀
              </button>
              <button
                type="button"
                className="night-sky-tab__step-btn"
                onClick={() => stepMonth(1)}
                aria-label="Next month"
              >
                ▶
              </button>
            </div>
            <label className="night-sky-tab__label" htmlFor="skyMonth">
              Month
            </label>
            <select
              id="skyMonth"
              className="night-sky-tab__select"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(Number(event.target.value))}
            >
              {Object.entries(MONTH_NAMES).map(([key, name]) => (
                <option key={key} value={Number(key)}>{name}</option>
              ))}
            </select>

            <div className="night-sky-tab__stepper">
              <button
                type="button"
                className="night-sky-tab__step-btn"
                onClick={() => stepDay(-1)}
                aria-label="Previous day"
              >
                ◀
              </button>
              <button
                type="button"
                className="night-sky-tab__step-btn"
                onClick={() => stepDay(1)}
                aria-label="Next day"
              >
                ▶
              </button>
            </div>
            <label className="night-sky-tab__label" htmlFor="skyDay">
              Day
            </label>
            <select
              id="skyDay"
              className="night-sky-tab__select"
              value={selectedDay || ""}
              onChange={(event) => setSelectedDay(event.target.value)}
            >
              {monthRows.map((row) => (
                <option key={`${row.month}-${row.day}`} value={String(row.day)}>
                  {row.intercalary ? `Festival ${row.day}` : `Day ${row.day}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="night-sky-tab__content">
        <div className="night-sky-tab__frame">
          {skyData ? (
            <svg
              viewBox={`0 0 ${SKY_WIDTH} ${SKY_HEIGHT}`}
              className="night-sky-tab__sky"
              role="img"
              aria-label="Animated night sky"
            >
              <defs>
                <linearGradient id="skyGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#070a18" />
                  <stop offset="55%" stopColor="#0c1b30" />
                  <stop offset="100%" stopColor="#0a0f1c" />
                </linearGradient>
                <radialGradient id="nebulaGlow" cx="30%" cy="25%" r="70%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop offset="55%" stopColor="#a855f7" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#020617" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="vignette" cx="50%" cy="40%" r="70%">
                  <stop offset="65%" stopColor="#000000" stopOpacity="0" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
                </radialGradient>
                <linearGradient id="horizonGlow" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#020617" stopOpacity="0" />
                </linearGradient>
                <radialGradient id="majorSurface" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="55%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor="#cbd5f5" />
                </radialGradient>
                <radialGradient id="weeklySurface" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#f1f5f9" />
                  <stop offset="55%" stopColor="#dbe3ee" />
                  <stop offset="100%" stopColor="#b9c4d6" />
                </radialGradient>
                <radialGradient id="weeklyLimb" cx="65%" cy="60%" r="70%">
                  <stop offset="0%" stopColor="#0b1220" stopOpacity="0" />
                  <stop offset="70%" stopColor="#0b1220" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#0b1220" stopOpacity="0.75" />
                </radialGradient>
                <radialGradient id="earthshine" cx="55%" cy="45%" r="70%">
                  <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                </radialGradient>
                <filter id="moonGlow" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <clipPath id="majorClip">
                  {(() => {
                    const r = 22;
                    const { clipX, width } = phaseClip(skyData.majorPhase, r);
                    return <rect x={clipX} y={-r} width={width} height={2 * r} />;
                  })()}
                </clipPath>
                <clipPath id="weeklyClip">
                  {(() => {
                    const r = 14;
                    const { clipX, width } = phaseClip(skyData.weeklyPhase, r);
                    return <rect x={clipX} y={-r} width={width} height={2 * r} />;
                  })()}
                </clipPath>
              </defs>

              <rect width={SKY_WIDTH} height={SKY_HEIGHT} fill="url(#skyGradient)" />
              <rect width={SKY_WIDTH} height={SKY_HEIGHT} fill="url(#nebulaGlow)" />
              <rect y={skyData.horizonY - 30} width={SKY_WIDTH} height="60" fill="url(#horizonGlow)" />

              {stars.map((star, idx) => (
                <circle
                  key={idx}
                  cx={star.x}
                  cy={star.y}
                  r={star.r}
                  fill="#e2e8f0"
                  opacity={star.alpha}
                  className="night-sky-tab__star"
                  style={{
                    animationDelay: `${((star.x + star.y) % 6).toFixed(2)}s`,
                    animationDuration: `${(2.8 + star.r * 1.4).toFixed(2)}s`,
                  }}
                />
              ))}

              <path
                d={`M 0 ${skyData.horizonY} C 120 ${skyData.horizonY - 26}, 240 ${skyData.horizonY + 22}, 360 ${skyData.horizonY - 12}
                    C 480 ${skyData.horizonY - 45}, 600 ${skyData.horizonY + 18}, 720 ${skyData.horizonY - 4}
                    L 720 ${SKY_HEIGHT} L 0 ${SKY_HEIGHT} Z`}
                fill="#0b1325"
                opacity="0.9"
              />

              {skyData.majorAbove && (
                <g transform={`translate(${skyData.majorPos.x} ${skyData.majorPos.y})`}>
                  <circle r="28" fill="#93c5fd" opacity="0.12" filter="url(#moonGlow)" />
                  <circle r="22" fill="#0b1220" />
                  <circle r="22" fill="url(#earthshine)" />
                  <circle r="22" fill="url(#majorSurface)" clipPath="url(#majorClip)" />
                  <circle r="22" fill="none" stroke="#e2e8f0" strokeWidth="0.7" opacity="0.35" />
                  <circle cx="-6" cy="-5" r="2.6" fill="#dbe2f2" opacity="0.35" />
                  <circle cx="5" cy="7" r="1.6" fill="#cfd8ea" opacity="0.28" />
                </g>
              )}

              {skyData.weeklyAbove && (
                <g transform={`translate(${skyData.weeklyPos.x} ${skyData.weeklyPos.y})`}>
                  <circle r="16" fill="#93c5fd" opacity="0.06" filter="url(#moonGlow)" />
                  <circle r="13" fill="#0b1220" />
                  <circle r="13" fill="url(#earthshine)" opacity="0.55" />
                  <circle r="13" fill="url(#weeklySurface)" clipPath="url(#weeklyClip)" />
                  <circle r="13" fill="url(#weeklyLimb)" />
                  <circle r="13" fill="none" stroke="#e2e8f0" strokeWidth="0.45" opacity="0.25" />
                  <circle cx="-2.6" cy="1.6" r="1" fill="#dbe2f2" opacity="0.25" />
                  <circle cx="3.2" cy="-2.2" r="0.8" fill="#cfd8ea" opacity="0.22" />
                </g>
              )}

              <rect width={SKY_WIDTH} height={SKY_HEIGHT} fill="url(#vignette)" />
            </svg>
          ) : (
            <div className="night-sky-tab__empty">Select a day to animate the sky.</div>
          )}
        </div>

        {selectedRow && skyData && (
          <div className="night-sky-tab__readout">
            <div className="night-sky-tab__readout-title">Night Readout</div>
            <div className="night-sky-tab__readout-row">
              <span>Major Moon</span>
              <strong>{moonPhaseName(skyData.majorPhase)}</strong>
            </div>
            <div className="night-sky-tab__readout-row">
              <span>Weekly Moon</span>
              <strong>{moonPhaseName(skyData.weeklyPhase)}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
