import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load config.json
const configPath = path.join(rootDir, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Helper: HTML Escaping
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper: URL Validation
function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// Helper: Format Number (1.2k)
function formatNumber(num) {
  if (typeof num !== 'number') return '0';
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return String(num);
}

// Helper: Recursive copy
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Fetch or load repos
async function getRepositories() {
  const isOffline = process.argv.includes('--offline');
  if (isOffline) {
    console.log('[build] Running in --offline mode. Reading data/sample.json...');
    const samplePath = path.join(rootDir, 'data', 'sample.json');
    return JSON.parse(fs.readFileSync(samplePath, 'utf8'));
  }

  const token = process.env.GITHUB_TOKEN;
  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'GiveBack2People-Showcase-Builder'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const repos = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `https://api.github.com/orgs/${config.org}/repos?type=public&per_page=${perPage}&page=${page}&sort=pushed`;
    console.log(`[build] Fetching: ${url}`);
    
    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.error(`[build] Error: HTTP ${response.status} from GitHub API`);
      console.error('Rate Limit Remaining:', response.headers.get('x-ratelimit-remaining'));
      console.error('Rate Limit Reset:', response.headers.get('x-ratelimit-reset'));
      const errorText = await response.text();
      console.error('Response:', errorText);
      process.exit(1);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      console.error('[build] Unexpected response format from GitHub API');
      process.exit(1);
    }

    repos.push(...data);
    if (data.length < perPage) {
      break;
    }
    page++;
  }

  return repos;
}

// Main build procedure
async function build() {
  console.log(`[build] Starting showcase build for ${config.org}...`);
  const rawRepos = await getRepositories();
  console.log(`[build] Retrieved ${rawRepos.length} total repos.`);

  // Filtering rules (Section 5.3)
  const excludeList = (config.exclude || []).map(e => e.toLowerCase());
  const hideTopic = config.hideTopic;
  const hideForks = config.hideForks !== false;
  const hideArchived = config.hideArchived !== false;

  const filtered = rawRepos.filter(repo => {
    const nameLower = repo.name.toLowerCase();
    if (excludeList.includes(nameLower)) return false;
    if (repo.private) return false;
    if (hideForks && repo.fork) return false;
    if (hideArchived && repo.archived) return false;
    if (Array.isArray(repo.topics) && hideTopic && repo.topics.includes(hideTopic)) return false;
    return true;
  });

  console.log(`[build] ${filtered.length} repos remaining after filtering.`);

  if (filtered.length < (config.minRepos || 1)) {
    console.error(`[build] Error: filtered repo count (${filtered.length}) is below minRepos (${config.minRepos || 1}). Refusing to deploy.`);
    process.exit(1);
  }

  // Sorting rules (Section 5.3)
  const pinnedList = (config.pin || []).map(p => p.toLowerCase());
  const sortBy = config.sort || 'pushed';

  filtered.sort((a, b) => {
    const aPinIndex = pinnedList.indexOf(a.name.toLowerCase());
    const bPinIndex = pinnedList.indexOf(b.name.toLowerCase());

    const aIsPinned = aPinIndex !== -1;
    const bIsPinned = bPinIndex !== -1;

    if (aIsPinned && !bIsPinned) return -1;
    if (!aIsPinned && bIsPinned) return 1;
    if (aIsPinned && bIsPinned) return aPinIndex - bPinIndex;

    if (sortBy === 'stars') {
      const starDiff = (b.stargazers_count || 0) - (a.stargazers_count || 0);
      if (starDiff !== 0) return starDiff;
    }

    return new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0);
  });

  // Render cards
  const cardsHtml = filtered.map(repo => {
    const isPinned = pinnedList.includes(repo.name.toLowerCase());
    const validHomepage = isValidUrl(repo.homepage) ? repo.homepage : null;
    const topics = Array.isArray(repo.topics) ? repo.topics.slice(0, 3) : [];
    const stars = repo.stargazers_count || 0;
    const forks = repo.forks_count || 0;

    return `
      <li class="project-grid-item">
        <article class="project-card">
          <div class="card-top">
            <div class="card-title-group">
              <svg class="repo-glyph" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 0 0 1.5h2.5a2.25 2.25 0 0 0 2.25-2.25V.75A2.25 2.25 0 0 0 13.25 0H4.5a4 4 0 0 0-4 4v10.5A1.5 1.5 0 0 0 2 16h11.25a.75.75 0 0 0 0-1.5H2a.5.5 0 0 1-.5-.5V4A2.5 2.5 0 0 1 2 2.5Z"/>
              </svg>
              <h2 class="card-title">
                <a href="${escapeHtml(repo.html_url)}" class="card-title-link">${escapeHtml(repo.name)}</a>
              </h2>
            </div>
            ${isPinned ? '<span class="featured-badge"><span class="featured-dot" aria-hidden="true"></span>Featured</span>' : ''}
          </div>

          ${repo.description ? `<p class="card-desc">${escapeHtml(repo.description)}</p>` : ''}

          <div class="card-meta">
            ${repo.language ? `
              <span class="meta-lang">
                <span class="lang-dot" aria-hidden="true"></span>
                <span>${escapeHtml(repo.language)}</span>
              </span>` : ''}

            ${stars > 0 ? `
              <span class="meta-stat" title="${stars} stars">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>
                </svg>
                <span>${formatNumber(stars)}</span>
              </span>` : ''}

            ${forks > 0 ? `
              <span class="meta-stat" title="${forks} forks">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 0-1.5 0v.128a.25.25 0 0 1-.25.25h-3a.25.25 0 0 1-.25-.25v-.128a2.25 2.25 0 1 0-1.5 0ZM3.25 3a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0Zm8 0a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM8 10.128V8.25a2.25 2.25 0 0 0-1.5-2.122v-.256a1.75 1.75 0 0 1 1.5 1.728v2.5a2.25 2.25 0 1 0 1.5 0v-2.5A1.75 1.75 0 0 1 11 5.872v.256A2.25 2.25 0 0 0 9.5 8.25v1.878a2.25 2.25 0 1 0-1.5 0ZM8 13.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"/>
                </svg>
                <span>${formatNumber(forks)}</span>
              </span>` : ''}

            ${validHomepage ? `
              <a href="${escapeHtml(validHomepage)}" class="card-website-link" target="_blank" rel="noopener noreferrer">
                Website ↗
              </a>` : ''}
          </div>

          ${topics.length > 0 ? `
            <div class="card-topics">
              ${topics.map(t => `<span class="topic-pill">${escapeHtml(t)}</span>`).join('')}
            </div>` : ''}
        </article>
      </li>
    `;
  }).join('\n');

  // Computed repo count label
  const repoCountText = `${filtered.length} ${filtered.length === 1 ? 'project' : 'projects'}`;

  // Build Date in UTC (e.g. 19 Nov 2026)
  const buildDateText = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date());

  // Load theme script and styles
  const themeJsPath = path.join(rootDir, 'src', 'theme.js');
  const themeJs = fs.readFileSync(themeJsPath, 'utf8');

  const stylesSrc = path.join(rootDir, 'src', 'styles.css');
  const stylesCss = fs.readFileSync(stylesSrc, 'utf8');

  // Load template
  const templatePath = path.join(rootDir, 'src', 'template.html');
  let html = fs.readFileSync(templatePath, 'utf8');

  // Replace placeholders
  html = html
    .replace('<!-- REPO_COUNT -->', repoCountText)
    .replace('<!-- REPO_CARDS -->', cardsHtml)
    .replace('<!-- BUILD_DATE -->', buildDateText)
    .replace('<!-- INLINE_STYLES -->', stylesCss)
    .replace('<!-- INLINE_THEME_JS -->', themeJs);

  // Output to dist/
  const distDir = path.join(rootDir, 'dist');
  fs.mkdirSync(distDir, { recursive: true });

  // Copy public/ to dist/
  const publicDir = path.join(rootDir, 'public');
  if (fs.existsSync(publicDir)) {
    copyDirSync(publicDir, distDir);
  }

  // Copy src/styles.css to dist/
  fs.copyFileSync(stylesSrc, path.join(distDir, 'styles.css'));

  // Write dist/index.html
  const distIndexPath = path.join(distDir, 'index.html');
  fs.writeFileSync(distIndexPath, html, 'utf8');
  console.log(`[build] Wrote ${distIndexPath}`);

  // ALSO mirror generated files and public assets to root directory so that GitHub Pages
  // serves the exact same pre-built HTML immediately if Pages is set to root branch!
  fs.writeFileSync(path.join(rootDir, 'index.html'), html, 'utf8');
  fs.copyFileSync(stylesSrc, path.join(rootDir, 'styles.css'));
  if (fs.existsSync(publicDir)) {
    copyDirSync(publicDir, rootDir);
  }
  console.log('[build] Mirrored index.html, styles.css, and public assets to repository root for instant fallback.');

  console.log('[build] Build completed successfully.');
}

build().catch(err => {
  console.error('[build] Build failed:', err);
  process.exit(1);
});
