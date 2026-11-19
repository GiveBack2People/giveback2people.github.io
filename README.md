# giveback2people.github.io

Official project showcase and organization landing page for **[GiveBack2People](https://github.com/GiveBack2People)**: **[giveback2people.github.io](https://giveback2people.github.io)**.

Built in accordance with [`SHOWCASE_GUIDELINE.md`](./SHOWCASE_GUIDELINE.md) and the **Lift** brand kit.

---

## ⚡ Architecture & Features

* **Pre-Built Static Delivery**: Zero client-side API requests. Generates clean, pre-rendered static HTML via GitHub Actions. Instant load, zero layout shift, and immune to visitor-side rate limits.
* **Lift Brand Design System**:
  * Authentic horizontal vector lockups (`svg/horizontal-color-light.svg` & `svg/horizontal-color-dark.svg`).
  * Contrast-verified palette: Indigo (`#6366F1`), Obsidian (`#0F172A`), White (`#FFFFFF`), and Cyan (`#06B6D4` Featured highlight dot).
  * GitHub profile-inspired layout: Left identity rail (280px sticky) + Responsive card grid on the right.
* **Automated Data Pipeline**:
  * Builds automatically on every push, on a 6-hour schedule via GitHub Actions, or manually via `workflow_dispatch`.
  * Configured via [`config.json`](./config.json) (pins, sorting, exclusions).
  * Excludes internal repos (`.github`, `giveback2people.github.io`) and repos carrying `hide-from-showcase`.
  * Pins featured repos (e.g. `designresources`) with live website and repository links.
* **Accessibility & Performance**:
  * Semantic HTML with landmarks (`<header>`, `<main>`, `<footer>`) and skip links.
  * Fast inline FOUC-prevention theme toggle script supporting light and dark modes.
  * Full keyboard and screen-reader support.

---

## 🛠 Local Development

```bash
# Build locally with live GitHub data
node scripts/build.mjs

# Build offline using data fixture (data/sample.json)
node scripts/build.mjs --offline
```

---

## 📜 License

Released under the [MIT License](LICENSE).
