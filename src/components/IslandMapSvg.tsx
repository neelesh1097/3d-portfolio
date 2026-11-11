import React, { useMemo } from 'react';
import { ZONES, DEVELOPER_TOKENS } from '../data/portfolio';
import { ZoneInfo } from '../types';
import { getIslandShoreRadius } from '../world/terrainBuilder';

interface IslandMapSvgProps {
  carPosition?: [number, number, number];
  carRotation?: number;
  isBoosting?: boolean;
  carArrowRef?: React.RefObject<SVGGElement | null>;
  visitedZones: string[];
  collectedTokens: Record<string, boolean>;
  activeZone: string | null;
  approachedZone: string | null;
  guidedZoneId?: string | null;
  selectedZoneId?: string | null;
  showTokens?: boolean;
  compact?: boolean;
  onSelectZone?: (zone: ZoneInfo) => void;
}

const ZONE_SHORT: Record<string, string> = {
  spawn: 'HUB',
  about: 'ABT',
  frontend: 'FE',
  backend: 'BE',
  database: 'DB',
  devops: 'OPS',
  projects: 'PRJ',
  experience: 'EXP',
  contact: 'MSG',
};

/**
 * Minimal architectural vector map accurately reflecting the 3D Full Stack Island coordinates.
 */
export const IslandMapSvg: React.FC<IslandMapSvgProps> = React.memo(
  ({
    carPosition = [0, 0.48, 0],
    carRotation = 0,
    isBoosting = false,
    carArrowRef,
    visitedZones,
    collectedTokens,
    activeZone,
    approachedZone,
    guidedZoneId,
    selectedZoneId,
    showTokens = true,
    compact = false,
    onSelectZone,
  }) => {
    const carHeadingDeg = -(carRotation * 180) / Math.PI;
    const cx = carPosition[0];
    const cz = carPosition[2];
    const guidedZone = guidedZoneId ? ZONES.find((z) => z.id === guidedZoneId) : null;

    const shorePath = useMemo(() => {
      const pts: string[] = [];
      const steps = 64;
      for (let i = 0; i < steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        const r = getIslandShoreRadius(a);
        const x = (Math.cos(a) * r).toFixed(2);
        const y = (Math.sin(a) * r).toFixed(2);
        pts.push(`${i === 0 ? 'M' : 'L'}${x},${y}`);
      }
      return `${pts.join(' ')} Z`;
    }, []);

    return (
      <svg
        viewBox="-54 -54 108 108"
        className="w-full h-full select-none overflow-visible"
        aria-label="Full Stack Island Map"
      >
        {/* Ocean surface */}
        <circle cx="0" cy="0" r="53" fill="#0B1420" />
        <path
          d={shorePath}
          transform="scale(1.06)"
          fill="none"
          stroke="rgba(67, 217, 245, 0.14)"
          strokeWidth="0.6"
          strokeDasharray="2.5 2.5"
        />

        {/* Organic Island landmass contour */}
        <path
          d={shorePath}
          fill="#14263A"
          stroke="rgba(255, 255, 255, 0.14)"
          strokeWidth="0.6"
        />
        <path d={shorePath} transform="scale(0.88)" fill="#1B3045" opacity="0.65" />

        {/* Coordinate crosshairs */}
        <g opacity="0.16" stroke="#9AAFC2" strokeWidth="0.28">
          <line x1="-40" y1="-20" x2="40" y2="-20" />
          <line x1="-40" y1="20" x2="40" y2="20" />
          <line x1="-20" y1="-40" x2="-20" y2="40" />
          <line x1="20" y1="-40" x2="20" y2="40" />
        </g>

        {/* Diagonal boulevard connectors */}
        <line x1="-23" y1="-23" x2="23" y2="23" stroke="#0B1420" strokeWidth="3.8" />
        <line x1="23" y1="-23" x2="-23" y2="23" stroke="#0B1420" strokeWidth="3.8" />

        {/* Cross avenues (N-S & E-W) */}
        <rect x="-2.4" y="-31" width="4.8" height="62" rx="1.2" fill="#0B1420" />
        <rect x="-31" y="-2.4" width="62" height="4.8" rx="1.2" fill="#0B1420" />

        {/* Ring road */}
        <circle cx="0" cy="0" r="20" fill="none" stroke="#0B1420" strokeWidth="5.4" />
        <circle
          cx="0"
          cy="0"
          r="20"
          fill="none"
          stroke="rgba(244, 247, 250, 0.28)"
          strokeWidth="0.4"
          strokeDasharray={compact ? undefined : '2.0 1.8'}
        />

        {/* Central Hub roundabout */}
        <circle cx="0" cy="0" r="7.4" fill="#0B1420" stroke="rgba(67, 217, 245, 0.45)" strokeWidth="0.6" />

        {/* Guided Waypoint Route Line */}
        {!compact && guidedZone && (
          <line
            x1={cx}
            y1={cz}
            x2={guidedZone.position[0]}
            y2={guidedZone.position[2]}
            stroke="#F5B84B"
            strokeWidth="0.65"
            strokeDasharray="1.8 1.4"
            opacity="0.85"
          />
        )}

        {/* Collectible Tokens */}
        {showTokens &&
          !compact &&
          DEVELOPER_TOKENS.map((token) => {
            const collected = Boolean(collectedTokens[token.id]);
            return (
              <g key={token.id} transform={`translate(${token.position[0]}, ${token.position[2]})`}>
                <polygon
                  points="0,-1.4 1.2,0 0,1.4 -1.2,0"
                  fill={collected ? '#1B3045' : '#F5B84B'}
                  stroke={collected ? 'rgba(255,255,255,0.12)' : '#F4F7FA'}
                  strokeWidth="0.28"
                  opacity={collected ? 0.5 : 0.9}
                />
              </g>
            );
          })}

        {/* Zones */}
        {ZONES.map((zone) => {
          const [zx, , zz] = zone.position;
          const isVisited = visitedZones.includes(zone.id);
          const isCurrent = (approachedZone || activeZone) === zone.id;
          const isSelected = selectedZoneId === zone.id;
          const isGuided = guidedZoneId === zone.id;
          const isSpawn = zone.id === 'spawn';
          const r = compact ? (isSpawn ? 2.6 : 3.5) : isSpawn ? 3.4 : 4.3;

          const ringColor = isGuided
            ? '#F5B84B'
            : isSelected || isCurrent
              ? '#43D9F5'
              : isVisited
                ? 'rgba(244, 247, 250, 0.45)'
                : 'rgba(255, 255, 255, 0.16)';

          return (
            <g
              key={zone.id}
              transform={`translate(${zx}, ${zz})`}
              onClick={onSelectZone ? () => onSelectZone(zone) : undefined}
              className={onSelectZone ? 'cursor-pointer' : undefined}
            >
              {(isSelected || isGuided || isCurrent) && (
                <circle
                  cx="0"
                  cy="0"
                  r={r + 1.8}
                  fill="none"
                  stroke={isGuided ? '#F5B84B' : '#43D9F5'}
                  strokeWidth="0.6"
                  strokeDasharray="1.6 1.1"
                />
              )}

              <circle
                cx="0"
                cy="0"
                r={r}
                fill={isSelected ? '#43D9F5' : isGuided ? '#F5B84B' : '#14263A'}
                stroke={ringColor}
                strokeWidth={isSelected || isGuided ? 0.85 : 0.65}
              />

              <text
                x="0"
                y={compact ? '1.0' : '1.1'}
                textAnchor="middle"
                fill={isSelected || isGuided ? '#0B1420' : isCurrent ? '#43D9F5' : '#F4F7FA'}
                fontSize={compact ? '2.4' : '2.6'}
                fontWeight="700"
                fontFamily="JetBrains Mono, monospace"
                pointerEvents="none"
              >
                {ZONE_SHORT[zone.id] || zone.name.slice(0, 2).toUpperCase()}
              </text>

              {!compact && !isSpawn && (
                <g transform={`translate(0, ${zz < -26 ? -6.5 : 7.0})`} pointerEvents="none">
                  <rect
                    x="-11.5"
                    y="-2.2"
                    width="23"
                    height="4.2"
                    rx="1.2"
                    fill="#0B1420"
                    stroke={isSelected || isGuided ? ringColor : 'rgba(255, 255, 255, 0.12)'}
                    strokeWidth="0.32"
                  />
                  <text
                    x="0"
                    y="0.7"
                    textAnchor="middle"
                    fill={isSelected || isCurrent ? '#43D9F5' : isGuided ? '#F5B84B' : '#F4F7FA'}
                    fontSize="2.25"
                    fontWeight="600"
                    fontFamily="Inter, sans-serif"
                  >
                    {zone.name}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Player Vehicle Directional Arrow */}
        <g ref={carArrowRef} transform={`translate(${cx}, ${cz}) rotate(${carHeadingDeg})`} pointerEvents="none">
          <circle
            cx="0"
            cy="0"
            r={isBoosting ? 4.2 : 3.2}
            fill={isBoosting ? '#F5B84B' : '#43D9F5'}
            opacity="0.22"
          />
          <polygon
            points="0,3.2 -2.2,-2.1 0,-1.0 2.2,-2.1"
            fill={isBoosting ? '#F5B84B' : '#43D9F5'}
            stroke="#F4F7FA"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
        </g>

        {/* Cardinal Compass Letters */}
        {!compact && (
          <g fill="#9AAFC2" fontSize="3.0" fontWeight="600" fontFamily="JetBrains Mono, monospace" opacity="0.7">
            <text x="0" y="-47.6" textAnchor="middle">N</text>
            <text x="0" y="49.8" textAnchor="middle">S</text>
            <text x="48.8" y="1.0" textAnchor="middle">E</text>
            <text x="-48.8" y="1.0" textAnchor="middle">W</text>
          </g>
        )}
      </svg>
    );
  }
);
