// Static-mode route audit — verifies docs/ build serves correctly.
// Run: node test/audit.mjs            (audits Express server on :3000)
//      MODE=static node test/audit.mjs (audits static docs/ on :4001 — needs serve-docs running)
import { chromium } from '../node_modules/playwright/index.mjs';
import fs from 'node:fs';

const MODE = process.env.MODE || 'express';
const BASE = MODE === 'static' ? 'http://localhost:4001' : 'http://localhost:3000';

const ROUTES = MODE === 'static' ? [
  // Static mode — every route ends in '/' so Apache/Express-static finds the index.html
  '/', '/brewing/', '/recipes/', '/recipe/1/', '/recipe/1/edit/',
  '/favorites/', '/alarms/', '/usage/', '/calibration/', '/firmware/',
  '/system-info/', '/settings/',
  '/setup/', '/connect/', '/main/', '/info/', '/info/security/',
  '/settings/general/', '/settings/backup/', '/settings/engineering/',
  '/settings/engineering/factory-reset/', '/settings/engineering/connection/',
  '/settings/firmware/', '/preview/',
] : [
  // Express mode — clean URLs (server.js handles routes)
  '/dashboard', '/brewing', '/recipes', '/recipe/1', '/recipe/1/edit',
  '/favorites', '/alarms', '/usage', '/calibration', '/firmware',
  '/system-info', '/settings',
  '/setup', '/connect', '/main', '/info', '/info/security',
  '/settings/general', '/settings/backup', '/settings/engineering',
  '/settings/engineering/factory-reset?dev=1',
  '/settings/engineering/connection?dev=1',
  '/settings/firmware', '/preview/',
];

const EXEC = '/home/stm32mp1/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome';
const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox'] });

console.log(`Audit ${MODE} mode → ${BASE}\n`);
const out = [];
for (const path of ROUTES) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('JS: ' + e.message.slice(0, 140)));
  page.on('console', m => { if (m.type() === 'error') errs.push('C: ' + m.text().slice(0, 140)); });
  let v = '✅', status = '?';
  try {
    const r = await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(700);
    status = r ? r.status() : 0;
    const text = await page.evaluate(() => document.body ? document.body.innerText : '');
    if (status !== 200 && status !== 302) v = `❌ ${status}`;
    else if (errs.some(e => /TypeError|ReferenceError|Cannot read/i.test(e))) v = '❌ js';
    else if (text.includes('NaN')) v = '⚠️ NaN';
    else if (errs.length > 1) v = `⚠️ warn:${errs.length}`;
  } catch (e) {
    v = '🔥';
  }
  out.push({ path, v, status, errs: errs.length });
  console.log(`[${v.padEnd(10)}] ${path.padEnd(44)} ${status}  errs=${errs.length}`);
  await ctx.close();
}
await browser.close();

const ok = out.filter(r => r.v === '✅').length;
console.log(`\nResult: ${ok}/${out.length} routes pass`);
process.exit(ok === out.length ? 0 : 1);
