import { TABS, SEASON_COLORS } from "../data/worldData";
// import { SEASON_NAMES } from "../utils/calendarEngine";
import "./AppHeader.scss";

export default function AppHeader({
  year, yearInput, setYearInput, commitYear, incrementYear, decrementYear,
  extraMonthSeason, currentSeason, activeTab, setTab,
}) {
  const sc = SEASON_COLORS[currentSeason] || SEASON_COLORS.Spring;
  // const extraSeasonName = SEASON_NAMES[extraMonthSeason];

  return (
    <div className="app-header">
      {/* Brand */}
      <div className="app-header__brand-wrap">
        <div className="app-header__brand">
          ✦ Worldmaker
        </div>
        
      </div>

      {/* Year selector */}
      <div className="app-header__year-controls">
        <span className="app-header__year-label">
          Year
        </span>
        <button className="app-header__icon-btn" onClick={decrementYear} aria-label="Previous year">−</button>
        <input
          value={yearInput}
          onChange={e => setYearInput(e.target.value)}
          onBlur={commitYear}
          onKeyDown={e => e.key === "Enter" && commitYear()}
          className="app-header__year-input"
          aria-label="Year number"
        />
        <button className="app-header__icon-btn" onClick={incrementYear} aria-label="Next year">+</button>
      </div>

      {/* Tab navigation */}
      <nav className="app-header__tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`app-header__tab-btn ${activeTab === t.id ? "is-active" : ""}`}
            style={{
              "--tab-accent": sc.accent,
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
