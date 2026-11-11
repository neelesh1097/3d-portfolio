# Neelesh Yadav — Immersive 3D Interactive Developer Portfolio 🏎️✨

An award-winning, game-inspired 3D developer portfolio website built with **React**, **Three.js**, **React Three Fiber (R3F)**, **Drei**, **TypeScript**, **Tailwind CSS**, and **Zustand**.

Inspired by creative interactive experiences like [bruno-simon.com](https://bruno-simon.com/), this project lets visitors drive a responsive cyber roadster through a miniature futuristic open world to discover projects, skills, career history, achievements, and contact channels.

---

## ⚡ Tech Stack

- **Framework**: React 19 + Vite 6
- **Language**: TypeScript
- **3D Graphics & Engine**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Animation & Physics**: Framer Motion, GSAP, and Custom Agile Arcade Vehicle Physics
- **Audio**: Procedural Web Audio API sound synthesizer (engine revs, horn, nitro boost, jumps, fanfares)
- **UI & Styling**: Tailwind CSS v4, Lucide React
- **State Management**: Zustand (persisted local storage for achievements & collectibles)

---

## 🎮 Driving & Game Controls

### Desktop Controls:
| Key | Action |
| :--- | :--- |
| **`W` / `↑`** | Accelerate forward |
| **`S` / `↓`** | Reverse / Brake |
| **`A` / `←`** | Steer Left |
| **`D` / `→`** | Steer Right |
| **`Shift`** | **Nitro Boost** (supersonic acceleration) |
| **`Space`** | **Jump Stunt** (catch airtime over ramps) |
| **`E` / `Enter`** | **Interact** / Open zone details & project modals |
| **`R`** | **Respawn / Reset** car orientation |
| **`H`** | **Honk** dual-tone air horn |
| **`M`** | **Minimap GPS Radar** (click to teleport) |
| **`Esc`** | Close active modal |

### Mobile & Touch Controls:
- On-screen touch **D-Pad** for steering and forward/reverse driving.
- Dedicated virtual buttons for **Boost**, **Jump**, **Respawn**, and **Zone Interaction**.

---

## 🗺️ The 6 Interactive Portfolio Zones

1. **🏁 Spawn Plaza (`[0, 0]`)**: Welcome pad, starting orientation, and controls briefing.
2. **👤 About Studio (`[-38, -28]`)**: Architectural pavilion with holographic rotating monogram, personal story, and engineering philosophy.
3. **⚡ Tech Lab (`[38, -28]`)**: Futuristic hexagonal laboratory with rotating tech data core, skill proficiency matrix, and modern developer tooling.
4. **🚀 Project Arena (`[0, -56]`)**: Grand 3D exhibition gallery featuring 4 interactive podium stands with live modals, metric highlights, GitHub repositories, and confetti triggers.
5. **🏢 Career Runway (`[42, 24]`)**: Milestone arches for **TRPW Strategic Partner**, **Univest**, and **Phoenix Labs**.
6. **🎓 Academy Campus (`[-42, 24]`)**: Modern campus pavilion highlighting computer science coursework, degree honors, and algorithmic foundations.
7. **📡 Comms Station (`[0, 52]`)**: Futuristic communications dish, validated contact transmission form, direct socials (GitHub, LinkedIn), and CV download.

---

## 🏆 Gamification & Easter Eggs

- **8 Glowing Energy Crystals**: Hidden across the terrain (Plaza, Stunt Ramps, Lab, Runway, Comms Station) rewarding XP and celebratory chimes.
- **Physical Bowling Pins**: Knock them down with your car at high speed to trigger the *Bowling Legend* achievement.
- **Stunt Jump Ramps**: Hit the ramps with Nitro Boost for airtime.
- **8 Unlockable Achievements**: Saved locally in browser storage with animated toaster popups.
- **Accessible 2D Fallback**: Immediate toggle to a clean, readable 2D classic portfolio for low-end hardware or text-first recruiters.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Deploying to Production (Render / Vercel / Netlify)

Because this project is 100% client-side with zero external backend dependencies:

1. **Push to your GitHub repository**:
   ```bash
   git add .
   git commit -m "feat: complete immersive 3D developer portfolio"
   git push -u origin main
   ```
2. **On Render ([dashboard.render.com](https://dashboard.render.com))**:
   - Create a **New Static Site**.
   - Connect your GitHub repo.
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
3. Click **Deploy** — your live 3D portfolio will be online with an automated free SSL certificate!
