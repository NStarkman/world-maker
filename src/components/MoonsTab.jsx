import TideBadge from "../components/TideBadge";
import { TIDE_GUIDE, MOON_DATA } from "../data/worldData";
import { MOON_ICONS } from "../utils/calendarEngine";
import "./MoonsTab.scss";

export default function MoonsTab() {
  return (
    <div className="moons-tab">
      <h2 className="moons-tab__title">
        Dual Moon System
      </h2>
      <p className="moons-tab__subtitle">
        Two moons create complex tide patterns, variable night illumination, and drive the entire calendar system.
      </p>

      {/* Moon cards */}
      <div className="moons-tab__moon-cards">
        {MOON_DATA.map(m => (
          <div key={m.name} className="moons-tab__moon-card">
            <div className="moons-tab__moon-icon">{m.icon}</div>
            <div className="moons-tab__moon-name">{m.name}</div>
            {[
              ["Synodic Period",    m.period],
              ["Orbital Distance",  m.orbit],
              ["Mass",              m.mass],
              ["Calendar Role",     m.role],
            ].map(([k, v]) => (
              <div key={k} className="moons-tab__moon-row">
                <span className="moons-tab__moon-row-key">{k}</span>
                <span className="moons-tab__moon-row-value">{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Tide guide */}
      <div className="moons-tab__panel">
        <div className="moons-tab__panel-title">
          Tide Classification
        </div>
        <div className="moons-tab__tide-grid">
          {TIDE_GUIDE.map(t => (
            <div key={t.level} className="moons-tab__tide-card" style={{
              background: `${t.bg}33`,
              border: `1px solid ${t.color}44`,
            }}>
              <TideBadge tide={t.level} />
              <div className="moons-tab__tide-desc">
                {t.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase guide */}
      <div className="moons-tab__panel">
        <div className="moons-tab__panel-title">
          Moon Phase Guide
        </div>
        <div className="moons-tab__phase-grid">
          {Object.entries(MOON_ICONS).map(([phase, icon]) => (
            <div key={phase} className="moons-tab__phase-item">
              <div className="moons-tab__phase-icon">{icon}</div>
              <div className="moons-tab__phase-name">{phase}</div>
            </div>
          ))}
        </div>
        <div className="moons-tab__phase-note">
          When both moons show 🌕 simultaneously — the rare{" "}
          <strong className="moons-tab__phase-highlight">Dual-Full Festival</strong> occurs.<br />
          These nights are the brightest of the year, celebrated across all regions.
        </div>
      </div>
    </div>
  );
}
