# Full Stack Island — Neelesh Yadav 3D Interactive Portfolio

An interactive 3D developer portfolio built with **React 19**, **TypeScript**, **Three.js**, **React Three Fiber**, **Drei**, **Framer Motion**, **Tailwind CSS v4**, and **Zustand**.

Explore **Full Stack Island** in a drivable miniature buggy across a sculpted coastal island connected by an asphalt ring road, crossroads, jump ramps, and eight architectural portfolio landmarks.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS v4
- **3D Engine**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Motion & Icons**: Framer Motion, Lucide React, Canvas Confetti
- **State & Audio**: Zustand (`localStorage` persistence for achievements & tokens), Web Audio API procedural sound engine
- **Typography**: Space Grotesk, Inter, JetBrains Mono

---

## Driving & Navigation Controls

### Desktop
| Key | Action |
| :--- | :--- |
| **`W A S D` / Arrows** | Drive and steer |
| **`Shift`** | Nitro boost |
| **`Space`** | Jump |
| **`E` / `Enter`** | Interact / Open zone panel |
| **`M`** | Open Island Navigation Map |
| **`R`** | Reset vehicle to Central Hub |
| **`H`** | Horn |
| **`Scroll`** | Zoom third-person camera |
| **`Esc`** | Close active modal or map |
| **`P`** *(dev only)* | Toggle WebGL performance monitor |

### Mobile
- Touch **D-Pad** (accelerate, reverse, steer) + **Boost**, **Jump**, and **Reset** buttons.
- Responsive navigation menu, compact speedometer, expandable minimap, and tap-to-open zone prompt.

---

## Island Zones

1. **Central Hub (`[0, 0]`)**: Open roundabout plaza & spawn point.
2. **About Me (`[-23, -23]`)**: Personal Studio HQ — bio, stats, story, and career interests.
3. **Frontend City (`[0, -32]`)**: Glass tower — React, TypeScript, Next.js, Tailwind CSS, Three.js.
4. **Backend Lab (`[23, -23]`)**: Server facility — Node.js, Express, REST APIs, WebSockets, Auth.
5. **Database Hub (`[32, 0]`)**: Data center — PostgreSQL, MongoDB, MySQL, Redis, indexing.
6. **Cloud & DevOps (`[23, 23]`)**: Sky infrastructure — Git, Docker, CI/CD, AWS, Vercel.
7. **Project Plaza (`[0, 32]`)**: Exhibition hall & 4 showcase kiosks.
8. **Experience Center (`[-23, 23]`)**: Academy rotunda — work timeline, education, and certifications.
9. **Contact Station (`[-32, 0]`)**: Coastal comms tower — direct email, GitHub, LinkedIn, CV, and contact form.

---

## Editing Portfolio Content

All portfolio data lives in `src/data/`:
- `src/data/portfolio.ts` — personal info, stats, zone coordinates, achievements, collectible tokens
- `src/data/projects.ts` — featured projects, descriptions, tech stacks, links
- `src/data/skills.ts` — Frontend, Backend, Database, and Cloud & DevOps skill matrices
- `src/data/experience.ts` — work history, education, coursework, certifications

---

## Development & Build

```bash
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
npx tsc --noEmit # TypeScript type check
npm run build    # Production bundle in dist/
```
