// iRHEA-Light 풀스크린 토글
// ──────────────────────────────────────────────────────────────────────
// 사이트 접속 시 자동 풀스크린은 브라우저 보안 정책상 불가 (사용자 제스처 필요).
// 두 가지로 대응:
//   1) PWA 설치 사용자: manifest.json 의 display: fullscreen 으로 standalone 실행 — 본 스크립트는 버튼 숨김
//   2) 브라우저로 직접 진입한 사용자: topbar 우측 ⛶ 버튼 1회 탭으로 Fullscreen API 호출
(function () {
  'use strict';

  // 이미 standalone PWA 모드 (디바이스에 설치되어 풀스크린으로 실행 중) 이면
  // 토글 버튼 자체가 무의미 — 버튼 안 보이게 두고 종료.
  function isStandalone() {
    return (
      window.matchMedia && (
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: standalone)').matches
      )
    ) || window.navigator.standalone === true; // iOS Safari home-screen webapp
  }

  function getFsElement() {
    return document.fullscreenElement
      || document.webkitFullscreenElement
      || document.msFullscreenElement
      || null;
  }

  function enterFullscreen() {
    var el = document.documentElement;
    var req = el.requestFullscreen
      || el.webkitRequestFullscreen
      || el.msRequestFullscreen;
    if (req) {
      // navigationUI: hide 옵션 — Android Chrome 에서 시스템 내비게이션 바까지 숨기려는 시도
      try { req.call(el, { navigationUI: 'hide' }); }
      catch (e) { req.call(el); }
    }
  }

  function exitFullscreen() {
    var exit = document.exitFullscreen
      || document.webkitExitFullscreen
      || document.msExitFullscreen;
    if (exit) exit.call(document);
  }

  function syncIcons(btn) {
    if (!btn) return;
    var inFs = !!getFsElement();
    var enter = btn.querySelector('.fs-ico-enter');
    var exit  = btn.querySelector('.fs-ico-exit');
    if (enter) enter.style.display = inFs ? 'none' : '';
    if (exit)  exit.style.display  = inFs ? '' : 'none';
    btn.setAttribute('aria-label', inFs ? '전체화면 종료' : '전체화면');
    btn.setAttribute('title',      inFs ? '전체화면 종료' : '전체화면');
  }

  function init() {
    var btn = document.getElementById('btn-fullscreen-top');
    if (!btn) return;

    // 이미 PWA standalone 으로 실행 중이면 버튼 안 보이게 — 토글이 의미 없음
    if (isStandalone()) {
      btn.hidden = true;
      return;
    }
    btn.hidden = false;

    btn.addEventListener('click', function () {
      if (getFsElement()) exitFullscreen();
      else enterFullscreen();
    });

    // 사용자가 ESC 등으로 빠져나갔을 때 아이콘 동기화
    ['fullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach(function (ev) {
      document.addEventListener(ev, function () { syncIcons(btn); });
    });
    syncIcons(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
