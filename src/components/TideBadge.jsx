import { TIDE_BADGE_COLORS } from "../data/worldData";

export default function TideBadge({ tide }) {
  const colors = TIDE_BADGE_COLORS[tide] || { bg:"#e2e8f0", fg:"#334155" };
  return (
    <span style={{
      background: colors.bg,
      color: colors.fg,
      fontSize: "10px",
      fontWeight: 700,
      padding: "1px 6px",
      borderRadius: "999px",
      letterSpacing: "0.05em",
      display: "inline-block",
    }}>
      {tide}
    </span>
  );
}
