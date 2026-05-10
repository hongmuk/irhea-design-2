/**
 * Static Site Builder for GitHub Pages
 * Renders EJS templates to static HTML in docs/ directory
 */
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

// '/irhea-light-demo' for GitHub Pages, '' (or '/') for board / Apache root.
let BASE_PATH = process.env.BASE_PATH;
if (BASE_PATH === undefined) BASE_PATH = '/irhea-light-demo';
if (BASE_PATH === '/') BASE_PATH = '';   // collapse '/' to '' so /css doesn't become //css
const SRC = __dirname;
const DOCS = path.join(SRC, 'docs');

// Pages to render
const pages = [
  { page: 'dashboard', title: 'Spout Control', activeNav: 'dashboard', outPath: 'dashboard/index.html' },
  { page: 'recipe-list', title: 'Recipes', activeNav: 'recipes', outPath: 'recipes/index.html' },
  { page: 'recipe-detail', title: 'Recipe Detail', activeNav: 'recipes', outDir: 'recipe', idRange: [1, 10] },
  { page: 'recipe-edit', title: 'Edit Recipe', activeNav: 'recipes', outDir: 'recipe-edit', idRange: [1, 10] },
  { page: 'brewing', title: 'Brewing', activeNav: 'brewing', outPath: 'brewing/index.html' },
  { page: 'brewing-complete', title: 'Brewing Complete', activeNav: 'brewing', outPath: 'brewing/complete/index.html' },
  { page: 'favorites', title: 'Favorites', activeNav: 'favorites', outPath: 'favorites/index.html' },
  { page: 'alarms', title: 'Alarms', activeNav: 'alarms', outPath: 'alarms/index.html' },
  { page: 'settings', title: 'Settings', activeNav: 'settings', outPath: 'settings/index.html' },
  { page: 'calibration', title: 'Calibration', activeNav: 'calibration', outPath: 'calibration/index.html' },
  { page: 'firmware', title: 'Firmware', activeNav: 'firmware', outPath: 'firmware/index.html' },
  { page: 'system-info', title: 'System Info', activeNav: 'system-info', outPath: 'system-info/index.html' },
  { page: 'usage', title: 'Usage History', activeNav: 'usage', outPath: 'usage/index.html' },
  // IR (spec V0.9) screens
  { page: 'setup',                title: '최초 설정',         activeNav: 'setup',                outPath: 'setup/index.html' },
  { page: 'connect',              title: '장치 연결',         activeNav: 'connect',              outPath: 'connect/index.html' },
  { page: 'main',                 title: '메인',              activeNav: 'main',                 outPath: 'main/index.html' },
  { page: 'settings-general',     title: '설정',              activeNav: 'general',              outPath: 'settings/general/index.html' },
  { page: 'settings-backup',      title: 'USB 백업/복구',     activeNav: 'backup',               outPath: 'settings/backup/index.html' },
  { page: 'settings-engineering', title: '엔지니어링',        activeNav: 'engineering',          outPath: 'settings/engineering/index.html' },
  { page: 'factory-reset',        title: '공장 초기화',       activeNav: 'engineering',          outPath: 'settings/engineering/factory-reset/index.html' },
  { page: 'connection-config',    title: '연결 설정',         activeNav: 'engineering',          outPath: 'settings/engineering/connection/index.html' },
  { page: 'firmware-upgrade',     title: '펌웨어 업그레이드', activeNav: 'firmware-upgrade',     outPath: 'settings/firmware/index.html' },
  { page: 'info',                 title: '정보',              activeNav: 'info',                 outPath: 'info/index.html' },
  { page: 'info-security',        title: '보안 정보',         activeNav: 'info-security',        outPath: 'info/security/index.html' },
];

// ── Helpers ──────────────────────────────────────────────

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyDirSync(src, dest) {
  mkdirp(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function rmrf(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function fixHtmlPaths(html, basePath) {
  // basePath '' (board root) or '/irhea-light-demo' (GitHub Pages).
  // Rewrite href="/..." and src="/..." to prepend basePath, but ONLY when
  // basePath is non-empty. Otherwise leave them alone (they already point at root).
  // Skip protocol-relative ("//foo") and absolute URLs.
  if (!basePath) return html;
  html = html.replace(/(href|src)="\/(?!\/)/g, `$1="${basePath}/`);
  const escaped = basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  html = html.replace(new RegExp(`${escaped}//`, 'g'), `${basePath}/`);
  return html;
}

function injectConfig(html, basePath) {
  // STATIC_MODE flag tells client-side code to fetch /api/<x>.json instead of
  // /api/<x>. Injected at build time so it's always true in Apache-served pages.
  // Also installs a one-shot fetch shim that rewrites GET /api/<x> calls into
  // /api/<x>.json so that IR pages (which use raw fetch instead of api()) work
  // without modification. POST requests still 404 — there is no server-side
  // handler in static mode (admin login, factory-reset, etc. are no-ops here).
  const configScript = `<script>
    window.BASE_PATH = "${basePath}";
    window.STATIC_MODE = true;
    (function(){
      var orig = window.fetch;
      window.fetch = function(input, init){
        try {
          var url = (typeof input === 'string') ? input : (input && input.url) || '';
          var method = (init && init.method ? init.method : (input && input.method) || 'GET').toUpperCase();
          if (method === 'GET' && /^\\/api\\//.test(url) && !/\\.json(\\?|$)/.test(url)) {
            input = (window.BASE_PATH || '') + url.replace(/^\\/api\\//, '/api/') + '.json';
          }
        } catch(e) {}
        return orig.call(this, input, init);
      };
    })();
  </script>`.replace(/\n\s*/g, ' ');
  // Always inject in <head> so the shim is installed before any body-level
  // <script> tags run. IR pages embed inline scripts that call fetch() during
  // initial render — if the shim runs after those, the fetches go out
  // unmodified and 404 against the static .json files.
  return html.replace('</head>', '  ' + configScript + '\n</head>');
}

function renderEjs(data) {
  const layoutPath = path.join(SRC, 'views', 'layout.ejs');
  const template = fs.readFileSync(layoutPath, 'utf8');
  return ejs.render(template, data, {
    filename: layoutPath,
    root: path.join(SRC, 'views'),
  });
}

function writePage(outPath, pageData) {
  const outFile = path.join(DOCS, outPath);
  mkdirp(path.dirname(outFile));
  let html = renderEjs(pageData);
  html = fixHtmlPaths(html, BASE_PATH);
  html = injectConfig(html, BASE_PATH);
  fs.writeFileSync(outFile, html);
}

// ── Build ────────────────────────────────────────────────

console.log(`Building static site with BASE_PATH = "${BASE_PATH}"`);

// Clean
rmrf(DOCS);
mkdirp(DOCS);

// Render pages
let pageCount = 0;
for (const p of pages) {
  if (p.idRange) {
    for (let id = p.idRange[0]; id <= p.idRange[1]; id++) {
      const outPath = p.page === 'recipe-edit'
        ? `recipe/${id}/edit/index.html`
        : `recipe/${id}/index.html`;
      writePage(outPath, { page: p.page, title: p.title, activeNav: p.activeNav });
      pageCount++;
    }
  } else {
    writePage(p.outPath, { page: p.page, title: p.title, activeNav: p.activeNav });
    pageCount++;
  }
}

// Copy static assets
console.log('Copying static assets...');
copyDirSync(path.join(SRC, 'public', 'css'), path.join(DOCS, 'css'));
copyDirSync(path.join(SRC, 'public', 'js'), path.join(DOCS, 'js'));

// Hand-Drip Cinema prototype lives under public/preview/ — ship it too.
const previewSrc = path.join(SRC, 'public', 'preview');
if (fs.existsSync(previewSrc)) {
  copyDirSync(previewSrc, path.join(DOCS, 'preview'));
}

// Copy mock data as API JSON files
console.log('Copying mock data as API endpoints...');
const apiDir = path.join(DOCS, 'api');
mkdirp(apiDir);
for (const file of fs.readdirSync(path.join(SRC, 'mock'))) {
  fs.copyFileSync(
    path.join(SRC, 'mock', file),
    path.join(apiDir, file)
  );
}

// docs/index.html — landing page redirects to the Hand-Drip Cinema prototype
// at /preview/ (the design that was actually shipped). Legacy dashboard moved
// to /dashboard/. Use a relative redirect so it works under any BASE_PATH.
fs.writeFileSync(path.join(DOCS, 'index.html'),
  `<!doctype html>
<html lang="ko"><head>
<meta charset="utf-8">
<title>iRHEA-Light</title>
<meta http-equiv="refresh" content="0; url=preview/">
<link rel="canonical" href="preview/">
<style>body{margin:0;background:#1a1610;color:#F5EDE0;font-family:Inter,system-ui,sans-serif;display:grid;place-items:center;min-height:100vh}</style>
</head><body>
<noscript>Loading <a href="preview/" style="color:#C5A059">/preview/</a>…</noscript>
<script>location.replace('preview/');</script>
</body></html>
`);

// Create 404.html (same as redirect index — keeps legacy SPA behavior alive)
fs.copyFileSync(path.join(DOCS, 'index.html'), path.join(DOCS, '404.html'));

console.log(`Done! Built ${pageCount} pages to docs/ (root → preview/ redirect, legacy dashboard at /dashboard/)`);
