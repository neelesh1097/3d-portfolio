import React from 'react';
import type { DayMode } from '../engine/DayCycles';

export interface MapSpot {
  id: string;
  label: string;
  short: string;
  x: number;
  z: number;
  color: string;
}

export const MAP_SPOTS: MapSpot[] = [
  { id: 'landing', label: 'Spawn Hub (Neelesh)', short: 'HUB', x: 41.0, z: 38.6, color: '#43D9F5' },
  { id: 'circuit', label: 'Grand Prix Circuit', short: 'GP', x: -15.5, z: 26.0, color: '#ff903f' },
  { id: 'bowling', label: 'Bowling Alley', short: 'BWL', x: 21.3, z: 62.22, color: '#ec4899' },
  { id: 'cookie', label: 'Cookie Stand', short: 'CKI', x: 15.64, z: 36.38, color: '#f59e0b' },
  { id: 'bridge', label: 'Lagoon Bridge', short: 'BRG', x: 52.25, z: 26.2, color: '#5bc2b9' },
  { id: 'altar', label: 'Stone Altar', short: 'ALT', x: 74.79, z: -14.08, color: '#ef4444' },
  { id: 'toilet', label: 'Outhouse Trail', short: 'W.C', x: 70.91, z: 66.02, color: '#a3e635' },
  { id: 'achievements', label: 'Waterfall Cove', short: 'WTR', x: 70.0, z: 20.36, color: '#38bdf8' },
  { id: 'timeMachine', label: 'Time Machine', short: 'TM', x: -56.49, z: -64.74, color: '#8b5cf6' },
  { id: 'behindTheScene', label: 'Studio Stage', short: 'BTS', x: 48.82, z: -11.47, color: '#f472b6' },
];

interface IslandMapSvgProps {
  carArrowRef?: React.RefObject<SVGGElement | null>;
  selectedSpotId?: string | null;
  dayMode?: DayMode;
  compact?: boolean;
  onSelectSpot?: (spot: MapSpot) => void;
}

export const IslandMapSvg: React.FC<IslandMapSvgProps> = React.memo(
  ({ carArrowRef, selectedSpotId, dayMode = 'day', compact = false, onSelectSpot }) => {
    const mapSrc =
      dayMode === 'night' ? '/assets/ui/map/map-night.png' : '/assets/ui/map/map-day.png';

    return (
      <svg
        viewBox="-96 -96 192 192"
        className="w-full h-full select-none rounded-lg overflow-hidden"
        role="img"
        aria-label="Full Stack Island map"
      >
        <image href={mapSrc} x="-96" y="-96" width="192" height="192" preserveAspectRatio="xMidYMid slice" />

        {MAP_SPOTS.map((spot) => {
          const isSelected = selectedSpotId === spot.id;
          return (
            <g
              key={spot.id}
              transform={`translate(${spot.x}, ${spot.z})`}
              onClick={onSelectSpot ? () => onSelectSpot(spot) : undefined}
              className={onSelectSpot ? 'cursor-pointer' : undefined}
            >
              {isSelected && (
                <circle r={compact ? 8 : 9.5} fill="none" stroke="#F5B84B" strokeWidth={1.8} />
              )}
              <circle
                r={compact ? 4.2 : 4.8}
                fill="#0B1420"
                fillOpacity={0.9}
                stroke={spot.color}
                strokeWidth={compact ? 1.5 : 1.8}
              />
              {!compact && (
                <text
                  y={10.5}
                  textAnchor="middle"
                  fill="#F4F7FA"
                  fontSize="5.2"
                  fontWeight="700"
                  fontFamily="monospace"
                  style={{ paintOrder: 'stroke', stroke: '#0B1420', strokeWidth: 2 }}
                >
                  {spot.short}
                </text>
              )}
            </g>
          );
        })}

        {/* Live vehicle marker */}
        <g ref={carArrowRef} transform="translate(39.53, 37.83)">
          <circle r={compact ? 6.5 : 6.2} fill="#43D9F5" fillOpacity={0.28} />
          <polygon
            points="0,-5.4 4.2,4.4 0,2.2 -4.2,4.4"
            fill="#43D9F5"
            stroke="#0B1420"
            strokeWidth={1.1}
          />
        </g>
      </svg>
    );
  }
);
