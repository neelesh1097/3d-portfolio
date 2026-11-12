# Full Stack Island — Engine Architecture & Migration Report

## Phase 1–2: Reference Analysis & Integration Strategy

### Why We Migrated to the Reference Engine Architecture (Strategy B)
The legacy React Three Fiber (`@react-three/fiber`) implementation suffered from frame-time degradation during extended driving sessions due to:
1. React reconciler work on 3D scene graphs and dynamic `PerformanceMonitor` DPR thrashing.
2. Hand-rolled Euler vehicle movement (`Vehicle.tsx`) with circle-only building colliders and no true suspension, wheel contact, or rigid-body prop collisions.
3. Basic procedural primitives lacking unified core-shadow, drop-shadow, terrain bounce lighting, or post-processing.

Rather than forcing React Three Fiber and Rapier/TSL together, we adopted Bruno Simon's `folio-2025` engine design as a clean, React-free TypeScript 3D engine under `src/engine/`, while preserving Neelesh's existing portfolio data (`src/data/`), Tailwind v4 modals, map, achievements, and 2D fallback as a decoupled HTML overlay layer. The original R3F codebase is preserved untouched in the git branch `backup/r3f-legacy`.

### Single Priority-Ordered Game Loop (`src/engine/Ticker.ts`)
Driven exclusively by `THREE.WebGPURenderer.setAnimationLoop(...)`:
- `0`: `Time` / `Inputs` (Keyboard, Pointer, Wheel, Mobile Touch, Gamepad)
- `1`: `Player` pre-physics (throttle, steer, boost, brake, jump)
- `2`: `PhysicsVehicle` pre-physics (Rapier `VehicleController` wheel forces, steering, suspension)
- `3`: `Physics` (`Rapier.World.step`, contact force events, water buoyancy)
- `4`: `Objects` (sync awake rigid bodies to 3D transforms, sleep distant dynamic objects)
- `5`: `PhysicsVehicle` post-physics (wheel ground contact, velocity, speed, mid-air flip detection, stuck/upside-down detection)
- `6`: `Player` post-physics (position, distance driven, throttled 10Hz telemetry bridge to UI)
- `7`: `View` (third-person follow camera, velocity look-ahead magnet, speed zoom, scroll zoom, `optimalArea` frustum quad)
- `8`: `DayCycles`, `Zones`, `VisualVehicle` (wheel spin/steer/suspension, blinkers, brake/reverse lights, radar antenna, boost trails, ground tracks, paint skins)
- `9`: `Wind`, `Lighting`, `InteractivePoints`, `Tracks` (512×512 offscreen render target)
- `10`: `Fog`, `Reveal`, `Terrain`, `Trails`, `Floor`, `Grass`, `WaterSurface`, `Foliage`, `Landmarks`, `Collectibles`
- `13`: `InstancedGroup` (zero-allocation matrix updates for dynamic props)
- `14`: `Audio` (Web Audio procedural SFX + optional CC0 music)
- `998`: `Rendering` (`RenderPipeline` with `bloom` + `cheapDOF`)
- `999`: `Monitoring` (GPU/WebGL stats snapshot)

