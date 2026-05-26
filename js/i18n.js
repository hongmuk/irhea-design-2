/*
 * 간단한 i18n (회의 피드백 v1.2: 영문 토글이 안 됨 → 동작하게)
 *
 * 사용:
 *   - HTML 요소에 data-i18n="key" 추가 → 토글 시 textContent 교체
 *   - data-i18n-attr="placeholder:key" → 해당 속성 교체
 *   - JS 에서: IRI18n.t('key') 또는 IRI18n.lang === 'en'
 *
 * 풀 번역은 매뉴얼 도착 후 (현재는 자주 보이는 핵심 라벨만).
 */
(function () {
  var DICT = {
    // 사이드바
    'nav.home':       { ko: '홈',          en: 'Home' },
    'nav.main':       { ko: '메인',        en: 'Main' },
    'nav.recipes':    { ko: '레시피',      en: 'Recipes' },
    'nav.favorites':  { ko: '즐겨찾기',    en: 'Favorites' },
    'nav.info':       { ko: '정보',        en: 'Info' },
    'nav.history':    { ko: '추출 실적',   en: 'History' },
    'nav.settings':   { ko: '설정',        en: 'Settings' },

    // 상태 라벨 (메인 카드)
    'status.idle':      { ko: '대기',     en: 'Idle' },
    'status.brewing':   { ko: '추출 중',  en: 'Brewing' },
    'status.complete':  { ko: '완료',     en: 'Done' },
    'status.rinsing':   { ko: '린스',     en: 'Rinse' },
    'status.watering':  { ko: '온수',     en: 'Water' },
    'status.sub.idle':       { ko: '대기 중',       en: 'Waiting' },
    'status.sub.brewing':    { ko: '진행 중',       en: 'In progress' },
    'status.sub.complete':   { ko: '서빙 대기',     en: 'Serve' },
    'status.sub.rinsing':    { ko: '린스 중',       en: 'Rinsing' },
    'status.sub.watering':   { ko: '온수 공급 중',  en: 'Dispensing' },

    // 단위 라벨
    'unit.bean':     { ko: '원두',     en: 'Bean' },
    'unit.ratio':    { ko: '비율',     en: 'Ratio' },
    'unit.water':    { ko: '추출',     en: 'Water' },
    'unit.favorites': { ko: '즐겨찾기', en: 'Favorites' },

    // 설정 탭
    'tab.general':     { ko: '장비 설정',         en: 'Device' },
    'tab.backup':      { ko: '백업 / 복구',       en: 'Backup' },
    'tab.firmware':    { ko: '펌웨어 업그레이드', en: 'Firmware' },
    // 회의 v1.1: "엔지니어링" → "관리자" 용어 통일
    'tab.engineering': { ko: '🔒 관리자 메뉴', en: '🔒 Admin' },

    // 공통 버튼
    'btn.save':   { ko: '저장',   en: 'Save' },
    'btn.cancel': { ko: '취소',   en: 'Cancel' },
    'btn.ok':     { ko: '확인',   en: 'OK' },
    'btn.back':   { ko: '복귀',   en: 'Back' },
    'btn.delete': { ko: '삭제',   en: 'Delete' },
    'btn.edit':   { ko: '편집',   en: 'Edit' },
    'btn.add':    { ko: '추가',   en: 'Add' }
  };

  var lang = localStorage.getItem('ir.lang') || 'ko';

  function t(key) {
    var entry = DICT[key];
    if (!entry) return key;
    return entry[lang] || entry.ko || key;
  }

  function applyAll(root) {
    root = root || document;
    // textContent
    root.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.dataset.i18n;
      el.textContent = t(key);
    });
    // attribute swap (data-i18n-attr="placeholder:key,title:key2")
    root.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      var spec = el.dataset.i18nAttr || '';
      spec.split(',').forEach(function (pair) {
        var parts = pair.split(':');
        if (parts.length === 2) el.setAttribute(parts[0].trim(), t(parts[1].trim()));
      });
    });
    // 페이지 단위로 IRI18n 사용 중인 JS 가 갱신해야 할 콜백
    if (window.IRI18n._listeners) {
      window.IRI18n._listeners.forEach(function (fn) { try { fn(lang); } catch (e) {} });
    }
  }

  function setLang(newLang) {
    if (newLang !== 'ko' && newLang !== 'en') return;
    lang = newLang;
    localStorage.setItem('ir.lang', lang);
    document.documentElement.setAttribute('data-lang', lang);
    applyAll();
  }

  function on(fn) {
    window.IRI18n._listeners = window.IRI18n._listeners || [];
    window.IRI18n._listeners.push(fn);
  }

  window.IRI18n = {
    t: t,
    get lang() { return lang; },
    set: setLang,
    apply: applyAll,
    on: on,
    _listeners: []
  };

  // 초기 적용
  document.documentElement.setAttribute('data-lang', lang);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { applyAll(); });
  } else {
    applyAll();
  }
})();
