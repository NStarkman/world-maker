import { useState } from "react";
import { useCalendar } from "./hooks/useCalendar";
import "./App.scss";

import AppHeader    from "./components/AppHeader";
import CalendarTab  from "./components/CalendarTab";
import WorldRegionsTab from "./components/WorldRegionsTab";
import MoonsTab     from "./components/MoonsTab";
import NightSkyTab  from "./components/NightSkyTab";

export default function App() {
  const [tab, setTab] = useState("calendar");

  const {
    year, yearInput, setYearInput, commitYear, incrementYear, decrementYear,
    currentMonth, setCurrentMonth, goToNextMonth, goToPrevMonth,
    rows, monthData, extraMonthSeason, seasonMap,
  } = useCalendar();

  const currentSeason = seasonMap[currentMonth] || "Spring";

  const seasonBgGradient = {
    Spring: "linear-gradient(135deg, #0b1220, #0f1f18)",
    Summer: "linear-gradient(135deg, #0b1220, #1f1a0f)",
    Autumn: "linear-gradient(135deg, #0b1220, #21160f)",
    Winter: "linear-gradient(135deg, #0b1220, #121a2a)",
  }[currentSeason];

  return (
    <div
      className="app-shell"
      style={{ "--season-bg": seasonBgGradient }}
    >
      <AppHeader
        year={year}
        yearInput={yearInput}
        setYearInput={setYearInput}
        commitYear={commitYear}
        incrementYear={incrementYear}
        decrementYear={decrementYear}
        extraMonthSeason={extraMonthSeason}
        currentSeason={currentSeason}
        activeTab={tab}
        setTab={setTab}
      />

      {tab === "calendar" && (
        <CalendarTab
          year={year}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          goToNextMonth={goToNextMonth}
          goToPrevMonth={goToPrevMonth}
          rows={rows}
          monthData={monthData}
          seasonMap={seasonMap}
          extraMonthSeason={extraMonthSeason}
        />
      )}

      {tab === "world"    && (
        <WorldRegionsTab year={year} extraMonthSeason={extraMonthSeason} />
      )}
      {tab === "moons"    && <MoonsTab />}
      {tab === "sky"      && (
        <NightSkyTab
          year={year}
          currentMonth={currentMonth}
          monthData={monthData}
        />
      )}
    </div>
  );
}
