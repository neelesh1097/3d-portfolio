import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { ZONES } from '../../data/portfolio';
import { X, Navigation, Compass, RotateCcw } from 'lucide-react';
import { soundManager } from '../../utils/audio';

export const MinimapModal: React.FC = () => {
  const { isMinimapOpen, toggleMinimap, carPosition, carRotation, teleportTo, resetCar } = useStore();

  if (!isMinimapOpen) return null;

  // Convert 3D world coordinates ([-90..90, -90..90]) to map percentage ([0..100%])
  const toMapCoords = (x: number, z: number) => {
    const mapSize = 180;
    const px = ((x + 90) / mapSize) * 100;
    const py = ((z + 90) / mapSize) * 100;
    return { x: px, y: py };
  };

  const carCoords = toMapCoords(carPosition[0], carPosition[2]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-xl bg-slate-900 border border-sky-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <Compass className="w-5 h-5" />
              <span>Satellite GPS Radar</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  resetCar();
                  toggleMinimap();
                  soundManager.playClick();
                }}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Respawn
              </button>
              <button
                onClick={() => {
                  toggleMinimap();
                  soundManager.playClick();
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tactical Map Area */}
          <div className="relative w-full aspect-square bg-[#0b0f19] p-6 flex items-center justify-center overflow-hidden border-b border-slate-800">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-60" />

            {/* Radar Circular Scan Lines */}
            <div className="absolute inset-8 rounded-full border border-sky-500/20 pointer-events-none" />
            <div className="absolute inset-20 rounded-full border border-sky-500/10 pointer-events-none" />

            {/* Zones on Map */}
            {ZONES.map((zone) => {
              const { x, y } = toMapCoords(zone.position[0], zone.position[2]);
              return (
                <div
                  key={zone.id}
                  onClick={() => {
                    teleportTo(zone.position, zone.id);
                    toggleMinimap();
                    soundManager.playAchievement();
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 border-2 border-white/80"
                    style={{ backgroundColor: zone.color }}
                  >
                    <span className="text-[10px] font-bold text-slate-950 font-mono">
                      {zone.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-white mt-1 px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-800 whitespace-nowrap shadow">
                    {zone.name}
                  </span>
                </div>
              );
            })}

            {/* Car Player Blip with Direction Arrow */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-100"
              style={{ left: `${carCoords.x}%`, top: `${carCoords.y}%` }}
            >
              <div
                className="w-5 h-5 rounded-full bg-cyan-400 border-2 border-white shadow-xl shadow-cyan-400 flex items-center justify-center animate-pulse"
                style={{ transform: `rotate(${-carRotation}rad)` }}
              >
                <Navigation className="w-3 h-3 text-slate-950 fill-current" />
              </div>
            </div>
          </div>

          {/* Quick Instructions */}
          <div className="p-3 bg-slate-950/60 text-center text-xs text-slate-400">
            Click on any zone marker to immediately teleport your vehicle there.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
