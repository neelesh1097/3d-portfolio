import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { livePerf } from '../store/liveTelemetry';
import { Activity, X } from 'lucide-react';

/**
 * Developer-only WebGL & frame performance overlay (hidden in production by default).
 */
export const PerfMonitor: React.FC = () => {
  const showPerfPanel = useStore((s) => s.showPerfPanel);
  const togglePerfPanel = useStore((s) => s.togglePerfPanel);
  const qualityLevel = useStore((s) => s.qualityLevel);
  const [snap, setSnap] = useState({ ...livePerf });

  useEffect(() => {
    if (!showPerfPanel) return;
    const id = setInterval(() => {
      setSnap({ ...livePerf });
    }, 350);
    return () => clearInterval(id);
  }, [showPerfPanel]);

  if (!import.meta.env.DEV && !showPerfPanel) return null;
  if (!showPerfPanel) return null;

  const fpsColor =
    snap.fps >= 50 ? 'text-[#43D9F5]' : snap.fps >= 30 ? 'text-[#F5B84B]' : 'text-rose-400';

  return (
    <div className="fixed top-20 left-3 sm:left-5 z-30 pointer-events-auto w-56 rounded-xl bg-[#0B1420]/92 border border-white/10 shadow-xl p-3 text-[11px] font-mono text-[#F4F7FA] select-none">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
        <span className="flex items-center gap-1.5 font-semibold text-[#43D9F5]">
          <Activity className="w-3.5 h-3.5" /> PERF [{qualityLevel.toUpperCase()}]
        </span>
        <button
          type="button"
          aria-label="Close performance monitor"
          onClick={togglePerfPanel}
          className="text-[#9AAFC2] hover:text-[#F4F7FA] cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-[#9AAFC2]">FPS</span>
          <span className={`font-bold ${fpsColor}`}>{snap.fps}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9AAFC2]">Frame Time</span>
          <span>{snap.frameTimeMs.toFixed(1)} ms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9AAFC2]">Draw Calls</span>
          <span className="text-[#43D9F5] font-semibold">{snap.drawCalls}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9AAFC2]">Triangles</span>
          <span>{snap.triangles.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9AAFC2]">Geometries</span>
          <span>{snap.geometries}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9AAFC2]">Textures</span>
          <span>{snap.textures}</span>
        </div>
        {snap.jsHeapMb > 0 && (
          <div className="flex justify-between">
            <span className="text-[#9AAFC2]">JS Heap</span>
            <span>{snap.jsHeapMb} MB</span>
          </div>
        )}
      </div>
      <div className="mt-2 pt-1.5 border-t border-white/10 text-[9px] text-[#9AAFC2]">
        Press [P] to toggle
      </div>
    </div>
  );
};

