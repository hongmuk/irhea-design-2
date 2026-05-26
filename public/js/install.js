// iRHEA-Light PWA Install 자동화
// ──────────────────────────────────────────────────────────────────────
// 사용자가 사이트 접속 시 자동 풀스크린을 원하지만, 브라우저 보안상
// 페이지 로드 시점 자동 호출은 불가능. 차선책으로 PWA 설치를 유도 —
// 한 번 설치하면 홈 아이콘 탭 = 자동 풀스크린 진입.
//
// 1) Service Worker 등록 → Chrome installability 조건 충족
// 2) beforeinstallprompt 이벤트 캡처 (Android Chrome) → "설치" 버튼에 연결
// 3) iOS Safari 는 install prompt API 가 없음 → 수동 안내 텍스트
(function () {
  'use strict';

  function isStandalone() {
    return (
      window.matchMedia && (
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches
      )
    ) || window.navigator.standalone === true;
  }

  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  function wasDismissed() {
    try { return localStorage.getItem('ir.pwa.installDismissed') === '1'; }
    catch (e) { return false; }
  }
  function markDismissed() {
    try { localStorage.setItem('ir.pwa.installDismissed', '1'); } catch (e) {}
  }

  // ── 1) Service Worker 등록 ──
  if ('serviceWorker' in navigator) {
    // BASE_PATH 보정 (Pages 배포 시 /irhea-design-2 prefix). build.js 가
    // window.BASE_PATH 를 주입하므로 그대로 사용.
    var swUrl = (window.BASE_PATH || '') + '/sw.js';
    window.addEventListener('load', function () {
      navigator.serviceWorker.register(swUrl, {
        scope: (window.BASE_PATH || '') + '/'
      }).catch(function () { /* 등록 실패해도 사이트는 정상 동작 */ });
    });
  }

  // ── 2) beforeinstallprompt 캡처 (Android Chrome / Edge) ──
  var deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function (ev) {
    // 브라우저 기본 미니 인포바 표시 억제 — 우리 배너로 제어
    ev.preventDefault();
    deferredPrompt = ev;
    showBanner('android');
  });

  // 설치 완료 시 배너 숨김
  window.addEventListener('appinstalled', function () {
    hideBanner();
    markDismissed();
  });

  // ── 3) 배너 표시 / 숨김 ──
  function showBanner(kind) {
    if (isStandalone() || wasDismissed()) return;
    var banner = document.getElementById('pwa-install-banner');
    if (!banner) return;
    banner.dataset.kind = kind; // 'android' | 'ios' | 'generic'
    var msg = banner.querySelector('.pib-msg');
    var btn = banner.querySelector('.pib-install');
    if (kind === 'android') {
      msg.textContent = '풀스크린 모드로 사용하려면 홈 화면에 추가하세요.';
      btn.hidden = false;
      btn.textContent = '홈 화면에 추가';
    } else if (kind === 'ios') {
      msg.innerHTML = '풀스크린 모드로 사용하려면 <b>공유 → 홈 화면에 추가</b> 를 선택하세요.';
      btn.hidden = true;
    } else {
      msg.textContent = '풀스크린 모드를 원하면 브라우저 메뉴 → "홈 화면에 추가" 를 선택하세요.';
      btn.hidden = true;
    }
    banner.hidden = false;
  }

  function hideBanner() {
    var banner = document.getElementById('pwa-install-banner');
    if (banner) banner.hidden = true;
  }

  function init() {
    if (isStandalone()) { hideBanner(); return; }
    if (wasDismissed()) { hideBanner(); return; }

    var banner = document.getElementById('pwa-install-banner');
    if (!banner) return;

    // iOS Safari — install prompt event 없음, 즉시 안내 배너 표시
    if (isIOS()) {
      showBanner('ios');
    }
    // Android — beforeinstallprompt 이벤트 대기 (등록만 이미 위에서 함).
    // 이벤트가 발생하지 않는 케이스(이미 설치됨/기준 미충족) 에 대비해
    // 4초 후에도 prompt 없으면 generic 안내 표시.
    else {
      setTimeout(function () {
        if (!deferredPrompt && !isStandalone() && !wasDismissed()) {
          showBanner('generic');
        }
      }, 4000);
    }

    // 닫기 버튼 — 다시 표시 안 함
    banner.querySelector('.pib-close').addEventListener('click', function () {
      markDismissed();
      hideBanner();
    });

    // 설치 버튼 (Android Chrome) — 캡처해둔 prompt 호출
    banner.querySelector('.pib-install').addEventListener('click', function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (choice) {
        if (choice.outcome === 'accepted') {
          markDismissed();
          hideBanner();
        }
        deferredPrompt = null;
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
