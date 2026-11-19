# giveback2people.github.io

Official organization website and public project directory for **[GiveBack2People](https://github.com/GiveBack2People)**: **[giveback2people.github.io](https://giveback2people.github.io)**.

---

## ⚡ Zero Maintenance & Real-Time Sync

* **Pure Minimalism**: No marketing hype, fake roadmap placeholders, or build tooling.
* **Automatic GitHub Sync**: On page load, the site queries GitHub's REST API (`https://api.github.com/orgs/GiveBack2People/repos`).
  * Any new public repository created under the organization appears automatically.
  * Projects are sorted by **GitHub Stars** (`stargazers_count` descending).
  * Repositories with a configured `homepage` URL display a prominent **Live Site ↗** link.
  * Special repositories (`.github` and `giveback2people.github.io`) are filtered out automatically.
* **Cached**: Uses lightweight client `sessionStorage` (10-minute cache) to stay within GitHub's unauthenticated API limits.
* **System Dark/Light Theme**: Adapts automatically with smooth CSS tokens.

---

## 📜 License

Released under the [MIT License](LICENSE).
