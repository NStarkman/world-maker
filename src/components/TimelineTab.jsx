import { useMemo, useState } from "react";
import { HISTORICAL_EVENTS } from "../data/worldData";
import "./TimelineTab.scss";

const RAIL_TOP = 50;
const RAIL_HEIGHT = 560;
const MIN_GAP = 68;

const ERA_COLORS = {
  "Before the Reckoning": "#f87171",
  "The Reckoning": "#facc15",
  "City-State Consolidation": "#fbbf24",
  "Age of Grain Compacts": "#fb923c",
  "Civic Standardization": "#34d399",
  "Late Regional Accord": "#60a5fa",
  "Contemporary Period": "#a78bfa",
};

function eraColor(era) {
  return ERA_COLORS[era] || "#94a3b8";
}

export default function TimelineTab({ year = 1108 }) {
  const events = useMemo(
    () => [...HISTORICAL_EVENTS].sort((a, b) => a.yearNumber - b.yearNumber),
    []
  );

  const majorEvents = useMemo(
    () => events.filter((e) => e.important),
    [events]
  );

  const [selectedId, setSelectedId] = useState(majorEvents[0]?.id || "");

  const selectedEvent = useMemo(
    () => majorEvents.find((e) => e.id === selectedId) || majorEvents[0] || null,
    [majorEvents, selectedId]
  );

  const positioned = useMemo(() => {
    if (!events.length) return [];

    const count = events.length;
    const minYear = events[0].yearNumber;
    const maxYear = events[count - 1].yearNumber;
    const span = Math.max(1, maxYear - minYear);

    const items = events.map((event, index) => {
      const proportional = (event.yearNumber - minYear) / span;
      const even = count > 1 ? index / (count - 1) : 0.5;
      const blended = proportional * 0.35 + even * 0.65;
      return { ...event, y: RAIL_TOP + blended * RAIL_HEIGHT };
    });

    for (let i = 1; i < items.length; i++) {
      if (items[i].y - items[i - 1].y < MIN_GAP) {
        items[i].y = items[i - 1].y + MIN_GAP;
      }
    }

    return items;
  }, [events]);

  /* Rail spans from first dot to last dot */
  const railStart = positioned.length ? positioned[0].y : RAIL_TOP;
  const railEnd = positioned.length ? positioned[positioned.length - 1].y : RAIL_TOP + RAIL_HEIGHT;

  const accent = eraColor(selectedEvent?.era);

  return (
    <div className="timeline-tab">
      <div className="timeline-tab__header">
        <h2>
          <span className="timeline-tab__header-icon">🕰️</span>
          Historical Timeline
        </h2>
        <p className="timeline-tab__header-sub">
          Year <strong>{year}</strong> &mdash; {events.length} recorded events
          spanning {events.length ? `${events[0].yearLabel} to ${events[events.length - 1].yearLabel}` : "—"}
        </p>
      </div>

      {/* Era legend */}
      <div className="timeline-tab__legend">
        {Object.entries(ERA_COLORS).map(([era, color]) => (
          <span key={era} className="timeline-tab__legend-chip">
            <span className="timeline-tab__legend-dot" style={{ background: color }} />
            {era}
          </span>
        ))}
      </div>

      <section className="timeline-tab__surface">
        <div className="timeline-tab__layout">
          {/* ---- RAIL COLUMN ---- */}
          <div className="timeline-tab__rail-col" role="list" aria-label="Historical timeline">
            <div
              className="timeline-tab__rail"
              style={{ top: `${railStart}px`, height: `${railEnd - railStart}px` }}
            />

            {positioned.map((event) => {
              const isSelected = selectedEvent?.id === event.id;
              const color = eraColor(event.era);

              return (
                <div key={event.id} className="timeline-tab__event" style={{ top: `${event.y}px` }} role="listitem">
                  {/* Year chip */}
                  <div className="timeline-tab__year">{event.yearLabel}</div>

                  {/* Dot or tick */}
                  {event.important ? (
                    <button
                      type="button"
                      className={`timeline-tab__dot ${isSelected ? "is-selected" : ""}`}
                      style={{
                        borderColor: color,
                        background: isSelected ? color : "#0f172a",
                        boxShadow: isSelected ? `0 0 0 6px ${color}33, 0 0 18px ${color}44` : undefined,
                      }}
                      onClick={() => setSelectedId(event.id)}
                      aria-label={`Select ${event.title}`}
                    />
                  ) : (
                    <div className="timeline-tab__tick" style={{ background: `${color}88` }} />
                  )}

                  {/* Title */}
                  <div className={`timeline-tab__title ${event.important ? "" : "is-muted"}`}>
                    {event.title}
                    <span className="timeline-tab__era-tag" style={{ color }}>{event.era}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ---- CALLOUT COLUMN ---- */}
          <div className="timeline-tab__callout-col">
            {selectedEvent && (
              <article
                className="timeline-tab__callout"
                style={{ borderTopColor: accent }}
                key={selectedEvent.id}
              >
                <div className="timeline-tab__callout-head">
                  <h3>{selectedEvent.title}</h3>
                  <div className="timeline-tab__meta-row">
                    <span className="timeline-tab__pill is-year">{selectedEvent.yearLabel}</span>
                    <span className="timeline-tab__pill" style={{ borderColor: `${accent}66`, color: accent }}>
                      {selectedEvent.era}
                    </span>
                    <span className="timeline-tab__pill">{selectedEvent.location}</span>
                  </div>
                </div>

                <p className="timeline-tab__summary">{selectedEvent.summary}</p>

                <div className="timeline-tab__callout-sections">
                  <div className="timeline-tab__section">
                    <h4>Historical Significance</h4>
                    <p>{selectedEvent.significance}</p>
                  </div>

                  <div className="timeline-tab__section">
                    <h4>Key Outcomes</h4>
                    <ul>
                      {selectedEvent.outcomes.map((o) => (
                        <li key={o}>{o}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="timeline-tab__section">
                    <h4>Factions Involved</h4>
                    <div className="timeline-tab__faction-row">
                      {selectedEvent.factions.map((f) => (
                        <span key={f} className="timeline-tab__faction-chip">{f}</span>
                      ))}
                    </div>
                  </div>

                  <div className="timeline-tab__section">
                    <h4>Sources</h4>
                    <ul className="timeline-tab__source-list">
                      {selectedEvent.sources.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {selectedEvent.tags?.length > 0 && (
                  <div className="timeline-tab__tag-row">
                    {selectedEvent.tags.map((t) => (
                      <span key={t} className="timeline-tab__tag">#{t}</span>
                    ))}
                  </div>
                )}
              </article>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
