const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

function loadMock(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'mock', `${name}.json`), 'utf8'));
}

function safeMock(name) {
  try { return loadMock(name); } catch (e) { return null; }
}

function renderIR(res, page, opts) {
  res.render('layout', Object.assign({
    page: page,
    title: opts.title,
    activeNav: opts.activeNav || page,
    theme: 'ir'
  }, opts));
}

// ── Page Routes ──────────────────────────────────────────

app.get('/', (req, res) => {
  // Hand-Drip Cinema prototype lives at /preview/. Default to it.
  res.redirect('/preview/');
});

app.get('/setup',   (req, res) => renderIR(res, 'setup',   { title: '최초 설정' }));
app.get('/connect', (req, res) => renderIR(res, 'connect', { title: '장치 연결' }));
app.get('/main',    (req, res) => renderIR(res, 'main',    { title: '메인' }));
// Legacy production EJS routes (pages restored from git HEAD)
app.get('/dashboard',         (req, res) => res.render('layout', { page: 'dashboard',     title: 'Spout Control', activeNav: 'dashboard' }));
app.get('/recipes',           (req, res) => res.render('layout', { page: 'recipe-list',   title: 'Recipe Library', activeNav: 'recipes' }));
app.get('/recipe/:id',        (req, res) => res.render('layout', { page: 'recipe-detail', title: 'Recipe Detail',  activeNav: 'recipes' }));
app.get('/recipe/:id/edit',   (req, res) => res.render('layout', { page: 'recipe-edit',   title: 'Edit Recipe',    activeNav: 'recipes' }));
app.get('/favorites',         (req, res) => res.render('layout', { page: 'favorites',     title: 'Favorites',      activeNav: 'favorites' }));
app.get('/alarms',            (req, res) => res.render('layout', { page: 'alarms',        title: 'Alarms',         activeNav: 'alarms' }));
app.get('/usage',             (req, res) => res.render('layout', { page: 'usage',         title: 'Usage History',  activeNav: 'usage' }));
app.get('/calibration',       (req, res) => res.render('layout', { page: 'calibration',   title: 'Calibration',    activeNav: 'calibration' }));
app.get('/firmware',          (req, res) => res.render('layout', { page: 'firmware',      title: 'Firmware',       activeNav: 'firmware' }));
app.get('/system-info',       (req, res) => res.render('layout', { page: 'system-info',   title: 'System Info',    activeNav: 'system-info' }));
app.get('/settings',          (req, res) => res.render('layout', { page: 'settings',      title: 'Settings',       activeNav: 'settings' }));

app.get('/brewing',          (req, res) => renderIR(res, 'brewing',          { title: '추출 중' }));
app.get('/brewing/complete', (req, res) => renderIR(res, 'brewing-complete', { title: '추출 완료' }));

app.get('/settings/general',     (req, res) => renderIR(res, 'settings-general',     { title: '설정',         activeNav: 'general' }));
app.get('/settings/backup',      (req, res) => renderIR(res, 'settings-backup',      { title: 'USB 백업/복구', activeNav: 'backup' }));
app.get('/settings/engineering', (req, res) => renderIR(res, 'settings-engineering', { title: '엔지니어링',    activeNav: 'engineering' }));
app.get('/settings/engineering/factory-reset', (req, res) => renderIR(res, 'factory-reset',     { title: '공장 초기화', activeNav: 'engineering' }));
app.get('/settings/engineering/connection',    (req, res) => renderIR(res, 'connection-config', { title: '연결 설정',   activeNav: 'engineering' }));
app.get('/settings/firmware',    (req, res) => renderIR(res, 'firmware-upgrade',     { title: '펌웨어 업그레이드', activeNav: 'firmware' }));

app.get('/info',          (req, res) => renderIR(res, 'info',          { title: '정보' }));
app.get('/info/security', (req, res) => renderIR(res, 'info-security', { title: '보안 정보' }));

// ── APIs ─────────────────────────────────────────────────

app.get('/api/system-config',   (req, res) => res.json(loadMock('system-config')));
app.post('/api/system-config/configure', (req, res) => res.json({ ok: true }));

app.get('/api/connection',      (req, res) => res.json(loadMock('connection')));
app.post('/api/connection',     (req, res) => res.json({ ok: true, ...req.body }));
app.post('/api/connection/test',(req, res) => res.json({ ok: true, latencyMs: 42 }));

app.post('/api/admin/login', (req, res) => {
  const creds = loadMock('admin-credentials');
  const { username, password } = req.body || {};
  if (username === creds.username && password === creds.password) return res.json({ ok: true, role: 'admin' });
  res.status(401).json({ ok: false, error: '암호 오류' });
});

app.post('/api/factory-reset',    (req, res) => res.json({ ok: true, categories: req.body && req.body.categories || [] }));
app.post('/api/firmware/check',   (req, res) => res.json({ current: '1.0', latest: '1.1', updateAvailable: true }));
app.post('/api/firmware/upgrade', (req, res) => res.json({ ok: true }));
app.post('/api/backup',           (req, res) => res.json({ ok: true, items: req.body && req.body.items || [] }));
app.post('/api/restore',          (req, res) => res.json({ ok: true, items: req.body && req.body.items || [] }));

app.get('/api/recipes',     (req, res) => res.json(loadMock('recipes')));
app.get('/api/recipes/:id', (req, res) => {
  const r = loadMock('recipes').find(x => x.id === parseInt(req.params.id, 10));
  if (r) res.json(r);
  else res.status(404).json({ error: 'Recipe not found' });
});
app.get('/api/spouts',          (req, res) => res.json(loadMock('spouts')));

// Legacy mock APIs (consumed by /js/pages/*.js)
app.get('/api/alarms',          (req, res) => res.json(safeMock('alarms')        || []));
app.get('/api/system-info',     (req, res) => res.json(safeMock('system-info')   || {}));
app.get('/api/common-env',      (req, res) => res.json(safeMock('common-env')    || {}));
app.get('/api/usage-info',      (req, res) => res.json(safeMock('usage-info')    || {}));
app.get('/api/favorites',       (req, res) => res.json(safeMock('favorites')     || []));
app.get('/api/brew-defaults',   (req, res) => res.json(safeMock('brew-defaults') || {}));
app.get('/api/brew-sessions',   (req, res) => res.json(safeMock('brew-sessions') || []));

app.get('/api/general-config',    (req, res) => res.json(safeMock('general-config') || {}));
app.post('/api/general-config',   (req, res) => res.json({ ok: true, ...req.body }));
app.get('/api/boiler-info',       (req, res) => res.json(safeMock('boiler-info') || {}));
app.post('/api/boiler-info',      (req, res) => res.json({ ok: true, ...req.body }));
app.get('/api/pour-range',        (req, res) => res.json(safeMock('pour-range') || []));
app.post('/api/pour-range',       (req, res) => res.json({ ok: true, items: req.body && req.body.items || [] }));
app.get('/api/pump-calibration',  (req, res) => res.json(safeMock('pump-calibration') || []));
app.post('/api/pump-calibration', (req, res) => res.json({ ok: true, items: req.body && req.body.items || [] }));
app.get('/api/water-rinse',       (req, res) => res.json(safeMock('water-rinse') || {}));
app.post('/api/water-rinse',      (req, res) => res.json({ ok: true, ...req.body }));
app.get('/api/error-log',         (req, res) => res.json(safeMock('error-log') || []));
app.get('/api/system-log',        (req, res) => res.json(safeMock('system-log') || []));
app.get('/api/usage-stats',       (req, res) => res.json(safeMock('usage-stats') || {}));

app.listen(PORT, () => {
  console.log(`iRHEA-Light Demo running at http://localhost:${PORT}`);
});
