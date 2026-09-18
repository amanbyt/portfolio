# Aman Kumar Singh — 3D Interactive Portfolio

A fully custom, dependency-light personal portfolio site built as a single-page application with a live **WebGL 3D background**, HUD-style "cyber" UI, and data-driven micro-interactions — showcasing work as a **Data Analyst / Data Engineer / Software Engineer**.

No frameworks, no build step, no bundler. Just semantic HTML, hand-written CSS, and vanilla JavaScript, enhanced with Three.js (3D graphics) and GSAP (animation).

---

## ✨ Highlights

- **Live 3D WebGL background** — a rotating holographic "data core" (icosahedron + orbiting cubes + gimbal rings) that morphs into a "Pipeline Matrix" data-tunnel mode, with a toggle button in the header.
- **Scroll-choreographed camera** — the 3D scene's camera and core drift and re-frame themselves as you scroll through sections.
- **Mouse/touch-reactive scene** — parallax on mouse movement, and click-and-drag (or touch-drag) manual rotation of the 3D core.
- **Physics-y 3D tilt cards** — every card on the page tilts toward the cursor with a dynamic specular highlight (desktop, fine-pointer devices only).
- **"Skill Radar" HUD widget** — a radar-style widget in the hero section that reads the DOM at load time (counting actual tool/cert/project cards) and plots animated blips + telemetry counters, so the numbers can never drift out of sync with the content.
- **Subtle Web Audio sound design** — tiny synthesized hover/click/mode-switch chirps generated on the fly with the Web Audio API (no audio files), muted by default and toggleable, with the preference remembered.
- **Fully accessible fallbacks** — respects `prefers-reduced-motion` (disables camera drift, tilt, and non-essential motion), degrades gracefully to a static page if WebGL is unavailable, and includes proper ARIA labelling, focus trapping in the mobile nav, and keyboard support.
- **Zero-backend contact form** — validates input client-side and hands off to a pre-filled `mailto:` link — no server, API key, or third-party form service required.
- **Responsive** across desktop, tablet, and mobile, with dedicated breakpoints and a reduced-effects mode on lower-powered/touch devices.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Structure | Semantic HTML5 |
| Styling | Hand-written CSS3 (custom properties / design tokens, Grid & Flexbox, no framework) |
| Interactivity | Vanilla JavaScript (ES5+, IIFE modules, no bundler) |
| 3D Graphics | [Three.js](https://threejs.org/) r128 (via CDN) |
| Animation | [GSAP](https://gsap.com/) 3.12 (via CDN) |
| Fonts | Google Fonts — Syne, Outfit, DM Mono |
| Audio | Native Web Audio API (procedurally generated tones) |

No `package.json`, no npm install, no build tools — everything runs directly in the browser.

---

## 📁 Project Structure

```
.
├── index.html        # Page structure & content (all sections/copy live here)
├── style.css         # Design system, layout, animations, responsiveness
├── main.js           # UI behavior: tilt physics, audio FX, nav, forms, counters
├── three-scene.js    # WebGL 3D scene: the holographic background & camera rig
└── favicon.svg       # Vector "AKS" logo / browser tab icon
```

See **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** for a detailed, file-by-file breakdown of *what* each file does, *how* it works internally, and *why* it was built that way.

---

## 🚀 Getting Started

This is a static site — there is nothing to install or compile.

1. Clone the repo:
   ```bash
   git clone https://github.com/<your-username>/<your-repo>.git
   cd <your-repo>
   ```
2. Open `index.html` directly in a browser, **or** serve it locally (recommended, since some browsers restrict features on `file://`):
   ```bash
   # Python 3
   python -m http.server 8000
   # then visit http://localhost:8000
   ```
3. That's it — no build step, no dependencies to install.

### Deploying

Because it's a static site, it can be hosted anywhere for free:
- **GitHub Pages** — push to a repo and enable Pages on the `main` branch.
- **Netlify / Vercel / Cloudflare Pages** — drag-and-drop the folder or connect the repo.

---

## 🎨 Customizing

- **Content** — all copy (bio, experience, skills, projects, certifications, contact info) lives directly in `index.html`; edit the relevant `<section>`.
- **Colors / fonts / spacing** — controlled by CSS custom properties at the top of `style.css` (`:root { ... }`) — change a token once, and it updates everywhere.
- **3D scene** — geometry, colors, particle counts, and camera behavior live in `three-scene.js`.
- **Contact email** — update the `mailto:` address in both `index.html` (the direct link) and `main.js` (the form handler).

---

## 🌐 Browser Support

Targets modern evergreen browsers (Chrome, Edge, Firefox, Safari). The 3D background requires WebGL; if unavailable, the site automatically falls back to a fully functional flat-background experience with a small on-screen notice.

---

## 📬 Contact

**Aman Kumar Singh**
- Email: [amansingh.2135@gmail.com](mailto:amansingh.2135@gmail.com)
- LinkedIn: [linkedin.com/in/aman-s02](https://www.linkedin.com/in/aman-s02)
- Location: India (open to relocation / remote)

---

## 📄 License

This project is personal portfolio source code. Feel free to reference the implementation techniques, but please do not redistribute the content/branding as your own.
