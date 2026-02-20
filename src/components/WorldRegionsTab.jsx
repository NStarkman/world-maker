import { useState } from "react";
import WorldMapSVG from "./WorldMapSVG";
import {
  KINGDOMS,
  WORLD_FACTS,
  ROUTES,
  MEGATIDE_JOURNEY_RULES,
  SETTLEMENTS,
} from "../data/worldData";
import { SEASON_NAMES } from "../utils/calendarEngine";
import "./WorldRegionsTab.scss";

const YEAR_EVENTS = [
  { event: "🎊 New Year's Festival", desc: "Day 0 of Beres. Intercalary day outside the week." },
  { event: "🛒 Weekly Markets", desc: "Every Second-day of each week. 52+ markets per year." },
  { event: "🌕 Dual-Full Festivals", desc: "When both moons are full simultaneously. Occurs ~3–5× per year." },
  { event: "🌾 Harvest Moon", desc: "Full major moon in Yamei (Month 7)." },
  { event: "🎊 New Year's Eve", desc: "Final intercalary day after Midia. Winter celebration." },
];

export default function WorldRegionsTab({ year, extraMonthSeason }) {
  const [highlightKingdom, setHighlightKingdom] = useState(null);
  const extraSeasonName = SEASON_NAMES[extraMonthSeason];
  const kingdomColorByName = KINGDOMS.reduce((accumulator, kingdom) => {
    accumulator[kingdom.name] = kingdom.color;
    return accumulator;
  }, {});

  const settlementTypeRank = {
    Capital: 0,
    Port: 1,
    "Harbour Town": 2,
    City: 3,
  };

  const settlementIconByType = {
    Capital: "🏛️",
    Port: "⚓",
    "Harbour Town": "🛶",
    City: "🏘️",
  };

  const sortedSettlements = [...SETTLEMENTS].sort((left, right) => {
    const kingdomOrder = left.kingdom.localeCompare(right.kingdom);
    if (kingdomOrder !== 0) return kingdomOrder;

    const leftRank = settlementTypeRank[left.type] ?? 99;
    const rightRank = settlementTypeRank[right.type] ?? 99;
    if (leftRank !== rightRank) return leftRank - rightRank;

    return left.name.localeCompare(right.name);
  });

  return (
    <div className="world-regions-tab">
      <h2 className="world-regions-tab__title">World & Regions</h2>
      <p className="world-regions-tab__subtitle">
        Region-first atlas of factions, capitals, tides, and trade systems.
      </p>

      <section className="world-regions-tab__hero-grid">
        <div className="world-regions-tab__map-panel">
          <WorldMapSVG highlightKingdom={highlightKingdom} />
        </div>

        <div className="world-regions-tab__regions-panel">
          <div className="world-regions-tab__section-title">Regions & Factions</div>
          <div className="world-regions-tab__regions-list">
            {KINGDOMS.map((kingdom) => (
              <article
                key={kingdom.name}
                onMouseEnter={() => setHighlightKingdom(kingdom.mapKey)}
                onMouseLeave={() => setHighlightKingdom(null)}
                className="world-regions-tab__region-card"
                style={{
                  background: `${kingdom.color}18`,
                  border: `1px solid ${kingdom.color}55`,
                  borderLeft: `4px solid ${kingdom.color}`,
                }}
              >
                <div className="world-regions-tab__region-name">{kingdom.name}</div>
                <div className="world-regions-tab__region-meta" style={{ color: kingdom.color }}>
                  {kingdom.region}
                </div>
                <div className="world-regions-tab__region-desc">{kingdom.desc}</div>
                <div className="world-regions-tab__region-capital">
                  <span className="world-regions-tab__region-capital-label">Capital:</span> {kingdom.capital}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="world-regions-tab__events">
        <div className="world-regions-tab__section-title">Regional Calendar Highlights — Year {year}</div>
        <div className="world-regions-tab__events-grid">
          <article className="world-regions-tab__event-card world-regions-tab__event-card--accent">
            <div className="world-regions-tab__event-title">
              {["🌸", "☀️", "🍂", "❄️"][extraMonthSeason]} {extraSeasonName} has 4 months
            </div>
            <div className="world-regions-tab__event-desc">
              {extraSeasonName} runs longer this year, shifting agricultural and trade planning across all regions.
            </div>
          </article>

          {YEAR_EVENTS.map((eventItem) => (
            <article key={eventItem.event} className="world-regions-tab__event-card">
              <div className="world-regions-tab__event-title">{eventItem.event}</div>
              <div className="world-regions-tab__event-desc">{eventItem.desc}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="world-regions-tab__systems-grid">
        <div className="world-regions-tab__systems-panel">
          <div className="world-regions-tab__section-title">World Systems</div>
          <div className="world-regions-tab__facts-grid">
            {WORLD_FACTS.map((fact) => (
              <article key={fact.title} className="world-regions-tab__fact-card">
                <div className="world-regions-tab__fact-icon">{fact.icon}</div>
                <div className="world-regions-tab__fact-title">{fact.title}</div>
                <div className="world-regions-tab__fact-body">{fact.body}</div>
              </article>
            ))}
          </div>
        </div>

        <div className="world-regions-tab__systems-panel">
          <div className="world-regions-tab__section-title">Trade & Tide Logistics</div>
          <div className="world-regions-tab__routes-list">
            {ROUTES.map((route) => (
              <article key={route.id} className="world-regions-tab__route-card">
                <div className="world-regions-tab__route-name">{route.name}</div>
                <div className="world-regions-tab__route-meta">
                  {route.distanceMiles.toLocaleString()} mi · {route.durationDaysMin}–{route.durationDaysMax} days
                </div>
                <div className="world-regions-tab__route-note">{route.note}</div>
              </article>
            ))}
          </div>
          <div className="world-regions-tab__rules-list">
            {MEGATIDE_JOURNEY_RULES.map((rule, index) => (
              <div key={index} className="world-regions-tab__rule-item">
                {rule}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="world-regions-tab__settlements">
        <div className="world-regions-tab__settlements-header">Settlement Directory</div>
        <div className="world-regions-tab__settlements-columns" role="presentation">
          <span>Settlement</span>
          <span>Kingdom</span>
          <span>Type</span>
        </div>
        {sortedSettlements.map((settlement, index) => (
          <div
            key={settlement.name}
            className={`world-regions-tab__settlement-row ${
              index % 2 === 1 ? "is-alt" : ""
            } ${index < sortedSettlements.length - 1 ? "has-divider" : ""}`}
            onMouseEnter={() => setHighlightKingdom(settlement.kingdom)}
            onMouseLeave={() => setHighlightKingdom(null)}
          >
            <div className="world-regions-tab__settlement-main">
              <span className="world-regions-tab__settlement-icon">
                {settlementIconByType[settlement.type] || "🏘️"}
              </span>
              <div className="world-regions-tab__settlement-name">{settlement.name}</div>
            </div>

            <div className="world-regions-tab__settlement-kingdom-cell">
              <span
                className="world-regions-tab__settlement-kingdom-dot"
                style={{ backgroundColor: kingdomColorByName[settlement.kingdom] || "#64748b" }}
              />
              <span className="world-regions-tab__settlement-kingdom">{settlement.kingdom}</span>
            </div>

            <span className={`world-regions-tab__settlement-type world-regions-tab__settlement-type--${settlement.type.replace(/\s+/g, "-").toLowerCase()}`}>
              {settlement.type}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
