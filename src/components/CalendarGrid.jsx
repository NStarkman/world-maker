import TideBadge from "./TideBadge";
import { SEASON_COLORS } from "../data/worldData";
import { WEEKDAY_NAMES, MOON_ICONS } from "../utils/calendarEngine";
import "./CalendarGrid.scss";

// Groups a flat array of day-rows into weeks (arrays of 7 slots)
function buildWeeks(monthData) {
  const weeks = [];
  let week = new Array(7).fill(null);

  for (const d of monthData) {
    const idx = d.weekday - 1;
    if (week[idx] !== null) {
      weeks.push(week);
      week = new Array(7).fill(null);
    }
    week[idx] = d;
    if (idx === 6) {
      weeks.push(week);
      week = new Array(7).fill(null);
    }
  }
  if (week.some(v => v !== null)) weeks.push(week);
  return weeks;
}

function dayKey(cell) {
  return `${cell.month}-${cell.day}`;
}

function DayCell({ cell, sc, isSelected, onSelectDay }) {
  const isIntercalary = cell.intercalary;

  return (
    <button
      type="button"
      className="calendar-grid__day-cell"
      style={{
        background: isIntercalary
          ? "linear-gradient(135deg, #2b220f, #3a2f14)"
          : "#111827",
        border: `1px solid ${isSelected ? sc.accent : (cell.event ? sc.accent + "88" : "rgba(148,163,184,0.25)")}`,
        borderLeft: cell.event ? `4px solid ${sc.accent}` : `1px solid ${isSelected ? sc.accent : "rgba(148,163,184,0.25)"}`,
        borderRadius: "10px",
        boxShadow: isSelected
          ? `0 0 0 2px ${sc.accent}33`
          : (cell.tide === "Mega" ? "0 0 0 2px #ef444433" : "none"),
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      onClick={() => onSelectDay(cell)}
      aria-pressed={isSelected}
      aria-label={`Select day ${cell.day}`}
    >
      <div className="calendar-grid__day-number">
        {isIntercalary ? (cell.day === 0 ? "✦" : "✧") : cell.day}
      </div>

      <div className="calendar-grid__moon-icons">
        <span title={`Major moon: ${cell.major}`}>{MOON_ICONS[cell.major]}</span>{" "}
        <span title={`Weekly moon: ${cell.minor}`} className="calendar-grid__moon-icon-small">
          {MOON_ICONS[cell.minor]}
        </span>
      </div>

      <TideBadge tide={cell.tide} />

      {cell.event && (
        <div className="calendar-grid__event">
          {cell.event}
        </div>
      )}
    </button>
  );
}

export default function CalendarGrid({ monthData, season, selectedDayKey, onSelectDay }) {
  const sc = SEASON_COLORS[season] || SEASON_COLORS.Spring;
  const weeks = buildWeeks(monthData);

  return (
    <div className="calendar-grid">
      {/* Weekday header row */}
      <div className="calendar-grid__weekday-row">
        {WEEKDAY_NAMES.map(w => (
          <div
            key={w}
            className="calendar-grid__weekday"
          >
            {w.substring(0, 3)}
          </div>
        ))}
      </div>

      {/* Week rows */}
      {weeks.map((wk, wi) => (
        <div
          key={wi}
          className="calendar-grid__week-row"
        >
          {wk.map((cell, ci) =>
            cell ? (
              <DayCell
                key={ci}
                cell={cell}
                sc={sc}
                isSelected={selectedDayKey === dayKey(cell)}
                onSelectDay={onSelectDay}
              />
            ) : (
              <div key={ci} className="calendar-grid__blank" />
            )
          )}
        </div>
      ))}
    </div>
  );
}
