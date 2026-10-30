# AeroSpace – Interactive 3D Space Explorer
**Track: MotionCraft – 3D & Animations (Problem Statement 1)**  
*IEEE Systems, Man and Cybernetics Society of KLS GIT – UXECUTION*

---

## 🌟 Overview
**AeroSpace** is a high-performance interactive 3D space exploration and astrophysical simulation platform built with **React**, **Three.js / React Three Fiber (@react-three/fiber)**, **React Three Drei**, **Zustand**, **Tailwind CSS**, and **Recharts**.

It provides a synchronized 3D visualization and scientific telemetry dashboard simulating planetary orbital dynamics, axial rotation, scale comparisons, and real-time astronomical analysis.

---

## 🚀 Key Features & Requirements Matrix

| Requirement | Implementation Details |
| :--- | :--- |
| **1. 3D Solar System (≥ 5 bodies + Sun)** | Full modeled solar system including the **Sun** (central emitting star with corona glow), **Mercury**, **Venus**, **Earth** (with rotating cloud layer & orbiting Moon), **Mars**, **Jupiter**, **Saturn** (with 3D rings), **Uranus** (with ice rings), **Neptune**, and a 750-particle **Asteroid Belt**. |
| **2. Orbital Movement & Controls** | Real-time Keplerian orbital simulation and axial rotation. Play/Pause toggle, granular speed multiplier presets (0.25x, 0.5x, 1x, 2x, 5x, 10x) + slider, and elapsed simulated Earth time tracker. |
| **3. Select, Rotate & Zoom + Reset View** | Interactive click targeting on 3D meshes or HUD labels. Camera controller smoothly lerps orbit targets and closes in for inspection. `OrbitControls` allows 360° pan, pitch, and zoom. "Reset View" smoothly glides back to the solar overview. |
| **4. Dynamic Planetary Telemetry** | Glassmorphic HUD Info Panel displaying real diameter (km & Earth scale), distance to Sun (AU & million km), orbital period (days & years), day length, surface temperature gauge, gravity ($m/s^2$), moon count, overview, cosmic trivia, and atmospheric gas composition bars. |
| **5. Planet Comparison & Visual Chart** | Side-by-side comparison modal with target selectors for any two celestial bodies. Compares 6+ parameters in a structured table and generates interactive **Recharts bar charts** (Multi-parameter, Diameter, and Orbital days). Direct "Focus in 3D" button for either planet. |
| **6. Search & Category Filters** | Search bar with real-time autocompletion across names and celestial types. Category filter tabs (*All Bodies*, *Terrestrial*, *Gas Giants*, *Ice Giants*, *Stars*). Selecting a search item focuses the 3D camera and opens the info panel. |
| **7. Synchronized State & Visualization** | Centralized reactive **Zustand** store synchronizing the 3D scene, camera focus, orbital indicators, HUD info panel, bottom quick-ribbon, and comparison modal. |

---

## 🛠️ Tech Stack
- **Frontend Framework**: React 19, Vite
- **3D Graphics & Canvas**: Three.js, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- **Styling**: Tailwind CSS v4, Glassmorphism HUD styling
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: Zustand

---

## 💻 How to Run Locally

1. Navigate to the project directory:
   ```bash
   cd aerospace
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173/
   ```

5. Build for production:
   ```bash
   npm run build
   ```
