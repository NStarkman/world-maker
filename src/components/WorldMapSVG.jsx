import { useCallback, useEffect, useRef, useState } from "react";
import { SETTLEMENTS, KINGDOM_COLORS, MARKER_COLORS } from "../data/worldData";
import "./WorldMapSVG.scss";

export const DEFAULT_WORLD_MAP_SRC = encodeURI(`${process.env.PUBLIC_URL}/World Map.svg`);
export const NEW_MAP_SRC = encodeURI(`${process.env.PUBLIC_URL}/newMap.svg`);
export const NEW_MAP_WITH_CHANNEL_SRC = encodeURI(`${process.env.PUBLIC_URL}/NewMap_with_channel.svg`);

export default function WorldMapSVG({ highlightKingdom = null}) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [mapStyle, setMapStyle] = useState("with-channel"); // "base" or "with-channel"
  const [mapLoadError, setMapLoadError] = useState({ map1: false, map2: false });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const activePointerIdRef = useRef(null);
  const viewportRef = useRef(null);
  const isPointerOverViewportRef = useRef(false);

  const currentMapSrc = mapStyle === "base" ? NEW_MAP_SRC : NEW_MAP_WITH_CHANNEL_SRC;
  const currentMapError = mapStyle === "base" ? mapLoadError.map1 : mapLoadError.map2;
  const canRenderCustomMap = !currentMapError;

  const clampZoom = (value) => Math.min(4, Math.max(1, value));

  const setZoomByDelta = useCallback((delta) => {
    setZoom((prevZoom) => {
      const bounded = clampZoom(prevZoom + delta);
      if (bounded === 1) setOffset({ x: 0, y: 0 });
      return bounded;
    });
  }, []);

  const startDrag = (event) => {
    if (zoom <= 1 || activePointerIdRef.current !== null) return;
    event.preventDefault();
    activePointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      x: event.clientX - offset.x,
      y: event.clientY - offset.y,
    };
  };

  const onDrag = (event) => {
    if (!isDragging || zoom <= 1 || event.pointerId !== activePointerIdRef.current) return;
    event.preventDefault();
    setOffset({
      x: event.clientX - dragStartRef.current.x,
      y: event.clientY - dragStartRef.current.y,
    });
  };

  const stopDrag = (event) => {
    if (event.pointerId !== activePointerIdRef.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    activePointerIdRef.current = null;
    setIsDragging(false);
  };

  const zoomIn = () => setZoomByDelta(0.2);
  const zoomOut = () => setZoomByDelta(-0.2);
  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleWindowWheel = (event) => {
      if (!isPointerOverViewportRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      const delta = event.deltaY < 0 ? 0.12 : -0.12;
      setZoomByDelta(delta);
    };

    window.addEventListener("wheel", handleWindowWheel, { passive: false, capture: true });

    return () => {
      window.removeEventListener("wheel", handleWindowWheel, { capture: true });
    };
  }, [setZoomByDelta]);

  return (
    <div className="world-map-svg">
      <div className="world-map-svg__map-wrapper">
        <div
          ref={viewportRef}
          onPointerEnter={() => {
            isPointerOverViewportRef.current = true;
          }}
          onPointerLeave={() => {
            isPointerOverViewportRef.current = false;
          }}
          onPointerDown={startDrag}
          onPointerMove={onDrag}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          className="world-map-svg__viewport"
          style={{
            "--map-cursor": zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
          }}
        >
        <div
          className="world-map-svg__content"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transition: isDragging ? "none" : "transform 0.08s ease-out",
          }}
        >
          {canRenderCustomMap ? (
            <img
              src={currentMapSrc}
              alt="World map"
              draggable={false}
              onDragStart={(event) => event.preventDefault()}
              onError={() => {
                if (mapStyle === "base") {
                  setMapLoadError(prev => ({ ...prev, map1: true }));
                } else {
                  setMapLoadError(prev => ({ ...prev, map2: true }));
                }
              }}
              className="world-map-svg__custom-image"
            />
          ) : (
            <>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="world-map-svg__depth-ring"
                  style={{
                    inset: `${i * 4}%`,
                    border: `1px solid rgba(255,255,255,${0.15 - i * 0.03})`,
                  }}
                />
              ))}

              <svg
                className="world-map-svg__fallback-svg"
                viewBox="0 0 100 50"
                preserveAspectRatio="none"
              >
                <ellipse cx="22" cy="25" rx="14" ry="18" fill="#e8eef4" opacity="0.9" />
                <ellipse cx="32" cy="14" rx="5" ry="4" fill="#e8eef4" opacity="0.85" />
                <ellipse cx="22" cy="40" rx="6" ry="4" fill="#e8eef4" opacity="0.85" />
                <ellipse cx="70" cy="30" rx="28" ry="20" fill="#e8eef4" opacity="0.9" />
                <ellipse cx="82" cy="12" rx="12" ry="8" fill="#e8eef4" opacity="0.85" />
                <ellipse cx="60" cy="40" rx="8" ry="5" fill="#b8d4e8" opacity="0.9" />
                <line
                  x1="46" y1="25" x2="48" y2="33"
                  stroke="#fbbf24" strokeWidth="0.4"
                  strokeDasharray="1 0.8" opacity="0.8"
                />
                {SETTLEMENTS.map((s, i) => {
                  const col = MARKER_COLORS[s.type] || "#555";
                  const dimmed = highlightKingdom && s.kingdom !== highlightKingdom;
                  const r = s.type === "Capital" ? 2.2 : s.type === "Port" ? 1.5 : 1.8;
                  return (
                    <g key={i} className="world-map-svg__settlement" opacity={dimmed ? 0.2 : 1}>
                      <circle cx={s.x} cy={s.y} r={r} fill={col} stroke="#fff" strokeWidth="0.5" />
                      {s.type === "Capital" && (
                        <circle cx={s.x} cy={s.y} r={r + 1.5} fill="none" stroke={col} strokeWidth="0.5" opacity="0.5" />
                      )}
                    </g>
                  );
                })}
              </svg>

              <div className="world-map-svg__label world-map-svg__label--west">
                Western<br />Islands
              </div>
              <div className="world-map-svg__label world-map-svg__label--east">
                Eastern Mainland
              </div>
              <div className="world-map-svg__label world-map-svg__label--channel">
                The Channel
              </div>
              <div className="world-map-svg__legend">
                {Object.entries(KINGDOM_COLORS).map(([k, c]) => (
                  <div key={k} className="world-map-svg__legend-row" style={{ color: c }}>
                    <span className="world-map-svg__legend-dot" style={{ background: c }} />
                    {k}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="world-map-svg__controls">
          <select 
            value={mapStyle} 
            onChange={(e) => setMapStyle(e.target.value)}
            className="world-map-svg__style-dropdown"
          >
            <option value="with-channel">With Markers</option>
            <option value="base">Without Markers</option>
          </select>
          <button type="button" onClick={zoomOut} className="world-map-svg__control-btn">−</button>
          <button type="button" onClick={zoomIn} className="world-map-svg__control-btn">+</button>
          <button type="button" onClick={resetView} className="world-map-svg__control-btn">Reset</button>
      </div>

      <div className="world-map-svg__zoom-indicator">
        {Math.round(zoom * 100)}%
      </div>
    </div>

    {/* Legend */}
    <div className="world-map-svg__color-legend">
        <h3 className="world-map-svg__legend-title">Settlement Types</h3>
        <div className="world-map-svg__legend-items">
          {Object.entries(MARKER_COLORS).map(([type, color]) => (
            <div 
              key={type} 
              className="world-map-svg__legend-item"
            >
              <span 
                className="world-map-svg__legend-marker" 
                style={{ backgroundColor: color }}
              />
              <span className="world-map-svg__legend-text">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
