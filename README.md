# The World Worldbuilder

A React worldbuilding companion app for the The World dual-moon world.

## Quick Start

### Option A — Drop into an existing CRA project
1. Run `npx create-react-app The World` (skip if you already have a CRA app).
2. Replace the contents of `src/` with the files from this package.
3. Replace `package.json` with the one provided (no extra dependencies needed).
4. Run `npm install && npm start`.

### Option B — Use this folder directly
```bash
cd The World
npm install
npm start
```

The app will open at http://localhost:3000.

---

## File Structure

```
The World/
├── public/
│   └── index.html          (standard CRA file — unchanged)
├── src/
│   ├── index.js            Entry point
│   ├── index.css           Global reset + Google Font import
│   ├── App.js              Root component — tab routing + layout
│   │
│   ├── hooks/
│   │   └── useCalendar.js  Year/month state + calendar generation
│   │
│   ├── utils/
│   │   └── calendarEngine.js  Pure calendar logic (ported from Python)
│   │
│   ├── data/
│   │   └── worldData.js    World constants: kingdoms, settlements, facts
│   │
│   └── components/
│       ├── AppHeader.jsx       Sticky header — year selector + tab nav
│       ├── CalendarGrid.jsx    7-column calendar month view
│       ├── CalendarTab.jsx     Full calendar page
│       ├── KingdomsTab.jsx     Kingdoms + events page
│       ├── MoonsTab.jsx        Moon system reference page
│       ├── MoonOrbitViz.jsx    SVG orbit diagram
│       ├── TideBadge.jsx       Coloured tide pill badge
│       ├── WorldMapSVG.jsx     Abstract SVG world map
│       └── WorldTab.jsx        World overview page
└── package.json
```

---

## How the Calendar Works

- **13 months × 30 days** + 2 intercalary festival days = 392 days/year
- **7-day weeks** governed by the Weekly Moon (7.6-day synodic period)
- **Extra month rule**: `year % 4` determines which season gets a 4th month
  - Year % 4 === 0 → Spring gets 4 months
  - Year % 4 === 1 → Summer gets 4 months
  - Year % 4 === 2 → Autumn gets 4 months
  - Year % 4 === 3 → Winter gets 4 months
- **Tides** are computed from the phase difference of both moons

## Extending the App

| What to change | Where |
|---|---|
| Month / weekday names | `src/utils/calendarEngine.js` |
| Add kingdoms | `src/data/worldData.js` → `KINGDOMS` array |
| Add settlements to map | `src/data/worldData.js` → `SETTLEMENTS` array |
| Change tide thresholds | `src/utils/calendarEngine.js` → `tideLevel()` |
| Add new events | `src/utils/calendarEngine.js` → `eventForDay()` |
| Add a new tab | `src/data/worldData.js` → `TABS`, then add in `App.js` |
| Swap in real map image | Replace `WorldMapSVG.jsx` with an `<img>` + overlay |
