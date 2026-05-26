/* ═══════════════════════════════════════════════════════
   iRHEA-Light — Global App JS
   ═══════════════════════════════════════════════════════ */

// ── Base Path (set by config.js for GitHub Pages) ──────
const BASE_PATH = window.BASE_PATH || '';

// Navigate with base path support
function nav(path) {
  return BASE_PATH + path;
}

// Get URL path segment accounting for base path offset
function pathSegment(index) {
  const baseOffset = BASE_PATH.split('/').filter(Boolean).length;
  return window.location.pathname.split('/')[index + baseOffset];
}

// ── More Menu Toggle ────────────────────────────────────
function toggleMoreMenu() {
  const overlay = document.getElementById('more-overlay');
  const menu = document.getElementById('more-menu');
  overlay.classList.toggle('active');
  menu.classList.toggle('active');
}

function closeMoreMenu() {
  const overlay = document.getElementById('more-overlay');
  const menu = document.getElementById('more-menu');
  overlay.classList.remove('active');
  menu.classList.remove('active');
}

// ── Clock ──────────────────────────────────────────────
function updateClock() {
  const el = document.getElementById('topbar-clock');
  if (!el) return;
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  el.textContent = `${hh}:${mm}:${ss}`;
}
setInterval(updateClock, 1000);
updateClock();

// ── Toast System ───────────────────────────────────────
const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
  },

  show(message, type = 'info', duration = 3000) {
    if (!this.container) this.init();
    const icons = {
      success: '\u2713',
      warning: '\u26A0',
      error: '\u2717',
      info: '\u2139'
    };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success(msg, d) { this.show(msg, 'success', d); },
  warning(msg, d) { this.show(msg, 'warning', d); },
  error(msg, d) { this.show(msg, 'error', d); },
  info(msg, d) { this.show(msg, 'info', d); }
};

// ── API Helper ─────────────────────────────────────────
async function api(endpoint) {
  // Static mode is signalled by window.STATIC_MODE (set by build.js) OR by
  // BASE_PATH being a non-empty subpath (GitHub Pages style).
  const staticMode = (typeof STATIC_MODE !== 'undefined' && STATIC_MODE) || !!BASE_PATH;
  if (staticMode) {
    const prefix = BASE_PATH || '';
    const recipeMatch = endpoint.match(/^recipes\/(\d+)$/);
    if (recipeMatch) {
      const res = await fetch(`${prefix}/api/recipes.json`);
      const recipes = await res.json();
      return recipes.find(r => r.id === parseInt(recipeMatch[1]));
    }
    const res = await fetch(`${prefix}/api/${endpoint}.json`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }
  // Express mode: fetch from server API
  const res = await fetch(`/api/${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Helper for IR pages to use static-mode-aware fetch.
// Use as: irFetch('spouts'), irFetch('general-config').
window.irFetch = function (endpoint) {
  const staticMode = (typeof STATIC_MODE !== 'undefined' && STATIC_MODE) || !!BASE_PATH;
  if (staticMode) {
    const prefix = BASE_PATH || '';
    return fetch(`${prefix}/api/${endpoint.replace(/^\/?api\//, '')}.json`);
  }
  return fetch(endpoint.startsWith('/') ? endpoint : `/api/${endpoint}`);
};

// ── Format Helpers ─────────────────────────────────────
function formatTemp(val) {
  return `${val.toFixed(1)}°C`;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}

// ── WebSocket Simulator ────────────────────────────────
const WSSimulator = {
  listeners: {},
  intervals: [],

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  },

  emit(event, data) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  },

  startBoilerUpdates() {
    const id = setInterval(() => {
      this.emit('boiler', {
        temperature: 92 + (Math.random() - 0.5) * 2,
        waterLevel: 75 + (Math.random() - 0.5) * 5,
        pressure: 1.0 + (Math.random() - 0.5) * 0.1
      });
    }, 2000);
    this.intervals.push(id);
  },

  startBrewUpdates(totalDuration) {
    let elapsed = 0;
    const id = setInterval(() => {
      elapsed += 0.5;
      const progress = Math.min((elapsed / totalDuration) * 100, 100);
      this.emit('brew-progress', {
        elapsed,
        progress,
        temperature: 92 + (Math.random() - 0.5) * 1,
        flowRate: 3.5 + (Math.random() - 0.5) * 0.5,
        done: progress >= 100
      });
      if (progress >= 100) clearInterval(id);
    }, 500);
    this.intervals.push(id);
  },

  stopAll() {
    this.intervals.forEach(id => clearInterval(id));
    this.intervals = [];
    this.listeners = {};
  }
};

// ── Init ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
});
