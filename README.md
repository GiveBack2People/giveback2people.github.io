# GiveBack2People — Official GitHub Organization Website

[![GitHub Pages](https://img.shields.io/badge/Live_Site-GitHub_Pages-22c55e?style=flat-square&logo=github)](https://giveback2people.github.io)
[![Organization](https://img.shields.io/badge/GitHub-GiveBack2People-blue?style=flat-square&logo=github)](https://github.com/GiveBack2People)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg?style=flat-square)](https://opensource.org/licenses/MIT)

This repository hosts the official landing page and project hub for the [GiveBack2People](https://github.com/GiveBack2People) organization at **[giveback2people.github.io](https://giveback2people.github.io)**.

---

## 🌟 Highlights

* **Zero-Host, Zero-Build Setup**: Pure, high-performance modern static HTML/CSS with no compile or packaging step required.
* **Modern Web Standards**:
  * Native `<meta name="color-scheme" content="light dark">` with FOUC prevention.
  * Adaptive CSS tokens utilizing `light-dark()` with graceful fallbacks.
  * Accessible light/dark theme switch with cross-tab persistence via `localStorage`.
  * Responsive, mobile-first design with smooth interactions and clean typography.
* **Project Showcase**:
  * Direct spotlight for the flagship **[Design Resources Hub](https://giveback2people.github.io/designresources/)** (4,000+ curated resources).
  * Modular cards for roadmapped templates, starter kits, and knowledge guides.

---

## 🚀 How to Add or Update Projects

Whenever you start a new project or update existing ones, you don't need any complex build tools:

1. Open [`index.html`](file:///./index.html).
2. Locate the `<section id="projects">` block.
3. Duplicate or edit an `<article class="project-card">` entry with your project details, tags, and links.
4. Commit and push:
   ```bash
   git add .
   git commit -m "feat: add new project"
   git push origin main
   ```
GitHub Pages will automatically update `https://giveback2people.github.io` within seconds!

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
