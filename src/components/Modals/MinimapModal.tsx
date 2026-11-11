import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { liveCar } from '../../store/liveTelemetry';
import { ZONES, DEVELOPER_TOKENS } from '../../data/portfolio';
import { ZoneInfo } from '../../types';
import {
  RotateCcw,
  Navigation,
  ExternalLink,
  Gem,
  CheckCircle2,
  MapPin,
  Target,
} from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { IslandMapSvg } from '../IslandMapSvg';
import { ZoneIcon } from '../ZoneIcon';
import { ModalShell } from '../ui/ModalShell';

const MinimapModalInner: React.FC = () => {
  const toggleMinimap = useStore((s) => s.toggleMinimap);
  const visitedZones = useStore((s) => s.visitedZones);
  const collectedTokens = useStore((s) => s.collectedTokens);
  const activeZone = useStore((s) => s.activeZone);
  const approachedZone = useStore((s) => s.approachedZone);
  const guidedZone = useStore((s) => s.guidedZone);
  const setGuidedZone = useStore((s) => s.setGuidedZone);
  const teleportTo = useStore((s) => s.teleportTo);
  const resetCar = useStore((s) => s.resetCar);
  const setActiveModal = useStore((s) => s.setActiveModal);

  const [selectedZone, setSelectedZone] = useState<ZoneInfo | null>(() =>
    guidedZone ? ZONES.find((z) => z.id === guidedZone) || null : null
  );
  const [showTokens, setShowTokens] = useState(true);
  const [carSnap, setCarSnap] = useState(() => ({
    x: liveCar.x,
    y: liveCar.y,
    z: liveCar.z,
    angle: liveCar.angle,
    speed: liveCar.speed,
    boosting: liveCar.boosting,
  }));

  useEffect(() => {
    const id = setInterval(() => {
      setCarSnap({
        x: liveCar.x,
        y: liveCar.y,
        z: liveCar.z,
        angle: liveCar.angle,
        speed: liveCar.speed,
        boosting: liveCar.boosting,
      });
    }, 100);
    return () => clearInterval(id);
  }, []);

  const buildingZones = ZONES.filter((z) => z.id !== 'spawn');
  const discoveredCount = visitedZones.filter((z) => z !== 'spawn').length;
  const tokensFoundCount = Object.values(collectedTokens).filter(Boolean).length;

  const getDistance = (pos: [number, number, number]) =>
    Math.round(Math.hypot(pos[0] - carSnap.x, pos[2] - carSnap.z));

  const handleSelectZone = (zone: ZoneInfo) => {
    setSelectedZone(zone);
    setGuidedZone(zone.id === guidedZone ? null : zone.id);
    soundManager.playClick();
  };

  const handleTeleport = (zone: ZoneInfo) => {
    setGuidedZone(null);
    teleportTo(zone.position, zone.id);
    toggleMinimap();
    soundManager.playAchievement();
  };

  const handleOpenBuilding = (zone: ZoneInfo) => {
    if (zone.id === 'spawn') {
      handleTeleport(zone);
      return;
    }
    setGuidedZone(null);
    teleportTo(zone.position, zone.id);
    toggleMinimap();
    setActiveModal(zone.id as any);
    soundManager.playClick();
  };

  return (
    <ModalShell
      title="Island Navigation Map"
      eyebrow="Full Stack Island"
      subtitle={`POS (${Math.round(carSnap.x)}, ${Math.round(carSnap.z)})  •  ${discoveredCount}/${buildingZones.length} Zones  •  ${tokensFoundCount}/${DEVELOPER_TOKENS.length} Tokens`}
      maxWidthClass="max-w-4xl"
      onClose={toggleMinimap}
      headerRight={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShowTokens((v) => !v);
              soundManager.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors cursor-pointer ${
              showTokens
                ? 'bg-[#1B3045] border-[#F5B84B]/40 text-[#F5B84B]'
                : 'bg-[#0B1420] border-white/10 text-[#9AAFC2]'
            }`}
          >
            <Gem className="w-3.5 h-3.5" /> Tokens
          </button>

          <button
            type="button"
            onClick={() => {
              resetCar();
              setGuidedZone(null);
              toggleMinimap();
              soundManager.playClick();
            }}
            className="px-3 py-1.5 rounded-lg bg-[#1B3045] hover:bg-[#233d57] border border-white/10 text-[#F4F7FA] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#43D9F5]" /> Reset
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Interactive Vector Island Map */}
        <div className="md:col-span-7 bg-[#14263A]/45 border border-white/10 rounded-xl p-4 flex flex-col items-center">
          <div className="w-full max-w-[360px] aspect-square">
            <IslandMapSvg
              carPosition={[carSnap.x, carSnap.y, carSnap.z]}
              carRotation={carSnap.angle}
              isBoosting={carSnap.boosting}
              visitedZones={visitedZones}
              collectedTokens={collectedTokens}
              activeZone={activeZone}
              approachedZone={approachedZone}
              guidedZoneId={guidedZone}
              selectedZoneId={selectedZone?.id || null}
              showTokens={showTokens}
              onSelectZone={handleSelectZone}
            />
          </div>

          <div className="w-full mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#9AAFC2]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#43D9F5] inline-block" />
                Vehicle ({carSnap.speed} km/h)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rotate-45 bg-[#F5B84B] inline-block" />
                Guided / Token
              </span>
            </div>
            <span>Click any marker to guide or drive there</span>
          </div>
        </div>

        {/* Right Column: Waypoint Inspector + Zone Directory */}
        <div className="md:col-span-5 flex flex-col gap-3">
          {selectedZone ? (
            <div className="p-4 rounded-xl bg-[#14263A] border border-white/10 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#0B1420] border border-[#43D9F5]/40 flex items-center justify-center text-[#43D9F5] shrink-0">
                    <ZoneIcon name={selectedZone.icon} size={18} />
                  </div>
                  <div>
                    <div className="font-display text-sm font-bold text-[#F4F7FA]">
                      {selectedZone.name}
                    </div>
                    <div className="text-xs text-[#9AAFC2]">{selectedZone.tagline}</div>
                  </div>
                </div>
                <span className="font-mono text-xs text-[#43D9F5] bg-[#0B1420] px-2 py-0.5 rounded border border-white/10">
                  {getDistance(selectedZone.position)}m
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTeleport(selectedZone)}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#43D9F5] hover:bg-[#5ce1f8] text-[#0B1420] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" /> Teleport Here
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGuidedZone(guidedZone === selectedZone.id ? null : selectedZone.id);
                    soundManager.playClick();
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors cursor-pointer ${
                    guidedZone === selectedZone.id
                      ? 'bg-[#F5B84B] text-[#0B1420] border-[#F5B84B]'
                      : 'bg-[#1B3045] text-[#F4F7FA] border-white/10 hover:bg-[#233d57]'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  {guidedZone === selectedZone.id ? 'Guided' : 'Guide'}
                </button>

                {selectedZone.id !== 'spawn' && (
                  <button
                    type="button"
                    onClick={() => handleOpenBuilding(selectedZone)}
                    className="py-2 px-3 rounded-lg bg-[#1B3045] hover:bg-[#233d57] text-[#F4F7FA] font-medium text-xs flex items-center gap-1 border border-white/10 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#14263A]/60 border border-white/10 text-xs text-[#9AAFC2] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#43D9F5] shrink-0" />
              <span>Select a building on the map or list to guide or teleport.</span>
            </div>
          )}

          {/* Zone List */}
          <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
            {ZONES.map((zone) => {
              const visited = visitedZones.includes(zone.id);
              const isCurrent = (approachedZone || activeZone) === zone.id;
              const isSelected = selectedZone?.id === zone.id;
              const isGuided = guidedZone === zone.id;

              return (
                <div
                  key={zone.id}
                  onClick={() => handleSelectZone(zone)}
                  className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#1B3045] border-[#43D9F5]/50'
                      : isGuided
                        ? 'bg-[#14263A] border-[#F5B84B]/50'
                        : isCurrent
                          ? 'bg-[#14263A] border-[#43D9F5]/30'
                          : 'bg-[#14263A]/45 border-white/10 hover:bg-[#14263A]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#0B1420] border border-white/10 flex items-center justify-center text-[#43D9F5] shrink-0">
                      <ZoneIcon name={zone.icon} size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#F4F7FA] truncate flex items-center gap-1.5">
                        <span>{zone.name}</span>
                        {visited && zone.id !== 'spawn' && (
                          <CheckCircle2 className="w-3 h-3 text-[#43D9F5] shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] text-[#9AAFC2] truncate">{zone.tagline}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTeleport(zone);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#0B1420] hover:bg-[#43D9F5] text-[#9AAFC2] hover:text-[#0B1420] font-mono text-[10px] font-semibold border border-white/10 transition-colors shrink-0 cursor-pointer"
                  >
                    {getDistance(zone.position)}m
                  </button>
                </div>
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
