
import React, { useEffect, useRef } from 'react';
import { Game } from '../engine/Game';
import { engineBridge } from '../engine/engineBridge';
import { useStore } from '../store/useStore';
import { liveCar, livePerf } from '../store/liveTelemetry';
import { soundManager } from '../utils/audio';

export const Scene: React.FC = () => {
  const is2DView = useStore((s) => s.is2DView);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (is2DView) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let fpsTime = performance.now();

    const game = new Game(container, canvas, {
      onLoadProgress: (pct) => {
        useStore.getState().setLoadingProgress(pct);
      },
      onReady: () => {
        useStore.getState().setLoadingProgress(100);
        game.setQuality(useStore.getState().qualityLevel);
        game.setPaint(useStore.getState().vehiclePaint);
        game.setDayMode(useStore.getState().dayMode);
      },
      onOpenMap: () => {
        const s = useStore.getState();
        if (!s.isMinimapOpen) s.toggleMinimap();
        soundManager.playClick();
      },
      onOpenControls: () => {
        useStore.getState().setControlsOpen(true);
        soundManager.playClick();
      },
      onAchievement: (achievementId) => {
        useStore.getState().unlockAchievement(achievementId);
        soundManager.playAchievement();
      },
      onHonk: () => {
        soundManager.playHorn();
      },
      onJump: () => {
        soundManager.playJump();
      },
      onTelemetry: (data) => {
        liveCar.x = data.x;
        liveCar.y = data.y;
        liveCar.z = data.z;
        liveCar.angle = data.angle;
        liveCar.speed = data.speedKmh;
        liveCar.boosting = data.boosting;
        liveCar.nearestSpot = data.nearestSpot;

        const now = performance.now();
        if (now - fpsTime >= 450) {
          const dt = game.ticker.deltaAverage || 1 / 60;
          livePerf.fps = Math.round(1 / Math.max(0.001, dt));
          livePerf.frameTimeMs = dt * 1000;
          livePerf.drawCalls = data.stats.drawCalls;
          livePerf.triangles = data.stats.triangles;
          livePerf.geometries = data.stats.geometries;
          livePerf.textures = data.stats.textures;
          livePerf.backend = data.stats.backend;
          const mem = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
          if (mem) {
            livePerf.jsHeapMb = Math.round(mem.usedJSHeapSize / (1024 * 1024));
          }
          fpsTime = now;
        }

        soundManager.updateEnginePitch(Math.min(1, data.speedKmh / 95));
        useStore.getState().setHudTelemetry(data.speedKmh, data.boosting, data.nearestSpot);
      },
    });

    engineBridge.setGame(game);

    return () => {
      engineBridge.setGame(null);
      game.dispose();
    };
  }, [is2DView]);

  if (is2DView) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 w-screen h-screen overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full outline-none" />
    </div>
  );
};
