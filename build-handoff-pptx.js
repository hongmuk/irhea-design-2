/**
 * Build HANDOFF.pptx from the same content as HANDOFF.md / HANDOFF.html.
 * Output: C:/Users/user/Desktop/HANDOFF.pptx
 *
 * Layout: 16:9 widescreen (13.333 × 7.5 in), Pretendard fallback to Malgun Gothic
 * for Korean rendering on Windows PowerPoint.
 */

const PptxGenJS = require('pptxgenjs');
const path = require('path');

const pres = new PptxGenJS();
pres.layout = 'LAYOUT_WIDE';      // 13.333 × 7.5
pres.title = 'iRHEA-Light UI ↔ C++ 백엔드 핸드오프';
pres.author = 'irhea-design-2';
pres.company = 'Noble Tree';
pres.subject = 'C++ backend handoff';

// ──────────── Theme tokens (match HANDOFF.html) ────────────
const C = {
  bg:    'FFFFFF',
  bg2:   'FAFAFA',
  ink:   '111111',
  ink2:  '444444',
  ink3:  '888888',
  hair:  'ECECEC',
  hair2: 'DDDDDD',
  brand: 'E60012',
  warn:  'C28200',
  ok:    '1A8054',
  sse:   '6E5A96',
};
const F = { kr: 'Malgun Gothic', mono: 'Consolas' };

// ──────────── Helpers ────────────
function slideBase(opts = {}) {
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  // Footer band
  slide.addShape('rect', { x: 0, y: 7.18, w: 13.333, h: 0.32, fill: { color: C.bg2 }, line: { color: C.hair, width: 0.5 } });
  slide.addText('iRHEA-Light UI ↔ C++ 백엔드 핸드오프 · v1.0 · 2026-05-19', {
    x: 0.3, y: 7.2, w: 9, h: 0.3, fontFace: F.kr, fontSize: 9, color: C.ink3,
  });
  if (opts.pageNo) {
    slide.addText(`${opts.pageNo}`, { x: 12.8, y: 7.2, w: 0.4, h: 0.3, fontFace: F.kr, fontSize: 9, color: C.ink3, align: 'right' });
  }
  return slide;
}

function sectionHeader(slide, title, sub) {
  // Left red bar
  slide.addShape('rect', { x: 0.4, y: 0.45, w: 0.06, h: 0.5, fill: { color: C.brand }, line: { color: C.brand } });
  slide.addText(title, {
    x: 0.6, y: 0.4, w: 12, h: 0.5, fontFace: F.kr, fontSize: 22, bold: true, color: C.ink, valign: 'middle',
  });
  if (sub) {
    slide.addText(sub, {
      x: 0.6, y: 0.95, w: 12, h: 0.3, fontFace: F.kr, fontSize: 11, color: C.ink3, valign: 'middle',
    });
  }
}

function tableBlock(slide, headers, rows, opts = {}) {
  const colW = opts.colW || headers.map(() => (12.5 / headers.length));
  const hdrRow = headers.map(h => ({
    text: h,
    options: { bold: true, fontFace: F.kr, fontSize: 10, color: C.ink2, fill: { color: C.bg2 }, align: 'left', valign: 'middle' },
  }));
  const bodyRows = rows.map(row => row.map((cell, i) => {
    const isCode = opts.codeCols && opts.codeCols.includes(i);
    return {
      text: typeof cell === 'string' ? cell : cell.text,
      options: Object.assign({
        fontFace: isCode ? F.mono : F.kr,
        fontSize: 9.5,
        color: C.ink,
        align: 'left',
        valign: 'middle',
      }, typeof cell === 'string' ? {} : (cell.options || {})),
    };
  }));
  slide.addTable([hdrRow, ...bodyRows], {
    x: opts.x || 0.45,
    y: opts.y || 1.5,
    w: opts.w || 12.45,
    colW: colW,
    border: { type: 'solid', color: C.hair, pt: 0.5 },
    rowH: opts.rowH || 0.32,
    fontFace: F.kr,
    fontSize: 9.5,
  });
}

// ─────────────── Slide 1: Title ───────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  // Left brand strip
  s.addShape('rect', { x: 0, y: 0, w: 0.25, h: 7.5, fill: { color: C.brand }, line: { color: C.brand } });
  s.addText('iRHEA-Light UI', {
    x: 1.0, y: 2.4, w: 11, h: 0.8, fontFace: F.kr, fontSize: 40, bold: true, color: C.ink, valign: 'bottom',
  });
  s.addText('↔  C++ 백엔드 핸드오프', {
    x: 1.0, y: 3.2, w: 11, h: 0.7, fontFace: F.kr, fontSize: 28, color: C.ink2, valign: 'top',
  });
  s.addText('Design 2 Cinema Gold 프로토타입을 Yocto 배포 가능한 시스템으로 이관하기 위한 사양서', {
    x: 1.0, y: 4.1, w: 11, h: 0.45, fontFace: F.kr, fontSize: 14, color: C.ink3,
  });
  s.addShape('line', { x: 1.0, y: 4.7, w: 4, h: 0, line: { color: C.brand, width: 1.5 } });
  s.addText('대상 · C++ 데몬·웹서버 구현팀\n근거 · IPC 정의 V0.1 + 파일 정의 + myapp_ipc + STM32MP1 BSP', {
    x: 1.0, y: 4.85, w: 11, h: 0.8, fontFace: F.kr, fontSize: 12, color: C.ink2, lineSpacingMultiple: 1.5,
  });
  s.addText('v1.0 · 2026-05-19 · Noble Tree', {
    x: 1.0, y: 6.6, w: 11, h: 0.3, fontFace: F.kr, fontSize: 10, color: C.ink3,
  });
}

// ─────────────── Slide 2: 시스템 개요 / 아키텍처 ───────────────
{
  const s = slideBase({ pageNo: 2 });
  sectionHeader(s, '1. 시스템 개요', '브라우저 → Apache → C++ webserver → UDS → C daemon → 보드');
  // Diagram (text-based, monospace)
  s.addShape('rect', { x: 0.45, y: 1.5, w: 12.45, h: 5.4, fill: { color: '1F2024' }, line: { color: '1F2024' } });
  s.addText(
`브라우저 (Chromium kiosk on STM32MP1)
   │ HTTP + SSE
   ▼
Apache2  (현재 동작 중, 정적 서빙)        ◄── 정적 docs/ 서빙 유지
   │
   │ /api/* 만 mod_proxy로 리버스          ◄── 추가 작업 (C++ 팀)
   ▼
C++ webserver  (8080 TCP, 신규 구현)
   │ UDS: ipc_cmd.sock  (REQ/RSP)
   │ UDS: ipc_evt.sock  (one-way push)
   ▼
C daemon  (신규 구현)
   │ CAN bus
   ▼
보드 (MCP / WHP / MDP / Nozzle × 5)
   │ 파일 시스템
   ▼
/opt/irhea/data/*.dat
/opt/irhea/log/*.log`,
    {
      x: 0.7, y: 1.7, w: 12, h: 5,
      fontFace: F.mono, fontSize: 13, color: 'E5E5E2', valign: 'top',
      lineSpacingMultiple: 1.2,
    }
  );
}

// ─────────────── Slide 3: 표기 (Legend) ───────────────
{
  const s = slideBase({ pageNo: 3 });
  sectionHeader(s, '2. /api ↔ IPC / 파일 매핑 — 표기', '표 안 매핑 컬럼에 사용된 6개 기호');
  tableBlock(s, ['기호', '의미'], [
    [{ text: '🔌', options: { color: C.brand, bold: true, fontSize: 14 } }, 'spec V0.1 정의된 IPC cmd'],
    [{ text: '🆕', options: { color: C.warn, bold: true, fontSize: 14 } }, 'spec에 없음 — V0.2 추가 필요 (담당자 협의)'],
    [{ text: '📄', options: { color: C.ok, bold: true, fontSize: 14 } }, '.dat 파일 read (웹서버가 직접)'],
    [{ text: '📝', options: { color: C.ok, bold: true, fontSize: 14 } }, '.dat 파일 write (데몬만, IPC 경유)'],
    [{ text: '🔀', options: { color: C.sse, bold: true, fontSize: 14 } }, 'SSE 이벤트 (ipc_evt.sock → /api/events)'],
    [{ text: '🏠', options: { color: C.ink3, bold: true, fontSize: 14 } }, '웹서버 로컬 처리 (IPC·파일 모두 무관)'],
  ], { colW: [1.5, 10.95], rowH: 0.5 });

  // Apache mod_proxy snippet
  s.addText('Apache mod_proxy 추가 설정', { x: 0.45, y: 5.0, w: 12, h: 0.3, fontFace: F.kr, fontSize: 12, bold: true, color: C.ink2 });
  s.addShape('rect', { x: 0.45, y: 5.35, w: 12.45, h: 1.6, fill: { color: '1F2024' }, line: { color: '1F2024' } });
  s.addText(
`ProxyPass        /api/   http://127.0.0.1:8080/api/
ProxyPassReverse /api/   http://127.0.0.1:8080/api/
ProxyPass        /api/events http://127.0.0.1:8080/api/events flushpackets=on
SetEnvIf Request_URI "^/api/events" no-gzip dont-vary`,
    { x: 0.6, y: 5.45, w: 12.2, h: 1.4, fontFace: F.mono, fontSize: 11, color: 'E5E5E2', valign: 'top', lineSpacingMultiple: 1.3 });
}

// ─────────────── Slide 4: §2.1 시스템 정보 / 초기 설정 ───────────────
{
  const s = slideBase({ pageNo: 4 });
  sectionHeader(s, '2.1 시스템 정보 / 초기 설정', '7 endpoints');
  tableBlock(s, ['Method', 'Path', 'Response', '매핑'], [
    ['GET', '/api/system-config', '{serialNumber, modelName, ...}', '📄 sys_info.dat'],
    ['POST', '/api/system-config/configure', '{ok}', '🆕 0x1601 SET_INITIAL_CONFIG'],
    ['POST', '/api/system-config/unconfigure', '{ok}', '(개발 전용)'],
    ['GET', '/api/connection', '{ipAddress, store, ...}', '📄 sys_info.dat 일부'],
    ['POST', '/api/connection', '{ok}', '🆕 0x1502 SET_CONNECTION'],
    ['POST', '/api/connection/test', '{ok, latencyMs}', '🔌 0x1001 GET_STATUS'],
    ['POST', '/api/admin/login', '{ok} / 401', '🏠 PAM / 로컬 hash'],
  ], { colW: [0.9, 3.3, 4.7, 3.55], codeCols: [1, 2, 3], rowH: 0.42, y: 1.5 });

  s.addShape('rect', { x: 0.45, y: 5.7, w: 12.45, h: 1.0, fill: { color: 'FFFBEE' }, line: { color: C.warn, width: 1 } });
  s.addText('시안 누락', { x: 0.65, y: 5.78, w: 12, h: 0.25, fontFace: F.kr, fontSize: 9, bold: true, color: C.warn, charSpacing: 1 });
  s.addText('admin 인증 위치 미정의. 권장: webserver 프로세스 안에서 검증, 성공 시 세션 쿠키 발급. SSE는 EventSource가 Authorization 헤더 못 보내므로 쿠키 기반 필수.', {
    x: 0.65, y: 5.98, w: 12, h: 0.7, fontFace: F.kr, fontSize: 11, color: C.ink2, lineSpacingMultiple: 1.3,
  });
}

// ─────────────── Slide 5: §2.2 추출구 상태 + §2.3 레시피 ───────────────
{
  const s = slideBase({ pageNo: 5 });
  sectionHeader(s, '2.2 추출구 상태  ·  2.3 레시피', '라이브 모니터링 + 12 레시피 CRUD');

  s.addText('2.2 추출구 상태 (라이브 모니터링)', { x: 0.45, y: 1.4, w: 12, h: 0.3, fontFace: F.kr, fontSize: 13, bold: true, color: C.ink });
  tableBlock(s, ['Method', 'Path', 'Response', '매핑'], [
    ['GET', '/api/spouts', '[{id, status, currentRecipeId, elapsedSec, totalSec, progressPct, extractCount, favoriteRecipeIds, calibration}, ...×5]', '🔌 0x1001 GET_STATUS + 0x1002 GET_CURRENT_BREW'],
  ], { colW: [0.9, 2.0, 6.0, 3.55], codeCols: [1, 2, 3], rowH: 0.9, y: 1.75 });
  s.addText('status enum: idle / extracting / complete / rinsing / watering', { x: 0.45, y: 2.85, w: 12, h: 0.3, fontFace: F.mono, fontSize: 10, color: C.ink2 });

  s.addText('2.3 레시피', { x: 0.45, y: 3.3, w: 12, h: 0.3, fontFace: F.kr, fontSize: 13, bold: true, color: C.ink });
  tableBlock(s, ['Method', 'Path', '매핑'], [
    ['GET', '/api/recipes', '📄 recipe_spoutN.dat × 5 (총 12 레시피)'],
    ['GET', '/api/recipes/:id', '📄'],
    ['POST', '/api/recipes', '🆕 0x1401 SAVE_RECIPE'],
    ['PUT', '/api/recipes/:id', '🆕 0x1401 SAVE_RECIPE (id 지정)'],
    ['DELETE', '/api/recipes/:id', '🆕 0x1402 DELETE_RECIPE'],
  ], { colW: [0.9, 3.0, 8.55], codeCols: [1], rowH: 0.32, y: 3.65 });

  s.addShape('rect', { x: 0.45, y: 6.0, w: 12.45, h: 0.7, fill: { color: 'FFFBEE' }, line: { color: C.warn, width: 1 } });
  s.addText('시안 누락 · 12 레시피의 분포 — recipe_spoutN.dat 각각에 12개 다 들어가는지, 추출구별로 다른 12개인지 모호. C++ 팀 결정 필요.', {
    x: 0.65, y: 6.1, w: 12, h: 0.55, fontFace: F.kr, fontSize: 11, color: C.ink2, lineSpacingMultiple: 1.3,
  });
}

// ─────────────── Slide 6: §2.4 + §2.5 ───────────────
{
  const s = slideBase({ pageNo: 6 });
  sectionHeader(s, '2.4 즐겨찾기  ·  2.5 추출 제어', 'Favorites slot CRUD + 6 brew/rinse/water commands');

  s.addText('2.4 즐겨찾기', { x: 0.45, y: 1.4, w: 12, h: 0.3, fontFace: F.kr, fontSize: 13, bold: true, color: C.ink });
  tableBlock(s, ['Method', 'Path', 'Body', '매핑'], [
    ['GET', '/api/favorites', '—', '📄 recipe_fav_spoutN.dat × 5'],
    ['PUT', '/api/favorites', '[{spoutId, slotA, slotB}, ...]', '🆕 0x1403 SET_FAVORITE'],
  ], { colW: [0.9, 2.0, 4.5, 5.05], codeCols: [1, 2], rowH: 0.36, y: 1.75 });

  s.addText('2.5 추출 제어', { x: 0.45, y: 2.85, w: 12, h: 0.3, fontFace: F.kr, fontSize: 13, bold: true, color: C.ink });
  tableBlock(s, ['Method', 'Path', 'Body', '매핑'], [
    ['POST', '/api/brew/start', '{recipe_id, spout, cup_size, start_source}', '🔌 0x1101 START_BREW'],
    ['POST', '/api/brew/stop', '{brew_job_id}', '🔌 0x1102 STOP_BREW'],
    ['POST', '/api/rinse/start', '{spout}', '🔌 0x1103 START_RINSE'],
    ['POST', '/api/rinse/stop', '{spout}', '🔌 0x1104 STOP_RINSE'],
    ['POST', '/api/water/start', '{spout, amount_ml}', '🔌 0x1105 START_WATER'],
    ['POST', '/api/water/stop', '{spout}', '🔌 0x1106 STOP_WATER'],
  ], { colW: [0.9, 2.5, 4.5, 4.55], codeCols: [1, 2], rowH: 0.36, y: 3.2 });

  s.addShape('rect', { x: 0.45, y: 5.95, w: 12.45, h: 0.75, fill: { color: 'F5FAFD' }, line: { color: C.sse, width: 1 } });
  s.addText('prototype 현황 · /brewing 페이지가 현재 22.5초 자동 시뮬레이션. 실배포 시 위 6개 엔드포인트 호출로 전환 필요. C++ 팀 ↔ UI 팀 합의 사항.', {
    x: 0.65, y: 6.05, w: 12, h: 0.6, fontFace: F.kr, fontSize: 11, color: C.ink2, lineSpacingMultiple: 1.3,
  });
}

// ─────────────── Slide 7: §2.6 + §2.7 알람/설정 ───────────────
{
  const s = slideBase({ pageNo: 7 });
  sectionHeader(s, '2.6 알람  ·  2.7 설정', '4 alarm cmds + 10 settings endpoints');

  s.addText('2.6 알람', { x: 0.45, y: 1.4, w: 6, h: 0.3, fontFace: F.kr, fontSize: 13, bold: true, color: C.ink });
  tableBlock(s, ['Method', 'Path', '매핑'], [
    ['GET', '/api/alarms', '🔌 0x1003 GET_ACTIVE_ALARMS'],
    ['POST', '/api/alarms/:id/ack', '🔌 0x1201 ACK_ALARM'],
    ['POST', '/api/alarms/buzzer/stop', '🔌 0x1202 STOP_BUZZER'],
    ['POST', '/api/warnings/clear', '🔌 0x1203 CLEAR_WARNING'],
  ], { colW: [0.8, 2.6, 2.6], codeCols: [1], rowH: 0.34, y: 1.75, x: 0.45, w: 6 });

  s.addText('2.7 설정', { x: 6.85, y: 1.4, w: 6, h: 0.3, fontFace: F.kr, fontSize: 13, bold: true, color: C.ink });
  tableBlock(s, ['Method', 'Path', '매핑'], [
    ['GET', '/api/general-config', '📄 common_env.dat'],
    ['POST', '/api/general-config', '🆕 0x1501 SET_COMMON_ENV'],
    ['GET', '/api/boiler-info', '📄 sys_info.dat'],
    ['POST', '/api/boiler-info', '🆕 0x1502 SET_BOILER'],
    ['GET', '/api/pour-range', '📄 default_pour_range_spiral.dat'],
    ['POST', '/api/pour-range', '🆕 0x1503 SET_POUR_RANGE'],
    ['GET', '/api/pump-calibration', '📄 calibration_spoutN.dat × 5'],
    ['POST', '/api/pump-calibration', '🆕 0x1504 SET_PUMP_CALIBRATION'],
    ['GET', '/api/water-rinse', '📄 default_drip_env.dat'],
    ['POST', '/api/water-rinse', '🆕 0x1505 SET_WATER_RINSE'],
  ], { colW: [0.7, 2.6, 2.7], codeCols: [1], rowH: 0.34, y: 1.75, x: 6.85, w: 6 });
}

// ─────────────── Slide 8: §2.8 + §2.9 + §2.10 펌웨어/시스템/로그 ───────────────
{
  const s = slideBase({ pageNo: 8 });
  sectionHeader(s, '2.8 펌웨어  ·  2.9 시스템 작업  ·  2.10 로그', '6 + 3 + 4 endpoints');

  s.addText('2.8 펌웨어', { x: 0.45, y: 1.4, w: 12, h: 0.3, fontFace: F.kr, fontSize: 13, bold: true, color: C.ink });
  tableBlock(s, ['Method', 'Path', '매핑'], [
    ['GET',  '/api/firmware/status',  '🔌 0x1004 GET_FW_STATUS'],
    ['GET',  '/api/firmware/files',   '🔌 0x1303 GET_FW_FILE_LIST'],
    ['GET',  '/api/firmware/targets', '🔌 0x1304 GET_FW_TARGET_LIST'],
    ['POST', '/api/firmware/start',   '🔌 0x1301 START_FW_UPDATE'],
    ['POST', '/api/firmware/cancel',  '🔌 0x1302 CANCEL_FW_UPDATE'],
  ], { colW: [0.8, 3.5, 2.0], codeCols: [1], rowH: 0.3, y: 1.75, x: 0.45, w: 6.3 });

  s.addText('2.9 시스템 작업', { x: 7.0, y: 1.4, w: 6, h: 0.3, fontFace: F.kr, fontSize: 13, bold: true, color: C.ink });
  tableBlock(s, ['Path', '매핑'], [
    ['/api/factory-reset', '🆕 0x1601 FACTORY_RESET'],
    ['/api/backup',        '🆕 0x1602 BACKUP_USB'],
    ['/api/restore',       '🆕 0x1603 RESTORE_USB'],
  ], { colW: [2.8, 3.05], codeCols: [0], rowH: 0.3, y: 1.75, x: 7.0, w: 5.85 });

  s.addText('2.10 로그 / 사용 실적', { x: 0.45, y: 4.3, w: 12, h: 0.3, fontFace: F.kr, fontSize: 13, bold: true, color: C.ink });
  tableBlock(s, ['Method', 'Path', 'Query', '매핑'], [
    ['GET', '/api/error-log',  '?from=YYYY-MM-DD&to=YYYY-MM-DD', '📄 error_YYYYMMDD.log scan'],
    ['GET', '/api/system-log', '동일', '📄 동일'],
    ['GET', '/api/usage-info', '—', '📄 usage_info.dat'],
    ['GET', '/api/usage-stats','?from=...&to=...', '📄 usage_YYYYMMDD.log'],
  ], { colW: [0.8, 2.4, 4.0, 5.25], codeCols: [1, 2, 3], rowH: 0.32, y: 4.65 });
}

// ─────────────── Slide 9: §2.11 SSE 이벤트 채널 ───────────────
{
  const s = slideBase({ pageNo: 9 });
  sectionHeader(s, '2.11 이벤트 스트림 (SSE)', 'GET /api/events — text/event-stream');

  tableBlock(s, ['Method', 'Path', '응답', '매핑'], [
    ['GET', '/api/events', 'text/event-stream (SSE)', '🔀 ipc_evt.sock 모든 EVT relay'],
  ], { colW: [0.8, 2.5, 4.5, 4.65], codeCols: [1, 2, 3], rowH: 0.45, y: 1.5 });

  s.addText('SSE 프레임 포맷', { x: 0.45, y: 2.6, w: 12, h: 0.3, fontFace: F.kr, fontSize: 12, bold: true, color: C.ink2 });
  s.addShape('rect', { x: 0.45, y: 2.95, w: 12.45, h: 1.8, fill: { color: '1F2024' }, line: { color: '1F2024' } });
  s.addText(
`event: brew_progress
id: 12345
data: {"brew_job_id":"BREW_20260324_0001","state":"brewing","progress":45,"current_stage":2,"remain_sec":22}
`,
    { x: 0.65, y: 3.05, w: 12.1, h: 1.7, fontFace: F.mono, fontSize: 12, color: 'E5E5E2', valign: 'top', lineSpacingMultiple: 1.4 });

  s.addText([
    { text: 'event:', options: { bold: true, fontFace: F.mono, fontSize: 11, color: C.ink } },
    { text: ' = cmd 코드 매핑 enum (lowercase) — brew_started, brew_progress, alarm_raised, fw_progress, ...\n', options: { fontFace: F.kr, fontSize: 11, color: C.ink2 } },
    { text: 'id:', options: { bold: true, fontFace: F.mono, fontSize: 11, color: C.ink } },
    { text: ' = IPC seq (Last-Event-ID 복원에 사용 → webserver ring buffer 필요)\n', options: { fontFace: F.kr, fontSize: 11, color: C.ink2 } },
    { text: 'data:', options: { bold: true, fontFace: F.mono, fontSize: 11, color: C.ink } },
    { text: ' = JSON body (IPC body 그대로)', options: { fontFace: F.kr, fontSize: 11, color: C.ink2 } },
  ], { x: 0.45, y: 5.05, w: 12.45, h: 1.7, lineSpacingMultiple: 1.4, valign: 'top' });
}

// ─────────────── Slide 10: §3.1 recipe_spoutN.dat ↔ recipes.json ───────────────
{
  const s = slideBase({ pageNo: 10 });
  sectionHeader(s, '3.1 recipe_spoutN.dat ↔ recipes.json', '주요 필드 매핑 — 핵심 + bloom + stage');

  tableBlock(s, ['.dat 필드', '타입', 'mock JSON', 'UI 표시'], [
    ['index',                'uint8/16',   'id',                   '좌측 레일 "레시피 N"'],
    ['recipe_name',          'string ≤80', 'name',                 '상세 패널 제목'],
    ['bean_weight',          'uint16',     'coffeeWeight',         '"원두량 20 g"'],
    ['extraction_ratio',     'float',      'extractionRatio',      '"추출 비율 1:16"'],
    ['extraction_unit',      'uint8',      'extraction_unit',      '"Percent (%)"'],
    ['bean_grind_degree',    'int8',       'grindSize',            '"분쇄도 18"'],
    ['use_dripper',          'string',     'dripper',              '"드립퍼 Hario"'],
    ['favorite_flag',        'uint8',      'favorite',             '★ 표시'],
    ['recipe_description',   'string',     'notes',                'NOTE 영역'],
    ['bloom_water_volume',   'uint16',     'bloom.waterVolume',    '"양 40 ml"'],
    ['bloom_waittime',       'uint16',     'bloom.waitTime',       '"휴지 30 s"'],
    ['bloom_flowrate',       'float',      'bloom.flowRate',       '"유속 3.5"'],
    ['stages 1st~10th',      '— group —',  'stages[] 배열',        '추출단계 행'],
    ['brew_waittime',        'uint16',     'stages[].time',        '"휴지 25 s"'],
    ['brew_flowrate',        'float',      'stages[].flowRate',    '"유속 4.0 ★"'],
  ], { colW: [3.0, 1.8, 3.6, 4.05], codeCols: [0, 1, 2], rowH: 0.30, y: 1.5 });
}

// ─────────────── Slide 11: §3.1 차이점 + §3.2 common_env ───────────────
{
  const s = slideBase({ pageNo: 11 });
  sectionHeader(s, '3.1 중요 차이  ·  3.2 common_env.dat', 'spec vs mock 격차 + 환경 설정 매핑');

  s.addShape('rect', { x: 0.45, y: 1.4, w: 12.45, h: 2.0, fill: { color: 'FFFBEE' }, line: { color: C.warn, width: 1 } });
  s.addText('중요 차이 — recipe', { x: 0.65, y: 1.5, w: 12, h: 0.3, fontFace: F.kr, fontSize: 12, bold: true, color: C.warn });
  s.addText([
    { text: '• prototype mock의 stages 배열은 type: "bloom" | "pause" | "pour" 혼합. spec은 bloom 별도 + brew 1st~10th 분리. C++ 직렬화 시 분리 필요.\n', options: { fontFace: F.kr, fontSize: 11, color: C.ink2 } },
    { text: '• spec extraction_ratio 가 float 인데 prototype은 "1:16" 문자열. 응답 시 extractionRatio: 16.0 별도 필드로 제공 권장.\n', options: { fontFace: F.kr, fontSize: 11, color: C.ink2 } },
    { text: '• bloom_temperature, agtron_number, pour_range_*, drip_count, bean_usage — mock에 없음. UI는 빈 값 처리하지만 spec 정의대로 채워야 표시.', options: { fontFace: F.kr, fontSize: 11, color: C.ink2 } },
  ], { x: 0.65, y: 1.85, w: 12.1, h: 1.5, lineSpacingMultiple: 1.4, valign: 'top' });

  s.addText('3.2 common_env.dat ↔ /api/general-config', { x: 0.45, y: 3.6, w: 12, h: 0.3, fontFace: F.kr, fontSize: 13, bold: true, color: C.ink });
  tableBlock(s, ['.dat 필드', 'mock 필드', 'UI'], [
    ['registration_check',     'system-config.json: configured',    '부팅 분기 /setup vs /connect'],
    ['model_no / serial_no',   'modelNumber / serialNumber',        '정보 페이지'],
    ['device_name',            'deviceName ("NT-iRHEA 1호기")',     'topbar brand-sub'],
    ['store_name',             'connection.json: store',            '연결 설정'],
    ['time_zone',              'system-config.json: timezone',      '/setup 타임존'],
    ['drip_count_spoutN',      'spouts.json[N].extractCount',       '메인 "누적 1,247회"'],
    ['language / use_alarm',   'general-config: language / alarm',  'KO·EN / 알람 토글'],
    ['(UI-only)',              'unit / dripper / theme',            '추출 단위 / 기본 드립퍼 / 테마'],
  ], { colW: [3.6, 4.2, 4.65], codeCols: [0, 1], rowH: 0.30, y: 3.95 });
}

// ─────────────── Slide 12: §3.3-3.9 나머지 .dat ↔ JSON 요약 ───────────────
{
  const s = slideBase({ pageNo: 12 });
  sectionHeader(s, '3.3 ~ 3.9 나머지 .dat 파일', '7개 파일 — sys_info / pour_range / calibration / drip_env / brew_spiral / usage / log');

  tableBlock(s, ['파일', '매핑 엔드포인트', '주요 필드'], [
    ['sys_info.dat',                  '/api/system-config, /api/boiler-info', 'mcp_version, whp_version, serial, model'],
    ['default_pour_range_spiral.dat', '/api/pour-range',                       'cup 1~4 radius (mm)'],
    ['calibration_spoutN.dat',        '/api/pump-calibration',                 '5단계 base/calibrated 유속'],
    ['default_drip_env.dat',          '/api/water-rinse',                      'drain/rinse flow rate, water volume'],
    ['default_brew_spiral.dat',       '(UI 미사용)',                            'Spiral 패턴 기본값 (레시피 생성 시)'],
    ['usage_info.dat',                '/api/usage-info, /api/usage-stats',    '총 추출횟수, 추출구별 누적'],
    ['error_YYYYMMDD.log',            '/api/error-log',                        'error_item, code, message, detail, timestamp'],
    ['usage_YYYYMMDD.log',            '/api/usage-stats',                      'recipe_name, bean_weight, timestamp'],
  ], { colW: [3.5, 4.0, 4.95], codeCols: [0, 1], rowH: 0.36, y: 1.5 });
}

// ─────────────── Slide 13: §4.1 SSE 0x21XX 브루잉 이벤트 ───────────────
{
  const s = slideBase({ pageNo: 13 });
  sectionHeader(s, '4.1 SSE 0x21XX 브루잉 이벤트', '5개 이벤트 → UI 반응');

  tableBlock(s, ['spec cmd', 'SSE event', 'data body', 'UI 반응'], [
    ['0x2101 BREW_STARTED',   'brew_started',    '{brew_job_id, source, recipe_id, spout}',                  '/main 추출구 카드 빨강 + 도넛 0%'],
    ['0x2102 BREW_PROGRESS',  'brew_progress',   '{brew_job_id, progress, current_stage, remain_sec}',       '도넛 % 갱신, Stage 강조'],
    ['0x2103 BREW_COMPLETED', 'brew_completed',  '{brew_job_id, yield_ml, avg_temp}',                        '/brewing/complete 모달 → 5초 후 /main'],
    ['0x2104 BREW_FAILED',    'brew_failed',     '{brew_job_id, reason}',                                    '빨강 토스트 + 카드 IDLE 복귀'],
    ['0x2105 BREW_REJECTED',  'brew_rejected',   '{reason: "machine_busy"}',                                 '황색 모달 "추출 시작 거부"'],
  ], { colW: [3.0, 2.2, 4.0, 3.25], codeCols: [0, 1, 2], rowH: 0.40, y: 1.5 });

  s.addText('flag 처리', { x: 0.45, y: 4.5, w: 12, h: 0.3, fontFace: F.kr, fontSize: 13, bold: true, color: C.ink });
  s.addText([
    { text: '0x00000001 IMPORTANT', options: { bold: true, fontFace: F.mono, fontSize: 11, color: C.ink } },
    { text: '  — 알림 UI 표시 필수\n', options: { fontFace: F.kr, fontSize: 11, color: C.ink2 } },
    { text: '0x00000002 POPUP', options: { bold: true, fontFace: F.mono, fontSize: 11, color: C.ink } },
    { text: '          — 모달로 띄움 (vs 토스트)\n', options: { fontFace: F.kr, fontSize: 11, color: C.ink2 } },
    { text: '0x00000003 BLOCKING', options: { bold: true, fontFace: F.mono, fontSize: 11, color: C.ink } },
    { text: '       — 다른 입력 막음 (예: 종료 진행)\n', options: { fontFace: F.kr, fontSize: 11, color: C.ink2 } },
    { text: '0x00000004 ACK_REQ', options: { bold: true, fontFace: F.mono, fontSize: 11, color: C.ink } },
    { text: '        — 사용자 확인 받아 0x1201 ACK_ALARM 회신', options: { fontFace: F.kr, fontSize: 11, color: C.ink2 } },
  ], { x: 0.65, y: 4.9, w: 12.2, h: 1.8, lineSpacingMultiple: 1.4, valign: 'top' });
}

// ─────────────── Slide 14: §4.2 + §4.3 SSE 시스템 + 펌웨어 이벤트 ───────────────
{
  const s = slideBase({ pageNo: 14 });
  sectionHeader(s, '4.2 시스템 이벤트  ·  4.3 펌웨어 이벤트', '5 + 12 events');

  s.addText('4.2 0x22XX 시스템 이벤트', { x: 0.45, y: 1.4, w: 12, h: 0.3, fontFace: F.kr, fontSize: 12, bold: true, color: C.ink });
  tableBlock(s, ['spec cmd', 'SSE event', 'UI 반응'], [
    ['0x2201 ALARM_RAISED',   'alarm_raised',    '빨강 모달 (popup flag) + topbar 빨강 점멸'],
    ['0x2202 ALARM_CLEARED',  'alarm_cleared',   '토스트 "해제됨" + 알람 리스트에서 제거'],
    ['0x2203 WARNING_RAISED', 'warning_raised',  '노랑 토스트 + warning level'],
    ['0x2204 WARNING_CLEARED','warning_cleared', '리스트에서 제거'],
    ['0x2205 SYSTEM_NOTICE',  'system_notice',   '정보 토스트 (4초)'],
  ], { colW: [3.0, 2.2, 7.25], codeCols: [0, 1], rowH: 0.30, y: 1.75 });

  s.addText('4.3 0x23XX 펌웨어 이벤트', { x: 0.45, y: 3.85, w: 12, h: 0.3, fontFace: F.kr, fontSize: 12, bold: true, color: C.ink });
  tableBlock(s, ['spec cmd', 'SSE event', 'UI 반응'], [
    ['0x2301 FW_FILE_DETECTED',  'fw_file_detected',  'USB 새 파일 표시'],
    ['0x2304 FW_VALIDATING',     'fw_validating',     '"검증 중" spinner'],
    ['0x2305 FW_VALID_OK',       'fw_valid_ok',       '"검증 성공" + 업그레이드 활성'],
    ['0x2307 FW_UPDATE_STARTED', 'fw_update_started', '진행률 0% 표시'],
    ['0x2308 FW_UPDATE_PROGRESS','fw_update_progress','% 갱신'],
    ['0x230A FW_UPDATE_SUCCESS', 'fw_update_success', '"완료" 모달 + 100%'],
    ['0x230B FW_UPDATE_FAIL',    'fw_update_fail',    '빨강 모달 "실패"'],
    ['0x230C FW_UPDATE_CANCELLED','fw_update_cancelled','"취소됨" + 0% 복귀'],
  ], { colW: [3.5, 2.5, 6.45], codeCols: [0, 1], rowH: 0.28, y: 4.2 });
}

// ─────────────── Slide 15: §5.1 신규 cmd 추가 필요 ───────────────
{
  const s = slideBase({ pageNo: 15 });
  sectionHeader(s, '5.1 V0.2 추가 필요 cmd (11개)', '시안 작성자 김현상 협의 필요');

  s.addShape('rect', { x: 0.45, y: 1.5, w: 12.45, h: 5.4, fill: { color: '1F2024' }, line: { color: '1F2024' } });
  s.addText(
`0x14XX  레시피 CRUD
  0x1401  SAVE_RECIPE          REQ {recipe object}  →  RSP {id}
  0x1402  DELETE_RECIPE        REQ {id}  →  RSP {ok}
  0x1403  SET_FAVORITE         REQ [{spoutId, slotA, slotB}]  →  RSP {ok}

0x15XX  설정 변경
  0x1501  SET_COMMON_ENV       REQ {partial common_env}  →  RSP {ok}
  0x1502  SET_BOILER           REQ {tempSet}  →  RSP {ok}
  0x1503  SET_POUR_RANGE       REQ {items: [{cup, radius}]}  →  RSP {ok}
  0x1504  SET_PUMP_CAL         REQ {spoutId, items}  →  RSP {ok}
  0x1505  SET_WATER_RINSE      REQ {water, rinse}  →  RSP {ok}

0x16XX  시스템 작업
  0x1601  FACTORY_RESET        REQ {categories: []}  →  RSP {ok} + 0x2205 NOTICE
  0x1602  BACKUP_USB           REQ {items: []}  →  RSP {ok}
  0x1603  RESTORE_USB          REQ {items: []}  →  RSP {ok}
  0x1604  SET_INITIAL_CONFIG   REQ {serial, model, timezone}  →  RSP {ok}`,
    { x: 0.65, y: 1.65, w: 12.1, h: 5.1, fontFace: F.mono, fontSize: 11, color: 'E5E5E2', valign: 'top', lineSpacingMultiple: 1.35 });
}

// ─────────────── Slide 16: §5.2 spec 모호 — 결정 필요 항목 ───────────────
{
  const s = slideBase({ pageNo: 16 });
  sectionHeader(s, '5.2 spec 모호 — C++ 팀 결정 필요 (10개)', '구현 시작 전 합의 필요');

  s.addText([
    { text: '1. 12 레시피 분포', options: { bold: true, fontFace: F.kr, fontSize: 11, color: C.ink } },
    { text: ' — recipe_spoutN.dat 각각에 12개 다 들어가는지, 추출구별 다른 12개인지?\n\n', options: { fontFace: F.kr, fontSize: 11, color: C.ink2 } },

    { text: '2. 레시피 stage 표현', options: { bold: true, fontFace: F.kr, fontSize: 11, color: C.ink } },
    { text: ' — spec은 bloom 별도 + brew 1st~10th. mock은 통합 배열. 어느 쪽 정규?\n\n', options: { fontFace: F.kr, fontSize: 11, color: C.ink2 } },

    { text: '3. admin 인증 위치', options: { bold: true, fontFace: F.kr, fontSize: 11, color: C.ink } },
    { text: ' — webserver 단독 vs daemon 위임? 권장: webserver + PAM\n\n', options: { fontFace: F.kr, fontSize: 11, color: C.ink2 } },

    { text: '4. 세션 모델', options: { bold: true, fontFace: F.kr, fontSize: 11, color: C.ink } },
    { text: ' — 쿠키 vs JWT vs IP 기반? (SSE는 쿠키 필수)\n\n', options: { fontFace: F.kr, fontSize: 11, color: C.ink2 } },

    { text: '5. 파일 락 정책', options: { bold: true, fontFace: F.kr, fontSize: 11, color: C.ink } },
    { text: ' — 데몬 단독 소유 vs atomic rename + inotify?\n\n', options: { fontFace: F.kr, fontSize: 11, color: C.ink2 } },

    { text: '6. systemd 의존성', options: { bold: true, fontFace: F.kr, fontSize: 11, color: C.ink } },
    { text: ' — daemon After=/Requires= 관계, restart policy?\n\n', options: { fontFace: F.kr, fontSize: 11, color: C.ink2 } },

    { text: '7. 이벤트 ring buffer 크기', options: { bold: true, fontFace: F.kr, fontSize: 11, color: C.ink } },
    { text: ' — 재시작 시 최근 N개 보존?\n\n', options: { fontFace: F.kr, fontSize: 11, color: C.ink2 } },

    { text: '8. seq 충돌', options: { bold: true, fontFace: F.kr, fontSize: 11, color: C.ink } },
    { text: ' — 다중 클라이언트 시 분리?\n\n', options: { fontFace: F.kr, fontSize: 11, color: C.ink2 } },

    { text: '9. HTTP 타임아웃 vs IPC seq 타임아웃', options: { bold: true, fontFace: F.kr, fontSize: 11, color: C.ink } },
    { text: ' — 추출 60초 이상 가능\n\n', options: { fontFace: F.kr, fontSize: 11, color: C.ink2 } },

    { text: '10. 로그 회전', options: { bold: true, fontFace: F.kr, fontSize: 11, color: C.ink } },
    { text: ' — 일별 → 월별 머지는 cron? daemon?', options: { fontFace: F.kr, fontSize: 11, color: C.ink2 } },
  ], { x: 0.45, y: 1.5, w: 12.45, h: 5.5, lineSpacingMultiple: 1.2, valign: 'top' });
}

// ─────────────── Slide 17: §6 마이그레이션 6단계 ───────────────
{
  const s = slideBase({ pageNo: 17 });
  sectionHeader(s, '6. 마이그레이션 6단계 제안', 'Phase 1 인프라 → Phase 6 보드 통신');

  const phases = [
    { p: 'Phase 1', dur: '1-2주', t: '인프라', d: 'myapp_ipc fork → recipe 2개 / 헤더 CDM1 40B 교체 / 2 소켓 / 0x1001 GET_STATUS / systemd / Apache proxy' },
    { p: 'Phase 2', dur: '2-3주', t: '라이브 모니터링', d: '0x1001/1002/1003 풍부화 / SSE /api/events / 0x2201 ALARM_RAISED relay / /main 1초 polling → SSE 전환' },
    { p: 'Phase 3', dur: '2-3주', t: '명령 실행', d: '0x1101 START_BREW + 0x2101/2102/2103 / 0x1102 STOP / 0x1201 ACK_ALARM' },
    { p: 'Phase 4', dur: '2-3주', t: '파일 데이터', d: 'recipe_spoutN.dat reader/writer / common_env.dat / 0x1401-1403 / 0x1501-1505' },
    { p: 'Phase 5', dur: '2-3주', t: '펌웨어·시스템', d: '0x13XX + 0x23XX / 0x1601 FACTORY_RESET / 0x1602/1603 USB / 로그 scan API' },
    { p: 'Phase 6', dur: '별도',  t: '보드 통신', d: 'CAN bus 드라이버 / MCP·WHP·MDP 프로토콜 — 본 문서 범위 외' },
  ];
  let y = 1.4;
  phases.forEach(ph => {
    s.addShape('rect', { x: 0.45, y: y, w: 0.06, h: 0.85, fill: { color: C.brand }, line: { color: C.brand } });
    s.addText([
      { text: ph.p + '  ', options: { bold: true, fontFace: F.kr, fontSize: 14, color: C.ink } },
      { text: ph.t, options: { bold: true, fontFace: F.kr, fontSize: 13, color: C.brand } },
      { text: '   · ' + ph.dur, options: { fontFace: F.kr, fontSize: 11, color: C.ink3 } },
    ], { x: 0.65, y: y, w: 12, h: 0.32 });
    s.addText(ph.d, {
      x: 0.65, y: y + 0.35, w: 12.2, h: 0.5, fontFace: F.kr, fontSize: 10.5, color: C.ink2, valign: 'top', lineSpacingMultiple: 1.3,
    });
    y += 0.95;
  });
}

// ─────────────── Slide 18: §7 + §8 참조 + 후속 액션 ───────────────
{
  const s = slideBase({ pageNo: 18 });
  sectionHeader(s, '7. 참조 자료  ·  8. 후속 액션', '문서 위치 + 담당자별 액션');

  s.addText('7. 참조 자료', { x: 0.45, y: 1.4, w: 12, h: 0.3, fontFace: F.kr, fontSize: 13, bold: true, color: C.ink });
  tableBlock(s, ['자료', '경로'], [
    ['핸드오프 문서 (HTML)', 'C:/Users/user/Desktop/HANDOFF.html'],
    ['핸드오프 문서 (Markdown)', 'irhea-design-2/HANDOFF.md'],
    ['Prototype 코드', 'github.com/hongmuk/irhea-design-2'],
    ['라이브 prototype', 'hongmuk.github.io/irhea-design-2'],
    ['IPC 정의 V0.1', 'iRHEA-LIGHT IPC 정의_260324.xlsx'],
    ['파일 정의', 'iRHEA-LIGHT 파일 정의.xlsx'],
    ['myapp_ipc 스켈레톤', 'myapp_ipc.zip'],
    ['STM32MP1 BSP', 'STM32MP1_hmsoft.zip → meta-myir-st/recipes-irhea/'],
  ], { colW: [3.5, 8.95], codeCols: [1], rowH: 0.30, y: 1.75 });

  s.addText('8. 후속 액션', { x: 0.45, y: 4.5, w: 12, h: 0.3, fontFace: F.kr, fontSize: 13, bold: true, color: C.ink });
  tableBlock(s, ['항목', '담당', '액션'], [
    ['spec V0.2 (0x14/15/16XX 추가)',  '김현상',         '본 문서 §5.1 검토'],
    ['prototype UI 변경 (실 백엔드 호출 전환)', 'UI 팀',  'Phase 2-3 진행 시 협의'],
    ['CAN bus spec',                    '보드 팀',        '본 문서 범위 외 — 별도 spec'],
    ['Yocto BSP 통합',                  'C++ 팀',         'Phase 1 시작'],
    ['STM32MP1 BSP에 새 docs/ 반영',    'C++ 팀 / UI 팀', 'irhea-light_1.0.bb 의 docs/ 교체'],
  ], { colW: [4.5, 2.5, 5.45], codeCols: [], rowH: 0.32, y: 4.85 });
}

// ─────────────── Slide 19: Closing ───────────────
{
  const s = pres.addSlide();
  s.background = { color: C.ink };
  s.addShape('rect', { x: 0, y: 0, w: 13.333, h: 0.06, fill: { color: C.brand }, line: { color: C.brand } });
  s.addText('iRHEA-Light UI', {
    x: 1.0, y: 2.8, w: 11, h: 0.7, fontFace: F.kr, fontSize: 36, bold: true, color: 'FFFFFF',
  });
  s.addText('↔  C++ 백엔드 핸드오프', {
    x: 1.0, y: 3.5, w: 11, h: 0.6, fontFace: F.kr, fontSize: 22, color: 'CCCCCC',
  });
  s.addText('v1.0  ·  2026-05-19  ·  Noble Tree', {
    x: 1.0, y: 4.5, w: 11, h: 0.4, fontFace: F.kr, fontSize: 13, color: '999999',
  });
  s.addText('질문 / 협의 항목은 §5 참조 — 김현상께 spec V0.2 제안', {
    x: 1.0, y: 5.2, w: 11, h: 0.4, fontFace: F.kr, fontSize: 11, color: '777777',
  });
}

// ─────────────── Write ───────────────
const outPath = 'C:/Users/user/Desktop/HANDOFF.pptx';
pres.writeFile({ fileName: outPath }).then(name => {
  console.log('PPT 생성 완료:', name);
});
