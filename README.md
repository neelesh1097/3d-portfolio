# 🏎️ Neelesh Yadav — 3D Interactive Portfolio

An interactive, physics-driven 3D web portfolio inspired by Bruno Simon’s creative concept, built from scratch with **Three.js**, **Cannon-es**, and **Vite**.

Visitors explore Neelesh's projects, experience, technical skills, and contact links by driving an agile RC sports car across a customized isometric diorama world.

---

## 🌟 Highlights & Features

- **🎮 4-Wheel Drive Vehicle Physics (`cannon-es`)**:
  - Independent suspension, wheel friction, steering angles, and drifting physics.
  - Dust particle trail & dynamic exhaust effects.
  - Car recovery system: Press `[R]` or tap reset to flip the car upright.
- **🏝️ Thematic World Zones**:
  - **Spawn Plaza**: 3D nameplate & role title embedded on the diorama floor.
  - **Projects Arcade**: Interactive kiosks for **Audit Management Tool (AMT)**, **Betel Meet**, **Full-Stack MERN Platform**, and **Crypto Price Tracker**. Driving close triggers high-tech hologram modals with project details & GitHub links.
  - **Career Runway**: Architectural milestone arches for **TRPW Strategic Partner**, **Univest**, and **Phoenix Labs**.
  - **Skills Playground**: Interactive physical bowling pins to smash into, obstacle jump ramps, and floating 3D tech badges.
  - **Socials Island**: 3D physical monuments for GitHub, LinkedIn, and Email.
- **🚀 Dual-Mode UX (Accessible for Everyone)**:
  - **Gamer Mode**: Drive with `W A S D` / Arrow keys or on-screen mobile pedals.
  - **Drone / Quick Nav Mode**: Top bar navigation jumps the camera smoothly to any zone for recruiters who prefer instant browsing.
- **🔊 Zero-Dependency Audio Synthesis**:
  - Built-in Web Audio API engine pitch modulation, impact collisions, horn (`H` key), and chimes—no external `.mp3` loading delays or CORS issues.
- **📱 100% Responsive & Touch Supported**:
  - Virtual steering controls & gas/brake pedals for mobile devices.
- **🔒 Privacy Safe**:
  - Personal contact info (phone number) is kept private; only professional links (GitHub, LinkedIn, Email) are surfaced.

---

## 🛠️ Tech Stack

- **Rendering**: [Three.js](https://threejs.org/) (WebGL)
- **Physics**: [cannon-es](https://github.com/pmndrs/cannon-es)
- **Tooling**: [Vite](https://vite.dev/)
- **FX**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Hosting Target**: [Render](https://render.com/) (Static Site)

---

## 🚀 Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/neelesh1097/<repo-name>.git
   cd neelesh-3d-portfolio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🌐 How to Deploy on Render (Step-by-Step)

Render can host this as a **Static Site** for free with automated SSL and global CDN:

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: 3D interactive portfolio"
   git branch -M main
   git remote add origin https://github.com/neelesh1097/<YOUR_NEW_REPO_NAME>.git
   git push -u origin main
   ```

2. **Log into Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com/)
   - Click **New +** -> **Static Site**
   - Connect your GitHub account and select your repository.

3. **Configure the deployment settings**:
   - **Name**: `neelesh-portfolio` (or your preferred name)
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

4. **Click "Create Static Site"**:
   - Render will automatically run `npm run build` and deploy your site to `https://neelesh-portfolio.onrender.com`!
