import React, { useEffect, useRef } from 'react';
import { Maximize2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { liveCar } from '../store/liveTelemetry';
import { IslandMapSvg } from './IslandMapSvg';
import { soundManager } from '../utils/audio';

/**
 * Compact miniature island minimap in the bottom-right HUD. Expands on click.
 */
export const CornerRadar: React.FC = React.memo(() => {
  const visitedZones = useStore((s) => s.visitedZones);
  const collectedTokens = useStore((s) => s.collectedTokens);
  const activeZone = useStore((s) => s.activeZone);
  const approachedZone = useStore((s) => s.approachedZone);
  const guidedZone = useStore((s) => s.guidedZone);
  const toggleMinimap = useStore((s) => s.toggleMinimap);

  const carArrowRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      if (!carArrowRef.current) return;
      const deg = -(liveCar.angle * 180) / Math.PI;
      carArrowRef.current.setAttribute(
        'transform',
        `translate(${liveCar.x.toFixed(2)}, ${liveCar.z.toFixed(2)}) rotate(${deg.toFixed(1)})`
      );
    }, 50);
    return () => clearInterval(id);
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        toggleMinimap();
        soundManager.playClick();
      }}
      aria-label="Expand Island Map"
      title="Expand Island Map [M]"
      className="group relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl hud-surface p-1.5 flex items-center justify-center cursor-pointer hover:border-[#43D9F5]/50 transition-colors"
    >
      <IslandMapSvg
        carArrowRef={carArrowRef}
        visitedZones={visitedZones}
        collectedTokens={collectedTokens}
        activeZone={activeZone}
        approachedZone={approachedZone}
        guidedZoneId={guidedZone}
        compact
      />

      <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[#0B1420]/90 border border-white/10 font-mono text-[9px] font-semibold text-[#9AAFC2] flex items-center gap-1 group-hover:text-[#43D9F5] group-hover:border-[#43D9F5]/40 transition-colors">
        <Maximize2 className="w-2.5 h-2.5" /> M
      </span>
    </button>
  );
});
