import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import { liveCar } from '../../store/liveTelemetry';
import { Navigation, RotateCcw, MapPin } from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { IslandMapSvg, MAP_SPOTS, MapSpot } from '../IslandMapSvg';
import { ModalShell } from '../ui/ModalShell';

const MinimapModalInner: React.FC = () => {
  const toggleMinimap = useStore((s) => s.toggleMinimap);
  const teleportToSpot = useStore((s) => s.teleportToSpot);
  const resetCar = useStore((s) => s.resetCar);
  const dayMode = useStore((s) => s.dayMode);

  const [selectedSpot, setSelectedSpot] = useState<MapSpot>(MAP_SPOTS[0]);
  const [carSnap, setCarSnap] = useState(() => ({
    x: liveCar.x,
    z: liveCar.z,
    angle: liveCar.angle,
    speed: liveCar.speed,
  }));

  const carArrowRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setCarSnap({
        x: liveCar.x,
        z: liveCar.z,
        angle: liveCar.angle,
        speed: liveCar.speed,
      });
      if (carArrowRef.current) {
        const deg = -(liveCar.angle * 180) / Math.PI + 90;
        carArrowRef.current.setAttribute(
          'transform',
          `translate(${liveCar.x.toFixed(2)}, ${liveCar.z.toFixed(2)}) rotate(${deg.toFixed(1)})`
        );
      }
    }, 60);
    return () => clearInterval(id);
  }, []);

  const getDistance = (spot: MapSpot) =>
    Math.round(Math.hypot(spot.x - carSnap.x, spot.z - carSnap.z));

  const handleTeleport = (spot: MapSpot) => {
    teleportToSpot(spot.id);
    toggleMinimap();
    soundManager.playAchievement();
  };

  return (
    <ModalShell
      onClose={() => {
        toggleMinimap();
        soundManager.playClick();
      }}
      eyebrow="Full Stack Island"
      title="Island Navigation Map"
      subtitle={`POS (${Math.round(carSnap.x)}, ${Math.round(carSnap.z)}) • ${MAP_SPOTS.length} Landmarks`}
      maxWidthClass="max-w-5xl"
      headerRight={
        <button
          type="button"
          onClick={() => {
            resetCar();
            toggleMinimap();
            soundManager.playClick();
          }}
          className="px-3 py-1.5 rounded-lg bg-[#14263A] hover:bg-[#1B3045] border border-white/10 text-xs font-medium text-[#F4F7FA] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#43D9F5]" /> Reset
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        <div className="md:col-span-7 bg-[#0B1420] border border-white/10 rounded-xl p-3">
          <div className="aspect-square max-h-[430px] mx-auto">
            <IslandMapSvg
              carArrowRef={carArrowRef}
              selectedSpotId={selectedSpot.id}
              dayMode={dayMode}
              onSelectSpot={(spot) => {
                setSelectedSpot(spot);
                soundManager.playClick();
              }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-white/10 text-[11px] text-[#9AAFC2]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#43D9F5]" />
                Vehicle ({carSnap.speed} km/h)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F5B84B]" />
                Selected Spot
              </span>
            </div>
            <span>Click any marker or card to teleport</span>
          </div>
        </div>

        <div className="md:col-span-5 flex flex-col gap-3">
          <div className="p-4 rounded-xl bg-[#14263A] border border-white/10 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-lg bg-[#0B1420] border flex items-center justify-center shrink-0"
                  style={{ borderColor: `${selectedSpot.color}66`, color: selectedSpot.color }}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-display text-sm font-bold text-[#F4F7FA]">
                    {selectedSpot.label}
                  </div>
                  <div className="text-xs font-mono text-[#9AAFC2]">
                    ({Math.round(selectedSpot.x)}, {Math.round(selectedSpot.z)})
                  </div>
                </div>
              </div>
              <span className="font-mono text-xs text-[#43D9F5] bg-[#0B1420] px-2 py-0.5 rounded border border-white/10">
                {getDistance(selectedSpot)}m
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleTeleport(selectedSpot)}
              className="w-full py-2 px-3 rounded-lg bg-[#43D9F5] hover:bg-[#5ce1f8] text-[#0B1420] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" /> Teleport Here
            </button>
          </div>

          <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
            {MAP_SPOTS.map((spot) => {
              const isSelected = selectedSpot.id === spot.id;
              return (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => {
                    setSelectedSpot(spot);
                    soundManager.playClick();
                  }}
                  onDoubleClick={() => handleTeleport(spot)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#1B3045] border-[#43D9F5]/50'
                      : 'bg-[#14263A]/45 border-white/10 hover:bg-[#14263A]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: spot.color }}
                    />
                    <span className="text-xs font-semibold text-[#F4F7FA] truncate">
                      {spot.label}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[#9AAFC2] shrink-0">
                    {getDistance(spot)}m
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

export const MinimapModal: React.FC = () => {
  const isMinimapOpen = useStore((s) => s.isMinimapOpen);
  if (!isMinimapOpen) return null;
  return <MinimapModalInner />;
};
