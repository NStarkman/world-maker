import { tideLevel } from "../utils/calendarEngine";
import "./MoonOrbitViz.scss";

// Animated SVG showing both moons orbiting the planet
export default function MoonOrbitViz({ majorPhase, weeklyPhase, dayIndex = 0, caption = "Dual Moon Orbits" }) {
  const toAngle = (phase) => phase * 2 * Math.PI - Math.PI / 2;
  const cx = 90;
  const cy = 82;

  const MR = 68, WR = 42;
  const mAngle = toAngle(majorPhase);
  const wAngle = toAngle(weeklyPhase);

  const mx = cx + MR * Math.cos(mAngle);
  const my = cy + MR * Math.sin(mAngle);
  const wx = cx + WR * Math.cos(wAngle);
  const wy = cy + WR * Math.sin(wAngle);

  const alignment = Math.abs(majorPhase - weeklyPhase);
  const isPhaseAligned = alignment < 0.08 || alignment > 0.92;
  const tide = tideLevel(majorPhase, weeklyPhase, dayIndex);
  const isTidalAligned = tide === "Mega" || tide === "High";

  return (
    <svg
      className="moon-orbit-viz"
      width="180"
      height="214"
      aria-label="Dual moon orbit diagram"
    >
      {/* Orbit rings */}
      <circle className="moon-orbit-viz__ring moon-orbit-viz__ring--major" cx={cx} cy={cy} r={MR} />
      <circle className="moon-orbit-viz__ring moon-orbit-viz__ring--weekly" cx={cx} cy={cy} r={WR} />

      {/* Planet (sun analogue) */}
      <circle className="moon-orbit-viz__planet" cx={cx} cy={cy} r="8" />

      {/* Alignment warning pulse */}
      {isTidalAligned && (
        <circle className="moon-orbit-viz__pulse" cx={cx} cy={cy} r={MR + 8} />
      )}

      {/* Major moon */}
      <circle className="moon-orbit-viz__major-moon" cx={mx} cy={my} r="10" />

      {/* Weekly moon */}
      <circle className="moon-orbit-viz__weekly-moon" cx={wx} cy={wy} r="6" />

      {/* Label */}
      <text
        className="moon-orbit-viz__caption"
        x={cx} y="174"
      >
        {caption}
      </text>

      <text
        className="moon-orbit-viz__status"
        x={cx} y="189"
        fill={isPhaseAligned ? "#f59e0b" : "#64748b"}
        fontWeight={isPhaseAligned ? "700" : "500"}
      >
        {`Phase Alignment: ${isPhaseAligned ? "Near-line" : "Not close"}`}
      </text>

      <text
        className="moon-orbit-viz__status"
        x={cx} y="203"
        fill={isTidalAligned ? "#ef4444" : "#64748b"}
        fontWeight={isTidalAligned ? "700" : "500"}
      >
        {`Tide Alignment: ${tide}`}
      </text>
    </svg>
  );
}
