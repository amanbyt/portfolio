# Aman Kumar Singh — 3D Interactive Portfolio

A single-page, 3D interactive portfolio built with vanilla HTML, CSS, and JavaScript, featuring a WebGL background scene (Three.js + GSAP), scroll-linked camera choreography, animated skill/telemetry HUD widgets, and a cyberpunk-inspired visual style.

**Live site:** _add your Vercel URL here once deployed_

---

## ✨ Features

- **WebGL 3D background** — a holographic "data core" scene with two switchable modes (Cyber Constellation / Pipeline Matrix), built with Three.js and animated with GSAP
- **Scroll-linked camera choreography** — the 3D scene reacts to scroll position and mouse movement
- **3D tilt-on-hover cards** with dynamic specular shine (disabled automatically on touch devices and when `prefers-reduced-motion` is set)
- **Skill Radar HUD** — dynamically counts tools/certifications/projects from the DOM and renders animated radar blips
- **Web Audio micro-interactions** — subtle synthesized hover/click sound effects, muted by default, togglable and persisted via `localStorage`
- **Scroll-spy navigation**, sticky header, and an accessible mobile navigation drawer (focus trapping, `Escape` to close)
- **Animated stat counters** using `IntersectionObserver`
- **Contact form** that opens a pre-filled `mailto:` draft to the site owner
- Fully responsive, with reduced-motion and low-power-device fallbacks

---

## 🛠️ Tech Stack

This is a **static site** — no build step, no framework, no package manager required.

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (custom properties, no preprocessor) |
| Interactivity | Vanilla JavaScript (ES6+) |
| 3D graphics | [Three.js r128](https://threejs.org/) (via CDN) |
| Animation | [GSAP 3.12.5](https://gsap.com/) (via CDN) |
| Fonts | Google Fonts — Syne, Outfit, DM Mono |
| Hosting | [Vercel](https://vercel.com/) (static deployment) |

No React, Next.js, or bundler is used intentionally — the site has no dynamic data or routing needs, so a framework would add complexity without benefit.

---

## 📁 File Structure

```
.
├── index.html        # Page structure and content (hero, about, skills, projects, certifications, contact)
├── style.css         # All styling, layout, and animations
├── main.js           # UI interactions: tilt physics, audio FX, scroll spy, mobile nav, contact form, stat counters
└── three-scene.js    # WebGL scene setup, 3D objects, camera choreography, animation loop
```

---

## 🚀 Running Locally

No installation needed — it's static HTML/CSS/JS. Just serve the folder with any local web server (opening `index.html` directly via `file://` can break some browser features).

Using Python:
```bash
python3 -m http.server 8000
```

Using Node:
```bash
npx serve .
```

Then open `http://localhost:8000` (or the port shown) in your browser.

---

## ☁️ Deploying to Vercel

**Option A — GitHub (recommended, enables auto-redeploys):**
1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, and click **Add New → Project**.
3. Import the repo. Vercel auto-detects it as a static project — leave the Build Command and Output Directory blank.
4. Click **Deploy**.

**Option B — Vercel CLI (no GitHub required):**
```bash
npx vercel
```
Follow the CLI prompts from inside the project folder.

**Custom domain:** add it under Project Settings → Domains once deployed.

---

## 📬 Contact Form Note

The contact form currently builds a `mailto:` link and redirects the browser to open the visitor's default email client with the message pre-filled. This works without any backend, but requires the visitor to have a mail client configured. For guaranteed delivery, consider adding a Vercel Serverless Function (`/api/contact.js`) wired to an email API (e.g. Resend, SendGrid) or a form service like Formspree.

---

## 📄 License

All content (copy, credentials, project descriptions) belongs to Aman Kumar Singh. Code structure may be reused/adapted with attribution.
