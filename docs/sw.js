// iRHEA-Light Service Worker — minimal install enabler
// ──────────────────────────────────────────────────────────────────────
// Chrome 안드로이드의 PWA install prompt(`beforeinstallprompt`) 가 뜨려면
// 등록된 SW 가 fetch 핸들러를 갖고 있어야 함 (Chrome installability 기준).
// 캐싱 정책은 일부러 안 깖 — 데모 빌드 자주 갱신되니 stale-cache 문제 회피.
// 추후 오프라인 지원 필요해지면 여기서 캐싱 추가.

self.addEventListener('install', function (event) {
  // 새 SW 가 곧바로 활성화 (대기 없이) — 빌드 즉시 반영
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  // 모든 열려있는 탭에 즉시 적용
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  // 패스스루 — 네트워크 그대로
  event.respondWith(fetch(event.request));
});
