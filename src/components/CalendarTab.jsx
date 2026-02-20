import { useEffect, useMemo, useState } from "react";
import CalendarGrid from "../components/CalendarGrid";
import MoonOrbitViz from "../components/MoonOrbitViz";
import TideBadge from "../components/TideBadge";
import { SEASON_COLORS, HARBORS, TIDE_BADGE_COLORS } from "../data/worldData";
import { MONTH_NAMES, NUM_MONTHS, SEASON_NAMES, MOON_ICONS, WEEKDAY_NAMES, adjustTide, TIDE_RANK } from "../utils/calendarEngine";
import "./CalendarTab.scss";

function selectedKey(row) {
  if (!row) return "";
  return `${row.month}-${row.day}`;
}

const TIDE_INTENSITY = {
  Mega: 100,
  High: 70,
  Moderate: 40,
  Low: 15,
};

export default function CalendarTab({
  year, currentMonth, setCurrentMonth, goToNextMonth, goToPrevMonth,
  rows, monthData, seasonMap, extraMonthSeason,
}) {
  const currentSeason = seasonMap[currentMonth] || "Spring";
  const sc = SEASON_COLORS[currentSeason];
  const extraSeasonName = SEASON_NAMES[extraMonthSeason];
  const seasonEmoji = ["🌸", "☀️", "🍂", "❄️"][extraMonthSeason];
  const monthRows = useMemo(() => monthData[currentMonth] || [], [monthData, currentMonth]);

  const defaultSelected = useMemo(
    () => monthRows.find((r) => !r.intercalary) || monthRows[0] || null,
    [monthRows]
  );
  const [selectedDay, setSelectedDay] = useState(defaultSelected);
  const [harborId, setHarborId] = useState(HARBORS[0]?.id || "");

  const harbor = useMemo(
    () => HARBORS.find((h) => h.id === harborId) || HARBORS[0],
    [harborId]
  );

  useEffect(() => {
    setSelectedDay(defaultSelected);
  }, [defaultSelected, currentMonth]);

  const adjustedMonthRows = useMemo(() => {
    if (!harbor) return monthRows;
    return monthRows.map((row) => ({
      ...row,
      adjustedTide: adjustTide(row.tide, harbor.tideOffset),
    }));
  }, [monthRows, harbor]);

  const highMegaDays = useMemo(() => {
    return adjustedMonthRows.filter((row) => {
      const tide = row.adjustedTide || row.tide;
      return TIDE_RANK[tide] >= TIDE_RANK.High;
    }).slice(0, 10);
  }, [adjustedMonthRows]);

  const shippingWindows = useMemo(() => {
    const safeRows = adjustedMonthRows.filter((row) => {
      const tide = row.adjustedTide || row.tide;
      return TIDE_RANK[tide] <= TIDE_RANK.Moderate && !row.intercalary;
    });

    const windows = [];
    let current = null;
    for (const row of safeRows) {
      if (!current) {
        current = { start: row.day, end: row.day, length: 1 };
        continue;
      }
      if (row.day === current.end + 1) {
        current.end = row.day;
        current.length += 1;
      } else {
        windows.push(current);
        current = { start: row.day, end: row.day, length: 1 };
      }
    }
    if (current) windows.push(current);
    return windows;
  }, [adjustedMonthRows]);

  const exportJson = () => {
    const payload = {
      year,
      rows,
    };
    downloadFile(`world-year-${year}.json`, JSON.stringify(payload, null, 2), "application/json");
  };

  const exportCsv = () => {
    const header = [
      "absoluteDay",
      "month",
      "day",
      "weekday",
      "season",
      "major",
      "minor",
      "majorPhase",
      "minorPhase",
      "tide",
      "event",
      "intercalary",
    ];
    const lines = [header.join(",")];
    rows.forEach((row) => {
      const values = [
        row.absoluteDay,
        row.month,
        row.day,
        row.weekday,
        row.season,
        row.major,
        row.minor,
        row.majorPhase,
        row.minorPhase,
        row.tide,
        row.event || "",
        row.intercalary,
      ];
      lines.push(values.map(csvEscape).join(","));
    });
    downloadFile(`world-year-${year}.csv`, lines.join("\n"), "text/csv");
  };

  const tideVisual = (tide) => {
    const colors = TIDE_BADGE_COLORS[tide] || { bg: "#e2e8f0", fg: "#334155" };
    return {
      color: colors.fg,
      fill: colors.bg,
      width: `${TIDE_INTENSITY[tide] ?? 0}%`,
    };
  };

  return (
    <div className="calendar-tab">
      <div className="calendar-tab__year-banner">
        <div className="calendar-tab__year-banner-text">
          Year {year} update: <strong>{extraSeasonName}</strong> has 4 months this year.
        </div>
      </div>

      <div className="calendar-tab__month-header">
        <div>
          <div className="calendar-tab__month-title">
            {MONTH_NAMES[currentMonth]}
          </div>
          <div className="calendar-tab__month-meta">
            <span className="calendar-tab__season-pill">
              {currentSeason}
            </span>
            <span className="calendar-tab__month-count">Month {currentMonth} of {NUM_MONTHS}</span>
            <span className="calendar-tab__season-emoji">{seasonEmoji}</span>
          </div>
        </div>

        <div className="calendar-tab__month-controls">
          <div className="calendar-tab__export-actions">
            <button type="button" className="calendar-tab__action-btn" onClick={exportJson}>Export JSON</button>
            <button type="button" className="calendar-tab__action-btn" onClick={exportCsv}>Export CSV</button>
          </div>
          <button onClick={goToPrevMonth} className="calendar-tab__nav-btn">◀ Prev</button>
          <div className="calendar-tab__month-strip">
            {Array.from({ length: NUM_MONTHS }, (_, i) => i + 1).map((m) => (
              <button
                key={m}
                onClick={() => setCurrentMonth(m)}
                className="calendar-tab__month-btn"
                style={{
                  border: `1px solid ${m === currentMonth ? sc.accent : "rgba(148,163,184,0.35)"}`,
                  background: m === currentMonth ? sc.accent : "#0f172a",
                  color: m === currentMonth ? "#fff" : "#cbd5e1",
                }}
              >
                {m}
              </button>
            ))}
          </div>
          <button onClick={goToNextMonth} className="calendar-tab__nav-btn">Next ▶</button>
        </div>
      </div>

      <div className="calendar-tab__content-grid">
        <div className="calendar-tab__calendar-panel">
          <div className="calendar-tab__panel-help">
            Select a day to inspect moon state and orbits.
          </div>
          <CalendarGrid
            monthData={monthRows}
            season={currentSeason}
            selectedDayKey={selectedKey(selectedDay)}
            onSelectDay={setSelectedDay}
          />
        </div>

        <div className="calendar-tab__details-panel">
          {selectedDay ? (
            <>
              <div className="calendar-tab__details-head">
                <div>
                  <div className="calendar-tab__details-title">
                    {selectedDay.intercalary ? "Festival Day" : `Day ${selectedDay.day}`}
                  </div>
                  <div className="calendar-tab__details-subtitle">
                    {currentSeason} · {selectedDay.intercalary ? "Intercalary" : `Weekday ${selectedDay.weekday}`}
                  </div>
                </div>
                <TideBadge tide={selectedDay.tide} />
              </div>

              <div className="calendar-tab__details-body">
                <div><strong>Major Moon:</strong> {MOON_ICONS[selectedDay.major]} {selectedDay.major}</div>
                <div><strong>Weekly Moon:</strong> {MOON_ICONS[selectedDay.minor]} {selectedDay.minor}</div>
                <div><strong>Event:</strong> {selectedDay.event || "None"}</div>
              </div>

              <div className="calendar-tab__tide-intensity">
                <div className="calendar-tab__tide-label" style={{ color: tideVisual(selectedDay.tide).color }}>
                  Tide Intensity
                </div>
                <div className="calendar-tab__tide-track">
                  <div
                    className="calendar-tab__tide-fill"
                    style={{
                      width: tideVisual(selectedDay.tide).width,
                      background: tideVisual(selectedDay.tide).fill,
                    }}
                  />
                </div>
              </div>

              <div className="calendar-tab__orbit-panel">
                <MoonOrbitViz
                  majorPhase={selectedDay.majorPhase || 0}
                  weeklyPhase={selectedDay.minorPhase || 0}
                  dayIndex={selectedDay.absoluteDay || 0}
                  caption="Selected Day Orbits"
                />
              </div>
            </>
          ) : (
            <div className="calendar-tab__empty-state">No day data found for this month.</div>
          )}
        </div>
      </div>

      <div className="calendar-tab__harbor-grid">
        <div className="calendar-tab__harbor-panel">
          <div className="calendar-tab__panel-title">Port Almanac</div>
          <div className="calendar-tab__harbor-row">
            <label className="calendar-tab__harbor-label" htmlFor="harborSelect">Harbor</label>
            <select
              id="harborSelect"
              className="calendar-tab__harbor-select"
              value={harborId}
              onChange={(e) => setHarborId(e.target.value)}
            >
              {HARBORS.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
          {harbor?.note && (
            <div className="calendar-tab__harbor-note">{harbor.note}</div>
          )}
          <div className="calendar-tab__almanac-list">
            {highMegaDays.length > 0 ? (
              highMegaDays.map((row) => (
                <div key={`${row.month}-${row.day}`} className="calendar-tab__almanac-item">
                  <span className="calendar-tab__almanac-day">Day {row.day}</span>
                  <span className="calendar-tab__almanac-weekday">{WEEKDAY_NAMES[row.weekday - 1]}</span>
                  <TideBadge tide={row.adjustedTide || row.tide} />
                </div>
              ))
            ) : (
              <div className="calendar-tab__empty-state">No High/Mega tides this month.</div>
            )}
          </div>
        </div>

        <div className="calendar-tab__harbor-panel">
          <div className="calendar-tab__panel-title">Safe Shipping Windows</div>
          <div className="calendar-tab__shipping-list">
            {shippingWindows.length > 0 ? (
              shippingWindows.map((win, idx) => (
                <div key={`${win.start}-${win.end}-${idx}`} className="calendar-tab__shipping-item">
                  <span className="calendar-tab__shipping-range">Days {win.start}–{win.end}</span>
                  <span className="calendar-tab__shipping-length">{win.length} day window</span>
                </div>
              ))
            ) : (
              <div className="calendar-tab__empty-state">No safe windows this month.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadFile(fileName, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
