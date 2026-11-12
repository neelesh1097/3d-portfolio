# Neelesh Yadav — 3D Interactive Portfolio

An interactive, game-like 3D developer portfolio powered by **Three.js**, **Rapier physics (WASM)**, and **Vite**, built on the **Bruno Simon Folio 2025** engine architecture.

---

## Tech Stack & Architecture

- **3D Graphics**: Three.js (WebGPU/WebGL) with custom shaders, shadow maps, and post-processing
- **Physics**: `@dimforge/rapier3d` (WebAssembly raycast vehicle controller & rigid-body collision simulation)
- **Audio**: Web Audio API with procedural sound effects & environmental audio
- **Styling & UI**: Stylus stylesheets with responsive overlay HUD, touch controls, and interactive modal dialogs
- **Bundler & Tooling**: Vite with Draco and Basis Universal KTX2 texture decompression

---

## Getting Started

### Prerequisites

- **Node.js**: >= 20.0.0
- **npm**: >= 10.0.0

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Opens the local development server (typically `http://localhost:5173/`).

### Production Build

```bash
npm run build
```

Generates production-optimized assets in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## Controls

### Desktop
- **Drive / Steer**: `W`, `A`, `S`, `D` or `Arrow Keys`
- **Nitro Boost**: `Shift`
- **Jump / Hop**: `Space`
- **Interact / Open Panel**: `E` or `Enter`
- **Map Overview**: `M`
- **Horn**: `H`
- **Reset Vehicle**: `R`

### Mobile / Touch
- Responsive on-screen joystick / pedal controls and touch action buttons (`Interact`, `Unstuck`, `Next`, `Close`).

---

## Deployment (Render)

This project is pre-configured with a [`render.yaml`](./render.yaml) blueprint for 1-click deployment on [Render](https://render.com).

### Manual Configuration
- **Type**: Static Site
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  - `NODE_VERSION`: `20`
  - `VITE_COMPRESSED`: `1`
  - `VITE_GAME_PUBLIC`: `1`
  - `VITE_PLAYER_SPAWN`: `landing`

---

## Credits & Attribution

Based on the creative direction and engine architecture of Bruno Simon's Folio 2025. See [`CREDITS.md`](./CREDITS.md) for full licensing and attribution details.
