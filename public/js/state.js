/* iRhea client state helper — localStorage-backed mock state.
   API 연동을 제외한 모든 사용자 변경(즐겨찾기·설정·레시피·추출 상태)은 이 헬퍼를 통해
   localStorage에 영구화한다. /api/* 엔드포인트의 정적 mock 데이터를 첫 로드 시 시드로 사용. */
(function () {
  var KEY = 'irhea.state.v1';

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }
  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  var state = load();

  function get(key, fallback) {
    return state[key] !== undefined ? state[key] : fallback;
  }
  function set(key, val) {
    state[key] = val;
    save(state);
  }
  function patch(partial) {
    Object.assign(state, partial);
    save(state);
  }
  function clear() {
    state = {};
    save(state);
  }

  // Favorites: per spout, array [r0, r1, r2, r3, r4] — 최대 5 슬롯 (회의 피드백 v1.1)
  var FAV_SLOTS = 5;
  function getFavorites(spouts) {
    var saved = get('favorites', null);
    if (saved) {
      // 기존 2-슬롯 데이터를 5-슬롯으로 마이그레이션
      Object.keys(saved).forEach(function (k) {
        var arr = saved[k] || [];
        while (arr.length < FAV_SLOTS) arr.push(null);
        saved[k] = arr.slice(0, FAV_SLOTS);
      });
      return saved;
    }
    var seed = {};
    (spouts || []).forEach(function (s) {
      var arr = (s.favoriteRecipeIds || []).slice(0, FAV_SLOTS);
      while (arr.length < FAV_SLOTS) arr.push(null);
      seed[s.id] = arr;
    });
    set('favorites', seed);
    return seed;
  }
  function setFavorite(spoutId, slot /* 0..4 */, recipeId) {
    var fav = get('favorites', {});
    if (!fav[spoutId]) fav[spoutId] = [null, null, null, null, null];
    fav[spoutId][slot] = recipeId;
    set('favorites', fav);
  }
  // swapFavorites: 회의 피드백 v1.1 — A↔B 스왑 개념 폐기 (추출구 고정 매핑)
  // 호환성 유지 위해 함수는 남기되, 단순 첫 두 슬롯 교환만 수행
  function swapFavorites(spoutId) {
    var fav = get('favorites', {});
    if (!fav[spoutId]) return;
    var a = fav[spoutId][0], b = fav[spoutId][1];
    fav[spoutId][0] = b; fav[spoutId][1] = a;
    set('favorites', fav);
  }
  function clearAllFavorites() {
    set('favorites', {});
  }

  // Settings — generic key/value with defaults
  function getSettings() {
    return get('settings', {
      unit: 'percent',
      alarm: true,
      dripper: 'Kalita',
      theme: 'dark',
      boilerTemp: 95
    });
  }
  function setSetting(k, v) {
    var s = getSettings();
    s[k] = v;
    set('settings', s);
  }

  // Recipes — overlay on top of API-served list
  function getRecipeOverlay() { return get('recipeOverlay', { added: [], edited: {}, deleted: [] }); }
  function setRecipeOverlay(o) { set('recipeOverlay', o); }
  function applyOverlay(serverRecipes) {
    var o = getRecipeOverlay();
    var byId = {};
    serverRecipes.forEach(function (r) { byId[r.id] = r; });
    o.added.forEach(function (r) { byId[r.id] = r; });
    Object.keys(o.edited).forEach(function (id) { byId[id] = Object.assign({}, byId[id], o.edited[id]); });
    o.deleted.forEach(function (id) { delete byId[id]; });
    return Object.values(byId).sort(function (a, b) { return a.id - b.id; });
  }

  // Brewing — current run state
  function getBrewing() { return get('brewing', null); }
  function startBrewing(spoutId, recipeId) {
    var run = { spoutId: spoutId, recipeId: recipeId, startedAt: Date.now(), totalSec: 480, progressPct: 0 };
    set('brewing', run);
    return run;
  }
  function updateBrewing(patch) {
    var run = get('brewing', null);
    if (!run) return null;
    Object.assign(run, patch);
    set('brewing', run);
    return run;
  }
  function endBrewing() { set('brewing', null); }

  window.IRState = {
    get: get, set: set, patch: patch, clear: clear,
    getFavorites: getFavorites, setFavorite: setFavorite, swapFavorites: swapFavorites, clearAllFavorites: clearAllFavorites,
    getSettings: getSettings, setSetting: setSetting,
    getRecipeOverlay: getRecipeOverlay, setRecipeOverlay: setRecipeOverlay, applyOverlay: applyOverlay,
    getBrewing: getBrewing, startBrewing: startBrewing, updateBrewing: updateBrewing, endBrewing: endBrewing
  };
})();
