// ============================================================
//  WORLD DATA — world worldbuilding constants
// ============================================================

export const SEASON_COLORS = {
  Spring: { bg:"#d4edda", accent:"#2d8a4e", pill:"#2d8a4e", text:"#1a5c33" },
  Summer: { bg:"#fff3cd", accent:"#c8860a", pill:"#c8860a", text:"#7a5100" },
  Autumn: { bg:"#ffe5cc", accent:"#c45a00", pill:"#c45a00", text:"#7a3500" },
  Winter: { bg:"#cce5ff", accent:"#1a5fa8", pill:"#1a5fa8", text:"#0d3f7a" },
};

export const TIDE_BADGE_COLORS = {
  Mega:     { bg:"#fca5a5", fg:"#7f1d1d" },
  High:     { bg:"#fdba74", fg:"#9a3412" },
  Moderate: { bg:"#fde68a", fg:"#78350f" },
  Low:      { bg:"#bfdbfe", fg:"#1e40af" },
};

export const WORLD_FACTS = [
  {
    icon: "🌙",
    title: "Major Moon",
    body: "Synodic period ~29.5 days, similar orbit to Earth's Moon (~384,000 km). Governs the monthly calendar.",
  },
  {
    icon: "🌛",
    title: "Weekly Moon",
    body: "Synodic period ~7.6 days, closer orbit (~155,000 km), smaller mass (~0.1 lunar). Governs the 7-day week.",
  },
  {
    icon: "🌊",
    title: "Mega-Tides",
    body: "When both moons align, extreme coastal flooding occurs. Ports are built high; shipping windows are timed to tide charts.",
  },
  {
    icon: "📅",
    title: "Calendar",
    body: "13 months × 30 days + 2 intercalary festival days = 392 days/year. Each season normally has 3 months; one season per year receives an extra 4th month.",
  },
  {
    icon: "🌾",
    title: "Agriculture",
    body: "Coastal floodplains are extraordinarily fertile. Farmers track weekly moon cycles to plan planting and harvest around tide surges.",
  },
  {
    icon: "⚓",
    title: "Maritime Culture",
    body: "Open-ocean crossings (~3,375 miles) take 2–4 weeks and are planned around tide windows and seasonal winds. Channel crossings remain shorter and tightly tide-timed.",
  },
];

export const KINGDOMS = [
  {
    name: "Western island confederacy",
    color: "#7C3AED",
    region: "Western islands",
    desc: "Fragmented maritime city-states. Master navigators and fishermen. Weekly moon culture dominates.",
    capital: "Western island capital",
    mapKey: "Western island confederacy",
  },
  {
    name: "Northwestern Island",
    color: "#EF4444",
    region: "Northwestern island",
    desc: "Remote, storm-battered island. Sparse settlements and hardy mariners.",
    capital: "Northwestern island port",
    mapKey: "Northwestern Island",
  },
  {
    name: "Southern gulf nation",
    color: "#ff1e00",
    region: "Eastern mainland – Southern gulf",
    desc: "The dominant civilization. Rich floodplain agriculture, protected bay, controls river trade.",
    capital: "Southern gulf capital",
    mapKey: "Southern gulf nation",
  },
  {
    name: "Northern inland realm",
    color: "#EC4899",
    region: "Eastern mainland – North",
    desc: "Oldest civilization, protected from tidal chaos. Scholarly and monastic culture. Freshwater lake.",
    capital: "Northern lake city",
    mapKey: "Northern inland realm",
  },
  {
    name: "Southeastern strait state",
    color: "#3B82F6",
    region: "Eastern mainland – SE peninsula",
    desc: "Controls the southeastern strait chokepoint. Wealthy from tolls. Semi-independent trading power.",
    capital: "Strait trade city",
    mapKey: "Southeastern strait state",
  },
];

export const KINGDOM_COLORS = {
  "Western island confederacy": "#7C3AED",
  "Northwestern Island":         "#EF4444",
  "Southern gulf nation":        "#ff1e00",
  "Northern inland realm":       "#EC4899",
  "Southeastern strait state":   "#3B82F6",
};

export const MARKER_COLORS = {
  "Capital": "#8B0000",  // Maroon
  "Port": "#FFD700",     // Yellow (gold)
  "Harbour Town": "#FF8C00",     // Orange (dark orange)
};

// x/y are % positions within the SVG viewBox (0–100)
export const SETTLEMENTS = [
  { name:"Western island cities",   type:"City",    x:22, y:25, kingdom:"Western island confederacy" },
  { name:"Channel hub",             type:"City",    x:43, y:47, kingdom:"Western island confederacy" },
  { name:"Southern harbor",         type:"City",    x:31, y:66, kingdom:"Western island confederacy" },
  { name:"Eastern heartland",       type:"City",    x:60, y:43, kingdom:"Southern gulf nation" },
  { name:"Southern gulf capital ★", type:"Capital", x:61, y:67, kingdom:"Southern gulf nation" },
  { name:"SE strait city",          type:"City",    x:88, y:47, kingdom:"Southeastern strait state" },
  { name:"Northern lake city",      type:"City",    x:81, y:18, kingdom:"Northern inland realm" },
  { name:"Western crossing port",   type:"Port",    x:45, y:50, kingdom:"Western island confederacy" },
  { name:"Eastern crossing port",   type:"Port",    x:52, y:66, kingdom:"Southern gulf nation" },
];

export const HARBORS = [
  { id: "west-crossing", name: "Western crossing port", tideOffset: 0, note: "Exposed channel surge" },
  { id: "east-crossing", name: "Eastern crossing port", tideOffset: 0, note: "Channel amplification" },
  { id: "gulf-capital", name: "Southern gulf capital", tideOffset: -1, note: "Sheltered gulf dampening" },
  { id: "southern-harbor", name: "Southern harbor", tideOffset: -1, note: "Cove sheltering" },
  { id: "strait-city", name: "Strait trade city", tideOffset: 1, note: "Narrow strait currents" },
];

export const ROUTES = [
  {
    id: "west-east-archipelago",
    name: "Western island capital → Southern gulf capital",
    distanceMiles: 3375,
    durationDaysMin: 14,
    durationDaysMax: 31,
    note: "Blue-water passage; requires resupply planning and weather luck.",
  },
  {
    id: "north-island-east-port",
    name: "Northern island city → Eastern port",
    distanceMiles: 180,
    durationDaysMin: 2,
    durationDaysMax: 4,
    note: "Island-hopping run with moderate currents.",
  },
  {
    id: "north-city-west-capital",
    name: "Northern city → Western capital",
    distanceMiles: 230,
    durationDaysMin: 3,
    durationDaysMax: 5,
    note: "Open coastal leg; best on Low/Moderate tides.",
  },
  {
    id: "gulf-strait",
    name: "Southern gulf capital → Strait trade city",
    distanceMiles: 420,
    durationDaysMin: 3,
    durationDaysMax: 6,
    note: "Coastal run hugging the peninsula; timing favors Moderate tides.",
  },
  {
    id: "channel-crossing",
    name: "Western crossing port → Eastern crossing port",
    distanceMiles: 62,
    durationDaysMin: 1,
    durationDaysMax: 2,
    note: "Fast when tides are Low/Moderate; delays during High/Mega.",
  },
];

export const MEGATIDE_JOURNEY_RULES = [
  "Mega tides close exposed harbors for 1–3 days; departures wait for calmer windows.",
  "High tides add risk: most captains delay long crossings until Moderate/Low conditions.",
  "Long routes gain 2–5 extra days if they must shelter during Mega surges.",
];

export const TIDE_GUIDE = [
  {
    level: "Mega",
    color: "#fca5a5",
    bg: "#7f1d1d",
    desc: "Moons within 1 day of alignment. Extreme flooding. No sailing. Sacred/feared event.",
  },
  {
    level: "High",
    color: "#fdba74",
    bg: "#9a3412",
    desc: "Within 3 days of alignment. Strong currents, dangerous for small craft.",
  },
  {
    level: "Moderate",
    color: "#fde68a",
    bg: "#78350f",
    desc: "Within 7 days. Normal caution. Standard shipping window.",
  },
  {
    level: "Low",
    color: "#bfdbfe",
    bg: "#1e3a5f",
    desc: "Moons far apart. Calm tides. Best sailing and coastal travel.",
  },
];

export const MOON_DATA = [
  {
    name: "The Major Moon",
    period: "29.5 days",
    orbit: "~384,000 km",
    mass: "1 lunar mass",
    role: "Governs months",
    icon: "🌕",
  },
  {
    name: "The Weekly Moon",
    period: "7.6 days",
    orbit: "~155,000 km",
    mass: "0.1 lunar mass",
    role: "Governs weeks",
    icon: "🌙",
  },
];

export const TABS = [
  { id:"calendar",  label:"📅 Calendar" },
  { id:"world",     label:"🌍 World & Regions" },
  { id:"moons",     label:"🌙 Moons" },
  { id:"sky",       label:"Night Sky" },
];
