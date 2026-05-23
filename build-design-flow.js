/*
 * build-design-flow.js
 * 생성물: docs/design-flow.xlsx
 *
 * 사용자 조작 플로우 (User Task Flow) — iRHEA-Light 디자인 핸드오프용
 *
 * 시트 구성:
 *   1) 사용자 작업 플로우 (도식 — 각 작업별 단계 박스)
 *   2) 작업 단계 상세 표
 *   3) 화면 목록 (참고)
 *   4) 모달·Toast 카탈로그 (참고)
 *
 * 실행: node build-design-flow.js
 */

const ExcelJS = require('exceljs');
const path = require('path');

const OUT = path.join(__dirname, 'docs', 'design-flow.xlsx');

// ─── 팔레트 ─────────────────────────────────────────────
const C = {
  install:    'FF8E5DF6', // 보라 — 설치/초기
  daily:      'FFFF8C42', // 오렌지 — 일상 사용 (추출)
  recipe:     'FFFFB100', // 옐로우 — 레시피
  fav:        'FFFCD34D', // 라이트옐로우 — 즐겨찾기
  settings:   'FF14B8A6', // 틸 — 일반 설정
  maintenance:'FF0EA5E9', // 시안 — 백업/펌웨어 유지보수
  admin:      'FF6B7280', // 그레이 — 관리자
  info:       'FF3B82F6', // 블루 — 정보/보안
  system:     'FFDC2626', // 레드 — 시스템 (종료 등)
  // 공용
  white:      'FFFFFFFF',
  text:       'FF111827',
  arrow:      'FF374151',
  bg:         'FFF9FAFB',
  header:     'FF1F2937',
  hair:       'FFE5E7EB',
  step:       'FF1F2937', // 단계 박스 배경 (어두운 차콜)
  stepText:   'FFFFFFFF',
  screen:     'FFF3F4F6', // 화면 라벨 배경 (밝은 회색)
  screenText: 'FF4B5563'
};

const wb = new ExcelJS.Workbook();
wb.creator = 'iRHEA-Light Design';
wb.created = new Date();

// ─── 작업 데이터 ────────────────────────────────────────
const CAT_LABEL = {
  install:     '설치/초기',
  daily:       '일상 사용',
  recipe:      '레시피 관리',
  fav:         '즐겨찾기',
  settings:    '설정',
  maintenance: '유지보수',
  admin:       '관리자',
  info:        '정보/보안',
  system:      '시스템'
};

// 페르소나 정의 (순서대로 렌더링)
const PERSONAS = {
  barista: {
    name: '바리스타',
    sub:  '일상 사용자',
    desc: '매일 커피를 추출하고 머신을 운용. 빈도 가장 높음.',
    color: 'FFB45309'  // amber 700
  },
  manager: {
    name: '매장 관리자',
    sub:  '매장 운영자',
    desc: '레시피·즐겨찾기 관리, 백업·펌웨어 책임. 관리자 인증 필요.',
    color: 'FF0F766E'  // teal 700
  },
  engineer: {
    name: '설치 기사 / 엔지니어',
    sub:  '기술 지원',
    desc: '신규 설치, 시스템 점검, 공장 초기화 등 드물게 수행.',
    color: 'FF334155'  // slate 700
  }
};

const TASKS = [
  // ══════════════════════════════════════════════════════════════
  // 👤 바리스타 — 일상 사용자
  // ══════════════════════════════════════════════════════════════
  {
    id: 'T01', personaKey: 'barista', cat: 'daily', name: '레시피로 커피 추출',
    persona: '바리스타', freq: '하루 N회', duration: '3~5분',
    goal: '저장된 레시피로 1잔 추출',
    steps: [
      { a: '사이드바 [Recipes]',         s: '/main → /recipes' },
      { a: '검색 또는 카드 선택',         s: '상세 패널 표시' },
      { a: '[추출 시작] 클릭',           s: '/recipes → /brewing' },
      { a: '추출 진행 대기',             s: '단계별 progress (bloom/main/...)' },
      { a: '완료 화면 자동 표시',         s: '/brewing/complete' },
      { a: '[확인] 또는 5초 자동',        s: '→ /main' }
    ]
  },
  {
    id: 'T02', personaKey: 'barista', cat: 'daily', name: '추출 중단',
    persona: '바리스타', freq: '예외 상황', duration: '5초',
    goal: '진행 중인 추출을 즉시 멈춤',
    steps: [
      { a: '/brewing 에서 [중단]',       s: 'Confirm "추출 중단?" 모달' },
      { a: '[O] 클릭',                   s: 'clearInterval' },
      { a: '메인 화면 복귀',             s: '/main' }
    ]
  },
  {
    id: 'T03', personaKey: 'barista', cat: 'daily', name: '추출 결과 저장 · 즐겨찾기 추가',
    persona: '바리스타', freq: '필요 시', duration: '10초',
    goal: '맘에 든 추출 기록 보존 또는 즐겨찾기 등록',
    steps: [
      { a: '/brewing/complete 화면 표시', s: '5초 카운트다운 시작' },
      { a: '[저장] 또는 [즐겨찾기] 클릭', s: '카운트다운 취소' },
      { a: 'Toast 알림 확인',            s: '"저장됨" / "즐겨찾기 추가됨"' },
      { a: '[확인] 클릭 또는 머무름',     s: '→ /main' }
    ]
  },
  {
    id: 'T04', personaKey: 'barista', cat: 'recipe', name: '새 레시피 등록',
    persona: '바리스타 (1차) / 관리자', freq: '주 1-2회', duration: '약 2분',
    goal: '새로운 레시피 추가',
    steps: [
      { a: '사이드바 [Recipes]',         s: '/recipes 진입' },
      { a: '[+ 추가] 클릭',              s: '레시피 추가 폼 모달' },
      { a: '이름/원두량/비율/온도 입력',  s: '모달 폼' },
      { a: '드립퍼/분쇄도/노트 입력',     s: '모달 폼' },
      { a: '[추가] 클릭',                s: 'overlay.added.push + Toast' }
    ]
  },
  {
    id: 'T05', personaKey: 'barista', cat: 'recipe', name: '레시피 편집',
    persona: '바리스타 (1차) / 관리자', freq: '필요 시', duration: '1-2분',
    goal: '기존 레시피 값 수정',
    steps: [
      { a: '/recipes 진입',              s: '/recipes' },
      { a: '편집할 레시피 카드 선택',     s: '상세 패널 표시' },
      { a: '[편집] 클릭',                s: '편집 폼 모달 (prefill)' },
      { a: '값 수정 후 [저장]',          s: 'overlay.edited + Toast' }
    ]
  },
  {
    id: 'T06', personaKey: 'barista', cat: 'system', name: '장비 종료',
    persona: '바리스타 (마감)', freq: '일 1회', duration: '약 5초',
    goal: '머신 전원 OFF 절차 (소프트 → 물리)',
    steps: [
      { a: '탑바 [전원] 아이콘 클릭',    s: 'Confirm "종료?"' },
      { a: '[O] 확인',                   s: 'Modal "종료 중…" (버튼 없음)' },
      { a: '자동 진행',                  s: '2.5초 대기' },
      { a: 'Modal "전원 스위치 OFF"',    s: '대기 상태' },
      { a: '물리 전원 스위치 OFF',       s: '머신 종료' }
    ]
  },
  {
    id: 'T07', personaKey: 'barista', cat: 'system', name: '언어 변경 (KO ↔ EN)',
    persona: '바리스타', freq: '간헐', duration: '2초',
    goal: 'UI 표시 언어 전환',
    steps: [
      { a: '탑바 [KO ▼] 클릭',           s: '라벨 KO ↔ EN 토글' },
      { a: 'Toast 알림 확인',            s: '"한국어로 변경" / "English로 변경"' }
    ]
  },

  // ══════════════════════════════════════════════════════════════
  // 🏪 매장 관리자
  // ══════════════════════════════════════════════════════════════
  {
    id: 'T08', personaKey: 'manager', cat: 'admin', name: '관리자 메뉴 진입 (로그인)',
    persona: '관리자', freq: '관리 작업 시', duration: '20초',
    goal: '관리자 권한이 필요한 메뉴 접근 (이하 T09~T18 선결)',
    steps: [
      { a: 'Settings → 탭 [관리자 메뉴]', s: '자동 로그인 모달 표시' },
      { a: 'Admin ID + 비밀번호 입력',    s: '모달' },
      { a: '[연결] 클릭',                s: 'POST /api/admin/login' },
      { a: '성공 → 메뉴 진입',           s: 'sessionStorage 저장' },
      { a: '실패 → "암호 오류" 후 재시도', s: '로그인 모달 재오픈' }
    ]
  },
  {
    id: 'T09', personaKey: 'manager', cat: 'settings', name: '일반 설정 변경',
    persona: '관리자', freq: '필요 시', duration: '1-3분',
    goal: '기본 드립퍼, 보일러, 추출량 등 설정 변경',
    steps: [
      { a: '사이드바 [Settings]',         s: '→ /settings/general' },
      { a: '드립퍼 등 값 변경',           s: 'Picker 모달 → 선택 → Toast' },
      { a: '[설정 저장] 클릭',           s: 'Confirm "저장?"' },
      { a: '[O] 확인',                   s: 'Modal "저장됨"' }
    ]
  },
  {
    id: 'T10', personaKey: 'manager', cat: 'recipe', name: '레시피 삭제',
    persona: '관리자', freq: '간헐', duration: '20초',
    goal: '불필요한 레시피 제거 (단일 또는 일괄)',
    steps: [
      { a: '/recipes 진입',              s: '/recipes' },
      { a: '레시피 선택 (또는 다중 선택)', s: 'Toast "다중 선택 모드"' },
      { a: '[삭제] 클릭',                s: 'Confirm "복구불가" [error]' },
      { a: '[O] 확인',                   s: 'overlay.deleted + Toast (error)' }
    ]
  },
  {
    id: 'T11', personaKey: 'manager', cat: 'recipe', name: '클라우드 동기화',
    persona: '관리자', freq: '주기적', duration: '약 1-2초',
    goal: '클라우드와 레시피 동기화',
    steps: [
      { a: '/recipes 에서 [클라우드 동기화]', s: 'Toast "동기화 중…"' },
      { a: '대기',                        s: '약 1.2초' },
      { a: '완료 Toast 확인',             s: 'Toast "동기화 완료"' }
    ]
  },
  {
    id: 'T12', personaKey: 'manager', cat: 'fav', name: '즐겨찾기 매핑 변경',
    persona: '관리자', freq: '간헐', duration: '1-2분',
    goal: '추출구별 즐겨찾기 슬롯(A/B)에 레시피 매핑',
    steps: [
      { a: '사이드바 [Favorites]',       s: '/favorites 진입' },
      { a: '추출구 N · 슬롯 A 클릭',     s: 'RecipePicker 모달' },
      { a: '레시피 선택',                s: 'Toast "추출구 N · A = 레시피 N"' },
      { a: '슬롯 B / 다른 추출구 반복',  s: '/favorites' },
      { a: '[저장] 클릭',                s: 'Toast "매핑 저장됨"' }
    ]
  },
  {
    id: 'T13', personaKey: 'manager', cat: 'fav', name: '슬롯 비우기 / A↔B 스왑',
    persona: '관리자', freq: '간헐', duration: '5-10초',
    goal: '슬롯 매핑 제거 또는 위치 교환',
    steps: [
      { a: '/favorites 진입',            s: '/favorites' },
      { a: '슬롯 클릭 → [비우기]',        s: 'Toast "슬롯 비움"' },
      { a: '또는 [A↔B 스왑] 버튼',        s: 'Toast "A ↔ B 스왑"' }
    ]
  },
  {
    id: 'T14', personaKey: 'manager', cat: 'fav', name: '즐겨찾기 전체 해제',
    persona: '관리자', freq: '드물게', duration: '10초',
    goal: '모든 추출구의 즐겨찾기 초기화',
    steps: [
      { a: '/favorites 진입',            s: '/favorites' },
      { a: '[전체 해제] 클릭',           s: 'Confirm "전체 해제?" [error]' },
      { a: '[O] 확인',                   s: 'clearAllFavorites + Toast' }
    ]
  },
  {
    id: 'T15', personaKey: 'manager', cat: 'maintenance', name: 'USB 백업',
    persona: '관리자', freq: '주기적', duration: '1-2분',
    goal: '설정 / 레시피 데이터를 USB로 백업',
    steps: [
      { a: 'Settings → 탭 [USB 백업/복구]', s: '/settings/backup' },
      { a: '백업 모드 (기본)',            s: '/settings/backup' },
      { a: '백업할 항목 체크',            s: '여러 항목 선택 가능' },
      { a: '[실행] 클릭',                s: 'progress ring 0→100%' },
      { a: 'Modal "백업 완료" → 확인',    s: '/settings/backup' }
    ]
  },
  {
    id: 'T16', personaKey: 'manager', cat: 'maintenance', name: 'USB 복구',
    persona: '관리자', freq: '예외 상황', duration: '1-2분',
    goal: 'USB 백업본에서 데이터 복구',
    steps: [
      { a: 'Settings → 탭 [USB 백업/복구]', s: '/settings/backup' },
      { a: '[복구] 모드로 토글',          s: '/settings/backup' },
      { a: '복구할 항목 체크',            s: '여러 항목 선택 가능' },
      { a: '[실행] 클릭',                s: 'progress 0→100%' },
      { a: 'Modal "복구 완료" → 확인',    s: '/settings/backup' }
    ]
  },
  {
    id: 'T17', personaKey: 'manager', cat: 'maintenance', name: '펌웨어 업그레이드',
    persona: '관리자', freq: '릴리스 시', duration: '5-10분',
    goal: '최신 펌웨어로 업데이트',
    steps: [
      { a: 'Settings → 탭 [펌웨어]',     s: '/settings/firmware' },
      { a: '[확인] 클릭',                s: '현재/최신 버전 표시' },
      { a: '[업그레이드] 클릭',          s: 'Confirm 모달' },
      { a: '[O] 확인',                   s: 'progress ring 0→100%' },
      { a: 'Modal "업그레이드 완료"',    s: '확인 후 닫기' }
    ]
  },
  {
    id: 'T18', personaKey: 'manager', cat: 'admin', name: '장비 연결 설정 변경',
    persona: '관리자', freq: '드물게', duration: '약 2분',
    goal: '머신 IP / 매장명 / 디바이스 ID 등 변경',
    steps: [
      { a: '관리자 메뉴 → [장비 연결 설정]', s: '/settings/engineering/connection' },
      { a: 'IP/매장/디바이스ID 등 입력', s: '폼' },
      { a: '[테스트] 클릭 (선택)',        s: 'POST /test → 결과 표시' },
      { a: '[저장] 클릭',                s: 'Confirm "변경?"' },
      { a: '[O] 확인',                   s: 'POST → Modal "저장 완료"' }
    ]
  },

  // ══════════════════════════════════════════════════════════════
  // 🔧 설치 기사 / 엔지니어
  // ══════════════════════════════════════════════════════════════
  {
    id: 'T19', personaKey: 'engineer', cat: 'install', name: '머신 처음 설치',
    persona: '설치 기사', freq: '최초 1회', duration: '약 3분',
    goal: '신규 설치된 머신을 사용 가능 상태로 만든다',
    steps: [
      { a: '전원 ON',                   s: '/setup 자동 표시' },
      { a: '시리얼/모델/설치일자 입력',  s: '/setup' },
      { a: '[설정 저장] 클릭',          s: 'POST → /connect 이동' },
      { a: '[연결] 클릭',               s: '/connect (1.5초 대기)' },
      { a: '연결 성공 Toast 확인',       s: '0.8초 후 자동 이동' },
      { a: '메인 화면 도착',            s: '/main' }
    ]
  },
  {
    id: 'T20', personaKey: 'engineer', cat: 'install', name: 'WiFi 수동 설정 (AP 스캔)',
    persona: '설치 기사', freq: '자동 연결 실패 시', duration: '약 1분',
    goal: '자동 연결 실패 시 수동으로 AP 선택하여 연결',
    steps: [
      { a: '/connect 에서 [수동 설정]',    s: '→ /connect/ap-scan' },
      { a: 'AP 목록에서 선택',           s: 'SSID + 신호 표시' },
      { a: '[다음] 클릭',                s: 'Confirm 모달 표시' },
      { a: '[O] 확인',                   s: 'WiFi PW 입력 단계 (mock)' }
    ]
  },
  {
    id: 'T21', personaKey: 'engineer', cat: 'admin', name: '공장 초기화',
    persona: '설치 기사 / 관리자', freq: '드물게', duration: '약 1분',
    goal: '특정 카테고리 데이터를 초기화',
    steps: [
      { a: '관리자 메뉴 → [공장 초기화]', s: '/settings/engineering/factory-reset' },
      { a: '카테고리 선택 (5개 중 N개)',  s: '선택 수 표시 (N / 5)' },
      { a: '[실행] 클릭',                s: 'Confirm "복구불가" [error]' },
      { a: '[O] 확인',                   s: 'POST + Toast (error)' }
    ]
  },
  {
    id: 'T22', personaKey: 'engineer', cat: 'info', name: '시스템 정보 확인',
    persona: '엔지니어 / 관리자', freq: '필요 시', duration: '1분',
    goal: '시리얼·모델·펌웨어·설치일자·사용량 확인',
    steps: [
      { a: '사이드바 [System Info]',     s: '→ /info' },
      { a: '시스템/보일러/사용량 카드 확인', s: '/info' },
      { a: '"상세 보기 →" 클릭 (선택)',   s: '→ /info/security' },
      { a: '"변경 →" / "설정 →" 링크',    s: '→ /setup or /settings/general' }
    ]
  },
  {
    id: 'T23', personaKey: 'engineer', cat: 'info', name: '보안 로그 / 사용 통계 관리',
    persona: '엔지니어', freq: '드물게', duration: '1-2분',
    goal: '펌프/추출 사용 통계 백업 또는 초기화',
    steps: [
      { a: '/info → "상세 보기"',        s: '/info/security' },
      { a: '사용 통계 확인',             s: '/info/security' },
      { a: '[로그 백업] / [단일·전체 초기화]', s: 'Modal info / Confirm' },
      { a: '확인 → 완료',                s: 'Modal "완료"' }
    ]
  }
];

/* ═══════════════════════════════════════════════════════
   Sheet 1: 사용자 작업 플로우 (도식)
   ═══════════════════════════════════════════════════════ */
const s1 = wb.addWorksheet('사용자 작업 플로우', {
  views: [{ showGridLines: false, zoomScale: 100 }]
});

const TOTAL_COLS = 31;
// 컬럼 폭 — 각 단계 박스 4col, 화살 1col
// 1: 좌측 여백
// 2-5: 단계1, 6: 화살, 7-10: 단계2, 11: 화살, 12-15: 단계3, 16: 화살,
// 17-20: 단계4, 21: 화살, 22-25: 단계5, 26: 화살, 27-30: 단계6, 31: 여백
const COL_W = [
  3,           // 1 margin
  9, 9, 9, 9,  // 2-5 step1
  3,           // 6 arrow
  9, 9, 9, 9,  // 7-10 step2
  3,           // 11 arrow
  9, 9, 9, 9,  // 12-15 step3
  3,           // 16 arrow
  9, 9, 9, 9,  // 17-20 step4
  3,           // 21 arrow
  9, 9, 9, 9,  // 22-25 step5
  3,           // 26 arrow
  9, 9, 9, 9,  // 27-30 step6
  3            // 31 margin
];
COL_W.forEach((w, i) => s1.getColumn(i + 1).width = w);

const STEP_START_COLS = [2, 7, 12, 17, 22, 27];
const ARROW_COLS      = [6, 11, 16, 21, 26];

let row = 1;

// 타이틀
s1.mergeCells(row, 1, row, TOTAL_COLS);
const t1 = s1.getCell(row, 1);
t1.value = 'iRHEA-Light  ·  사용자 작업 플로우 (User Task Flow)';
t1.font = { bold: true, size: 24, color: { argb: C.header }, name: 'Pretendard' };
t1.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
s1.getRow(row).height = 44;
row++;

s1.mergeCells(row, 1, row, TOTAL_COLS);
const sub1 = s1.getCell(row, 1);
sub1.value = '각 작업(Task)별로 사용자가 거치는 단계와 화면 응답을 순서대로 표시. ' + TASKS.length + '개 작업.';
sub1.font = { size: 11, italic: true, color: { argb: '666666' }, name: 'Pretendard' };
sub1.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
s1.getRow(row).height = 24;
row++;

// 범례 (가로)
s1.mergeCells(row, 1, row, TOTAL_COLS);
const legendCell = s1.getCell(row, 1);
const legendItems = Object.keys(CAT_LABEL).map(k => `${CAT_LABEL[k]}`);
legendCell.value = '카테고리:  ' + legendItems.join('  ·  ');
legendCell.font = { size: 10, color: { argb: C.text }, name: 'Pretendard' };
legendCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' }};
legendCell.alignment = { vertical: 'middle', indent: 1 };
s1.getRow(row).height = 24;
row++;

// 범례 색상 칩 (가로)
const legendRow = row;
let legendCol = 2;
Object.keys(CAT_LABEL).forEach(key => {
  const chip = s1.getCell(legendRow, legendCol);
  chip.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C[key] }};
  chip.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }};
  s1.mergeCells(legendRow, legendCol + 1, legendRow, legendCol + 2);
  const lab = s1.getCell(legendRow, legendCol + 1);
  lab.value = CAT_LABEL[key];
  lab.font = { size: 10, color: { argb: C.text }, name: 'Pretendard' };
  lab.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  legendCol += 4;
});
s1.getRow(row).height = 22;
row++;
row++; // 빈 스페이서

// 작업 헤더 렌더
function renderTaskHeader(r, task) {
  // 행 1: 작업명 (전체 폭)
  s1.mergeCells(r, 1, r, TOTAL_COLS);
  const hCell = s1.getCell(r, 1);
  hCell.value = `${task.id}  ·  ${task.name}`;
  hCell.font = { bold: true, size: 16, color: { argb: C.white }, name: 'Pretendard' };
  hCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  hCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C[task.cat] }};
  s1.getRow(r).height = 32;

  // 행 2: 메타 (페르소나·빈도·소요·목표)
  const r2 = r + 1;
  s1.mergeCells(r2, 1, r2, TOTAL_COLS);
  const mCell = s1.getCell(r2, 1);
  mCell.value = {
    richText: [
      { text: '👤 ', font: { size: 11, name: 'Pretendard' }},
      { text: task.persona, font: { bold: true, size: 11, color: { argb: C.text }, name: 'Pretendard' }},
      { text: '   ·  ⏱ ', font: { size: 11, color: { argb: '666666' }, name: 'Pretendard' }},
      { text: task.freq + ' / ' + task.duration, font: { size: 11, color: { argb: C.text }, name: 'Pretendard' }},
      { text: '   ·  🎯 ', font: { size: 11, color: { argb: '666666' }, name: 'Pretendard' }},
      { text: task.goal, font: { size: 11, italic: true, color: { argb: C.text }, name: 'Pretendard' }}
    ]
  };
  mCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1, wrapText: true };
  mCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAFAFA' }};
  s1.getRow(r2).height = 26;
}

// 단계 박스 렌더
function renderStep(r, stepIdx, step) {
  const col = STEP_START_COLS[stepIdx];
  if (col === undefined) return;
  // 박스: r ~ r+2, col ~ col+3 (4 cols x 3 rows)
  s1.mergeCells(r, col, r + 2, col + 3);
  const cell = s1.getCell(r, col);
  cell.value = {
    richText: [
      { text: `${stepIdx + 1}.  `,  font: { bold: true, size: 11, color: { argb: 'FFD1D5DB' }, name: 'Pretendard' }},
      { text: step.a,                font: { bold: true, size: 11, color: { argb: C.stepText }, name: 'Pretendard' }},
      { text: '\n→ ',                font: { size: 10, color: { argb: 'FF9CA3AF' }, name: 'Pretendard' }},
      { text: step.s,                font: { size: 10, italic: true, color: { argb: 'FFD1D5DB' }, name: 'Pretendard' }}
    ]
  };
  cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true, indent: 1 };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.step }};
  const b = { style: 'thin', color: { argb: C.step }};
  cell.border = { top: b, left: b, bottom: b, right: b };
}

// 화살표 렌더
function renderArrow(r, col) {
  s1.mergeCells(r, col, r + 2, col);
  const cell = s1.getCell(r, col);
  cell.value = '▶';
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  cell.font = { size: 16, bold: true, color: { argb: C.arrow }};
}

// 페르소나 섹션 헤더 렌더
function renderPersonaBanner(r, personaKey) {
  const p = PERSONAS[personaKey];
  // 한 줄 큰 띠 (페르소나 이름 + 부제 + 설명)
  s1.mergeCells(r, 1, r, TOTAL_COLS);
  const cell = s1.getCell(r, 1);
  cell.value = {
    richText: [
      { text: '  ',                                   font: { size: 18 }},
      { text: p.name,                                 font: { bold: true, size: 18, color: { argb: C.white }, name: 'Pretendard' }},
      { text: '   ' + p.sub,                          font: { size: 12, color: { argb: 'FFE5E7EB' }, name: 'Pretendard' }},
      { text: '     ·     ',                          font: { size: 11, color: { argb: 'FFD1D5DB' }, name: 'Pretendard' }},
      { text: p.desc,                                 font: { italic: true, size: 11, color: { argb: 'FFD1D5DB' }, name: 'Pretendard' }}
    ]
  };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: p.color }};
  cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1, wrapText: true };
  s1.getRow(r).height = 40;
}

// 작업 렌더링 — 페르소나가 바뀔 때마다 배너 삽입
let lastPersona = null;
TASKS.forEach(task => {
  // 페르소나 전환 시 배너
  if (task.personaKey !== lastPersona) {
    if (lastPersona !== null) row++; // 페르소나 사이 스페이서
    renderPersonaBanner(row, task.personaKey);
    row++;
    row++; // 배너 다음 작은 스페이서
    lastPersona = task.personaKey;
  }

  renderTaskHeader(row, task);
  row += 2; // header + meta
  // 단계 박스 (최대 6개)
  const stepRow = row;
  s1.getRow(stepRow).height = 22;
  s1.getRow(stepRow + 1).height = 22;
  s1.getRow(stepRow + 2).height = 22;

  task.steps.forEach((step, i) => {
    if (i >= 6) return;
    renderStep(stepRow, i, step);
    if (i > 0) {
      renderArrow(stepRow, ARROW_COLS[i - 1]);
    }
  });
  row += 3; // 박스 3행
  row++; // 스페이서
});

s1.views = [{ state: 'frozen', ySplit: 5, showGridLines: false }];

/* ═══════════════════════════════════════════════════════
   Sheet 2: 작업 단계 상세 표
   ═══════════════════════════════════════════════════════ */
const s2 = wb.addWorksheet('작업 단계 표', { views: [{ showGridLines: false }] });
s2.columns = [
  { header: '작업 ID',    width: 8 },
  { header: '작업명',      width: 26 },
  { header: '카테고리',    width: 12 },
  { header: '페르소나',    width: 18 },
  { header: '빈도',        width: 14 },
  { header: '소요',        width: 12 },
  { header: '#',          width: 4 },
  { header: '사용자 액션', width: 36 },
  { header: '화면 / 시스템 응답', width: 40 }
];

let lastPersonaS2 = null;
TASKS.forEach(task => {
  // 페르소나 전환 시 그룹 헤더 행 삽입
  if (task.personaKey !== lastPersonaS2) {
    const p = PERSONAS[task.personaKey];
    const headerRow = s2.addRow(['', `▼  ${p.name}  ·  ${p.sub}  —  ${p.desc}`, '', '', '', '', '', '', '']);
    headerRow.height = 28;
    s2.mergeCells(headerRow.number, 2, headerRow.number, 9);
    const hCell = s2.getCell(headerRow.number, 2);
    hCell.font = { bold: true, size: 12, color: { argb: C.white }, name: 'Pretendard' };
    hCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: p.color }};
    hCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    lastPersonaS2 = task.personaKey;
  }
  task.steps.forEach((step, i) => {
    s2.addRow([
      i === 0 ? task.id : '',
      i === 0 ? task.name : '',
      i === 0 ? CAT_LABEL[task.cat] : '',
      i === 0 ? task.persona : '',
      i === 0 ? task.freq : '',
      i === 0 ? task.duration : '',
      i + 1,
      step.a,
      step.s
    ]);
  });
  // 작업 사이 구분
  s2.addRow([]);
});

s2.getRow(1).eachCell(cell => {
  cell.font = { bold: true, color: { argb: C.white }, size: 11 };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.header }};
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }};
});
s2.getRow(1).height = 24;

let currentCat = null;
for (let r = 2; r <= s2.rowCount; r++) {
  const row1 = s2.getRow(r);
  const idVal = s2.getCell(r, 1).value;
  const col2Val = s2.getCell(r, 2).value;
  // 페르소나 그룹 헤더 (col2가 ▼ 로 시작) — 스타일은 add 시점에 이미 적용됨, 건너뛰기
  if (typeof col2Val === 'string' && col2Val.startsWith('▼')) continue;
  if (!idVal && !s2.getCell(r, 7).value) {
    row1.height = 6;
    continue; // 구분 빈 행
  }
  row1.height = 22;
  row1.eachCell({ includeEmpty: true }, cell => {
    cell.font = { size: 10, name: 'Pretendard' };
    cell.alignment = { vertical: 'middle', wrapText: true };
    cell.border = { top: { style: 'thin', color: { argb: C.hair }}, left: { style: 'thin', color: { argb: C.hair }}, bottom: { style: 'thin', color: { argb: C.hair }}, right: { style: 'thin', color: { argb: C.hair }}};
  });
  // 첫 단계 행이면 작업명 강조
  if (idVal) {
    s2.getCell(r, 1).font = { size: 10, bold: true, color: { argb: '666666' }, name: 'Pretendard' };
    s2.getCell(r, 2).font = { size: 11, bold: true, color: { argb: C.text }, name: 'Pretendard' };
    const catCell = s2.getCell(r, 3);
    // 카테고리 → 색상 매핑 역참조
    const catKey = Object.keys(CAT_LABEL).find(k => CAT_LABEL[k] === catCell.value);
    if (catKey) {
      catCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C[catKey] }};
      catCell.font = { size: 10, bold: true, color: { argb: C.white }, name: 'Pretendard' };
      catCell.alignment = { horizontal: 'center', vertical: 'middle' };
    }
  }
  s2.getCell(r, 7).alignment = { horizontal: 'center', vertical: 'middle' };
  s2.getCell(r, 7).font = { size: 10, bold: true, color: { argb: '888888' }};
  s2.getCell(r, 9).font = { size: 10, italic: true, color: { argb: '666666' }, name: 'Pretendard' };
}
s2.views = [{ state: 'frozen', ySplit: 1, showGridLines: false }];

/* ═══════════════════════════════════════════════════════
   Sheet 3: 화면 목록 (참고)
   ═══════════════════════════════════════════════════════ */
const s3 = wb.addWorksheet('화면 목록', { views: [{ showGridLines: false }] });
s3.columns = [
  { header: 'ID', width: 6 },
  { header: '경로', width: 36 },
  { header: '화면명', width: 20 },
  { header: '분류', width: 12 },
  { header: '주 진입점', width: 32 },
  { header: '주요 작업 (Task ID)', width: 28 }
];

const SCREENS = [
  ['S01', '/setup',                                  '최초 설정',          '설치/초기',    '루트 / 진입',                       'T19 (설치), T22 (정보→변경)'],
  ['S02', '/connect',                                '장치 연결',          '설치/초기',    'setup 완료 후',                      'T19, T20'],
  ['S03', '/connect/ap-scan',                        'AP 스캔',            '설치/초기',    'connect 수동 설정',                  'T20'],
  ['S04', '/main',                                    '메인',               '일상 사용',    '연결 성공 / 모든 화면 복귀',         'T01, 모든 작업 hub'],
  ['S05', '/recipes',                                 '레시피',             '레시피 관리',  '사이드바 / 추출 진입',               'T01, T04, T05, T10, T11'],
  ['S06', '/brewing',                                 '추출 중',            '일상 사용',    '레시피 선택 후',                     'T01, T02'],
  ['S07', '/brewing/complete',                        '추출 완료',          '일상 사용',    'brewing 완료',                       'T01, T03'],
  ['S08', '/favorites',                               '즐겨찾기',           '즐겨찾기',     '사이드바',                           'T12, T13, T14'],
  ['S09', '/info',                                    '정보',               '정보/보안',    '사이드바',                           'T22'],
  ['S10', '/info/security',                           '보안 정보',          '정보/보안',    'info 상세 보기',                     'T22, T23'],
  ['S11', '/settings/general',                        '일반 설정',          '설정',         '사이드바',                           'T09'],
  ['S12', '/settings/backup',                         'USB 백업/복구',      '유지보수',     'settings 탭',                        'T15, T16'],
  ['S13', '/settings/engineering',                    '엔지니어링',         '관리자',       'settings 탭 (admin)',                'T08 (로그인 hub)'],
  ['S14', '/settings/engineering/factory-reset',      '공장 초기화',        '관리자',       'engineering 사이드',                 'T21'],
  ['S15', '/settings/engineering/connection',         '연결 설정',          '관리자',       'engineering 사이드',                 'T18'],
  ['S16', '/settings/firmware',                       '펌웨어 업그레이드',  '유지보수',     'settings 탭',                        'T17']
];
SCREENS.forEach(r => s3.addRow(r));
s3.getRow(1).eachCell(cell => {
  cell.font = { bold: true, color: { argb: C.white }, size: 11 };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.header }};
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }};
});
s3.getRow(1).height = 24;
for (let r = 2; r <= s3.rowCount; r++) {
  s3.getRow(r).height = 22;
  s3.getRow(r).eachCell({ includeEmpty: true }, cell => {
    cell.font = { size: 10, name: 'Pretendard' };
    cell.alignment = { vertical: 'middle', wrapText: true };
    cell.border = { top: { style: 'thin', color: { argb: C.hair }}, left: { style: 'thin', color: { argb: C.hair }}, bottom: { style: 'thin', color: { argb: C.hair }}, right: { style: 'thin', color: { argb: C.hair }}};
  });
  s3.getCell(r, 1).alignment = { horizontal: 'center', vertical: 'middle' };
  s3.getCell(r, 1).font = { size: 10, bold: true, color: { argb: '666666' }};
  s3.getCell(r, 2).font = { size: 10, name: 'Consolas', color: { argb: C.text }};
  const catCell = s3.getCell(r, 4);
  const catKey = Object.keys(CAT_LABEL).find(k => CAT_LABEL[k] === catCell.value);
  if (catKey) {
    catCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C[catKey] }};
    catCell.font = { size: 10, bold: true, color: { argb: C.white }, name: 'Pretendard' };
    catCell.alignment = { horizontal: 'center', vertical: 'middle' };
  }
}
s3.views = [{ state: 'frozen', ySplit: 1, showGridLines: false }];

/* ─── 저장 ───────────────────────────────────────────── */
wb.xlsx.writeFile(OUT).then(() => {
  const totalSteps = TASKS.reduce((sum, t) => sum + t.steps.length, 0);
  console.log('✓ 생성 완료:', OUT);
  console.log('  · 시트 1: 사용자 작업 플로우 (도식 — ' + TASKS.length + '개 작업)');
  console.log('  · 시트 2: 작업 단계 표 (' + totalSteps + '개 단계)');
  console.log('  · 시트 3: 화면 목록 (' + SCREENS.length + '개)');
});
