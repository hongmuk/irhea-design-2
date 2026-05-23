/*
 * build-design-flow.js  ·  v3 (2026-05-24)
 * 생성물: docs/design-flow.xlsx
 *
 * 5/27 deliverable — wireframe v6.0 (5/12 작성) + 5/24 회의 결정 통합.
 *
 * 시트 (8개):
 *   1) 🎯 핵심 원칙 + 회의 변천사 (v0.9 → v1.0 → v1.1 → 5/13 → 5/24)
 *   2) 📊 작업 플로우 (도식 — 26 task)
 *   3) 📋 작업 단계 표 (대표님 비고란 포함)
 *   4) 📺 화면 목록 (와이어프레임 v6.0의 26 화면 + 비고)
 *   5) 🔐 권한 매트릭스 (4계층 + 화면별 접근)
 *   6) 🪟 팝업 카탈로그 (16종 v1.1 + 18행 컨텍스트)
 *   7) 🔀 화면 진입 매트릭스 (44행)
 *   8) ❓ 결정 대기 / v1.1 vs 5/24 충돌
 *
 * 실행: node build-design-flow.js
 */

const ExcelJS = require('exceljs');
const path = require('path');

const OUT = path.join(__dirname, 'docs', 'design-flow.xlsx');

// ─── 팔레트 ─────────────────────────────────────────────
const C = {
  install:'FF8E5DF6', daily:'FFFF8C42', recipe:'FFFFB100', fav:'FFFCD34D',
  settings:'FF14B8A6', maintenance:'FF0EA5E9', admin:'FF6B7280',
  info:'FF3B82F6', system:'FFDC2626',
  white:'FFFFFFFF', text:'FF111827', arrow:'FF374151',
  bg:'FFF9FAFB', header:'FF1F2937', hair:'FFE5E7EB',
  step:'FF1F2937', stepText:'FFFFFFFF',
  toneDefault:'FFE89E2D', toneError:'FFE60012', toneInfo:'FF111827',
  noteCol:'FFFEFCE8',
  // 권한
  guest:'FFE5E7EB', user:'FFB45309', distributor:'FF0F766E', dev:'FF334155',
  // 결과
  ok:'FF15803D', warn:'FFD97706', err:'FFDC2626'
};
const CAT_LABEL = {
  install:'설치/초기', daily:'일상 사용', recipe:'레시피 관리', fav:'즐겨찾기',
  settings:'설정', maintenance:'유지보수', admin:'관리자', info:'정보/실적', system:'시스템'
};

const wb = new ExcelJS.Workbook();
wb.creator = 'iRHEA-Light Design v3 (wireframe v6.0 + 5/24 회의)';
wb.created = new Date();

// 공통 스타일 helper
function styleHeader(row, colorBg) {
  row.eachCell(cell => {
    cell.font = { bold:true, color:{argb:'FFFFFFFF'}, size:11 };
    cell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:colorBg||C.header}};
    cell.alignment = { horizontal:'center', vertical:'middle' };
    cell.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'}};
  });
  row.height = 26;
}
function styleDataRow(row, height=24) {
  row.height = height;
  row.eachCell({ includeEmpty:true }, cell => {
    cell.font = { size:10, name:'Pretendard' };
    cell.alignment = { vertical:'middle', wrapText:true };
    cell.border = { top:{style:'thin', color:{argb:C.hair}}, left:{style:'thin', color:{argb:C.hair}}, bottom:{style:'thin', color:{argb:C.hair}}, right:{style:'thin', color:{argb:C.hair}}};
  });
}

/* ═════════════════════════════════════════════════════════════════
   시트 1: 🎯 핵심 원칙 + 회의 변천사
   ═════════════════════════════════════════════════════════════════ */
const PRINCIPLES = [
  { num:'1.1', title:'태블릿 = 설정 + 상태 도구',         detail:'추출/워터/린스/취소는 장비 앞 물리 버튼. 태블릿에서 추출 커맨드 X. (명세 v0.9 + 5/24 §1.1)' },
  { num:'1.1', title:'타깃 = 10인치 태블릿 (1024×768)',     detail:'70인치 회의 모니터로만 보지 말 것. 시인성·픽셀·터치 영역 사수. (5/24)' },
  { num:'1.1', title:'2천만원 장비 + 20만원 태블릿',        detail:'보자마자 인상 쓰면 안 됨. 디테일 = 품질 (5/24)' },
  { num:'1.2', title:'디자인 단계 분리',                    detail:'1차(5/27): LCD 화면 충실 반영. 2차: 안드로이드 이점 활용. (5/24)' },
  { num:'1.3', title:'장비 직접 보기 + 김 수석 질문',         detail:'상상의 나래 X. 단순 채우기 X. (5/24)' },
  { num:'1.4', title:'디테일 = 품질',                       detail:'오타·줄 맞춤·폰트 강조·빨강 일관성. (5/24)' },
  { num:'§2',  title:'메인 = 모니터링 + 매뉴얼 변경',        detail:'카드 클릭 시 즐겨찾기 외 매뉴얼 변경 가능. (5/24 §2.2)' },
  { num:'§3',  title:'추출량 = 추산 (저울 없음)',             detail:'펌프 가동시간 × 유속 = 물의 양. 시간 베이스 컷. UI에 "추산" 표기. (5/24 §3)' },
  { num:'§4',  title:'용어 정의 명확 (한글 디폴트)',          detail:'"현 단계"·"웨이팅 타임" 등 정의되지 않은 영문 금지. (5/24 §4·§7)' },
  { num:'§14', title:'모달 = 직관 텍스트 (OX 금지)',         detail:'확인/취소 대신 저장/취소·변경/취소·진행/취소·시작/취소·종료/취소. (5/24 §14)' },
  { num:'§14', title:'변경 시 무조건 confirm',               detail:'값 변경 + 저장 시 confirm 모달 필수. 실수 방지. (5/24 §10.7)' },
  { num:'§14', title:'에러 처리 팝업 필수',                  detail:'통신끊김·응답없음·Validation초과·장비저장실패 — 각각 별도 모달. (5/24)' },
  { num:'PILLAR', title:'김동성 PM 가이드 (3 PILLAR)',        detail:'① 메인의 추출구 상태 표시 깔끔·잘 디자인 ② LCD 컨셉 유지 ③ 즐겨찾기 표현·편의성 중심 (v1.1)' }
];
const TIMELINE = [
  ['2026-03-13', 'PPT v0.9 명세 (22p)', '최초 화면명세 — LCD(참조)', '바리스타·관리자·엔지니어 3계층 / 즐겨찾기 5컬럼 큐 / 8 팝업 X/O'],
  ['2026-03-15', 'Function Diagram v0.9', '시각 자료', '기존 LCD 화면 다이어그램'],
  ['2026-05-10', '웹 업데이트 가이드 + IPC통합', '구현 가이드 (10 Phase)', '/preview/ + production EJS + IR 화면 — 3 영역 구분'],
  ['2026-05-11', '회의 v1.0', '5/11 회의 결정', '일반 유저 = WiFi PW 단일화 / 관리자 = Admin+PW (AWS 제거) → 플로우차트·다이어그램 산출'],
  ['2026-05-12', '회의 v1.1 (wireframe v6.0)', '와이어프레임 v6.0 작성 (26 화면)', '4계층 권한(누구나/사용자/디스트리뷰터/개발자) / ★/☆ 2슬롯 / 매뉴얼 큐 분리 / S8.3 사용 실적 신설 / 팝업 12종(4종 신규)'],
  ['2026-05-13', '디자인 변경 회의', '시각 자료 보강', '추출구 파스텔톤 / 빨강→초록 / 스피커·LED Bar / 홈 버튼 / Info→Information'],
  ['2026-05-24', '현재 회의 (D-3)', 'MEETING-FEEDBACK.md', '★/☆ 2슬롯 → 5슬롯 (v1.1 reverse) / AWS/USB/펌웨어/클라우드 자료 요청 / 펌프 교정 관리자 이관 / 추출 실적 (S8.3) 강조'],
  ['2026-05-27', '디자이너 1차 deliverable', '제출 마감', '전체 플로우 Excel + LCD 화면 명세 반영 + 모든 분기 + 비고란']
];

const s1 = wb.addWorksheet('🎯 핵심 원칙', { views:[{showGridLines:false}]});
s1.columns = [{header:'#',width:8},{header:'원칙',width:34},{header:'상세',width:74}];
PRINCIPLES.forEach(p => s1.addRow([p.num, p.title, p.detail]));
s1.insertRow(1, ['']);
s1.mergeCells('A1:C1');
const t1 = s1.getCell('A1');
t1.value = '🎯  핵심 원칙 — 디자이너가 가장 먼저 봐야 할 13가지';
t1.font = { bold:true, size:20, color:{argb:'FFFFFFFF'}, name:'Pretendard'};
t1.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FFDC2626'}};
t1.alignment = { horizontal:'left', vertical:'middle', indent:1 };
s1.getRow(1).height = 38;
s1.insertRow(2, ['']);
s1.mergeCells('A2:C2');
const sub1 = s1.getCell('A2');
sub1.value = '명세 v0.9 + 5/11 v1.0 + 5/12 v1.1 + 5/13 변경 + 5/24 회의 통합';
sub1.font = { size:11, italic:true, color:{argb:'666666'}, name:'Pretendard'};
sub1.alignment = { horizontal:'left', vertical:'middle', indent:1 };
s1.getRow(2).height = 20;
styleHeader(s1.getRow(3));
for (let r=4; r<=s1.rowCount; r++) {
  styleDataRow(s1.getRow(r), 36);
  s1.getCell(r,1).alignment = { horizontal:'center', vertical:'middle' };
  s1.getCell(r,1).font = { size:10, bold:true, color:{argb:'888888'}};
  s1.getCell(r,2).font = { size:11, bold:true, color:{argb:C.text}, name:'Pretendard'};
  s1.getCell(r,3).font = { size:10.5, color:{argb:'444444'}, name:'Pretendard'};
}

// 회의 변천사 표 (시트 1 아래에 이어서)
let tRow = s1.rowCount + 2;
s1.mergeCells(tRow, 1, tRow, 3);
const tTitle = s1.getCell(tRow, 1);
tTitle.value = '📅  회의 변천사 (이 프로젝트가 어디서부터 왔는지)';
tTitle.font = { bold:true, size:16, color:{argb:'FFFFFFFF'}, name:'Pretendard'};
tTitle.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FF92400E'}};
tTitle.alignment = { horizontal:'left', vertical:'middle', indent:1 };
s1.getRow(tRow).height = 32;
tRow++;
const tHeader = s1.addRow(['', '', '']);
s1.getCell(tHeader.number, 1).value = '날짜';
s1.getCell(tHeader.number, 2).value = '자료/마일스톤';
s1.getCell(tHeader.number, 3).value = '핵심 결정 / 변경 사항';
styleHeader(s1.getRow(tHeader.number));
TIMELINE.forEach(t => {
  const r = s1.addRow(t.slice(0,2).concat([t.slice(2).join(' — ')]));
  styleDataRow(r, 30);
  s1.getCell(r.number, 1).font = { size:10, bold:true, color:{argb:C.text}, name:'Pretendard'};
  s1.getCell(r.number, 2).font = { size:10.5, bold:true, color:{argb:C.text}, name:'Pretendard'};
  s1.getCell(r.number, 3).font = { size:10, color:{argb:'444444'}, name:'Pretendard'};
});
s1.views = [{state:'frozen', ySplit:3, showGridLines:false}];

/* ═════════════════════════════════════════════════════════════════
   시트 4: 📺 화면 목록 (와이어프레임 v6.0 → 26 화면)
   ═════════════════════════════════════════════════════════════════ */
const SCREENS = [
  // [ID, 경로, 화면명, 분류, 진입점, 권한, 비고]
  ['S0.1', '—', '권한 매트릭스 (4계층)', 'admin', '와이어프레임 정의', '게스트~개발자', 'v1.1 신규 — 시트 5 참조'],
  ['S1.1', '/connect', '자동 재연결 (로딩)', 'install', '부팅 시 자동', '게스트', '15s 타임아웃 → S1.2'],
  ['S1.2', '(modal)', '연결 실패 팝업', 'install', 'S1.1 타임아웃', '게스트', 'O 재시도 / X 재검색'],
  ['S1.3', '/connect/ap-scan', '머신 AP 스캔 / 목록', 'install', 'S1.1 [수동] · S1.2 X', '게스트', 'AP 신호 표시'],
  ['S1.4', '(modal)', 'WiFi 비밀번호 입력', 'install', 'S1.3 신규 SSID', '게스트', '실패 → "WiFi 인증 실패"'],
  ['S1.5', '(modal)', '시리얼 입력 (최초 1회)', 'install', 'S1.4 + 시리얼 없음', '게스트', '⚠ 회의: "하지 말 것" — 자동 등록 권장'],
  ['S1.6', '/setup', '최초 장비 정보 설정', 'install', 'S1.5 완료', '게스트', 'image17 정합'],
  ['S2.1', '/main', '메인 모니터링 (5구 도넛)', 'daily', '연결 성공 / 모든 화면 복귀', '게스트(조회만)~', '⭐ 핵심 화면 / ★/☆ 2슬롯(v1.1) → 5슬롯(5/24)'],
  ['S2.2', '/main', '5구 병렬 상태 (완료 점멸)', 'daily', '추출 시작 (물리 버튼)', '게스트', '완료 시 30초 점멸 — 서빙 알림'],
  ['S2.3', '(modal)', '종료 흐름 (2단계)', 'system', '탑바 [종료]', '게스트', 'STEP1 진행 → STEP2 전원 스위치 OFF'],
  ['S3.1', '/settings/general', '일반 설정 (탭 + 6 카드)', 'settings', '사이드바 [설정]', '사용자+', '환경/보일러/물붓기/펌프교정(이관 검토)/워터린스/즐겨찾기 정책(v1.1)'],
  ['S3.2', '/settings/backup', 'USB 백업/복구 (3 카드)', 'maintenance', '설정 탭', '사용자+', 'v1.1: 단일 모달 → 3 카드 분리 / 권한별 가능 항목'],
  ['S4.1', '(modal)', '관리자 보안 연결 (Admin 인증)', 'admin', '설정 탭 [관리자 메뉴]', '사용자→디스트리뷰터', '5회 실패 → 10분 잠금'],
  ['S4.2', '/settings/engineering/factory-reset', '공장 초기화 (5 라디오)', 'admin', '관리자 메뉴 사이드', '디스트리뷰터+', '5종: 로그&오류/레시피/사용자/장비설정/보안'],
  ['S4.3', '/settings/engineering/connection', '연결 설정 (등록 머신 관리)', 'admin', '관리자 메뉴 사이드', '디스트리뷰터+', 'v1.1: 원본 IP/AWS 폼 제거 → "등록 머신 관리" 대체 / 고급 파라미터'],
  ['S4.4', '/info/security', '보안 정보 (4분할 + 검색)', 'admin', 'S8.1 또는 5초 롱탭', '디스트리뷰터(FATAL 마스킹)', 'v1.1: 검색 바(기간/코드/소스/심각도/키워드) 신규'],
  ['S4.5', '/settings/engineering/parts (TBD)', '부품 시리얼 초기화', 'admin', '관리자 메뉴 사이드', '디스트리뷰터(조회)·개발자(변경)', 'v1.1 신규 — 부품 6종: 본체/보일러/워터펌프/솔밸브×2/실리콘 가스켓'],
  ['S5.1', '/settings/firmware', '펌웨어 업그레이드', 'maintenance', '설정 탭', '사용자(업그레이드)·개발자(다운그레이드)', '4 보드(WHP/MCP/5천원/백 프론트) / 자동 정책 "항상·한번만·절대안함"'],
  ['S6.1', '/recipes', '레시피 상세 + 12 리스트', 'recipe', '사이드바', '게스트(조회)~', 'Main / Stage / Description 3 영역 + ☁ 클라우드 다운로드 (디스트리뷰터+)'],
  ['S6.2', '(modal)', '레시피 추가', 'recipe', 'S6.1 [추가]', '사용자+', '메인 정보 + Stage 편집 + 즐겨찾기 매핑 미니'],
  ['S6.3', '(modal)', '레시피 편집', 'recipe', 'S6.1 [편집]', '사용자+', '편집 모드 시각 신호 3종'],
  ['S6.4', '/brewing', '추출 진행 (외부 트리거)', 'daily', '물리 버튼 1초 / 테스트 추출', '게스트', '단계별 진행 + 추정값 표시'],
  ['S7.1', '/favorites', '즐겨찾기 편집', 'fav', '사이드바', '사용자+', 'v1.1: 5×2 = 10 슬롯 / 5/24: 5×5 = 25 슬롯 (현재 적용)'],
  ['S8.1', '/info', '정보 일반 (인증 후)', 'info', '사이드바', '게스트(조회)~', '6 패널 — 장비/보일러/물붓기/사용 실적(퀵 링크)/환경설정/부품 사용'],
  ['S8.2', '(modal)', '정보 + 관리자 인증 (조회 전)', 'info', '/info 직접 진입', '게스트', 'S4.1 와 동일 컴포넌트'],
  ['S8.3', '/history', '사용 실적 ★ v1.1 신규', 'info', 'S8.1 [상세] 또는 헤더 [총 추출]', '사용자(최근30일)·디스트리뷰터(전체+export)·개발자(초기화)', '검색·필터 + KPI 4 카드 + 일별 막대 + 레시피별 표 / AWS+태블릿 듀얼 저장']
];

const s4 = wb.addWorksheet('📺 화면 목록', { views:[{showGridLines:false}]});
s4.columns = [
  {header:'ID', width:7}, {header:'경로', width:38}, {header:'화면명', width:26},
  {header:'분류', width:11}, {header:'진입점', width:24}, {header:'권한', width:24},
  {header:'비고 (v6.0/회의 결정)', width:42}, {header:'대표님 비고', width:20}
];
SCREENS.forEach(r => s4.addRow([...r, '']));
styleHeader(s4.getRow(1));
s4.getCell(1,8).fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FF92400E'}};
for (let r=2; r<=s4.rowCount; r++) {
  styleDataRow(s4.getRow(r), 32);
  s4.getCell(r,1).alignment = { horizontal:'center', vertical:'middle'};
  s4.getCell(r,1).font = { size:10, bold:true, color:{argb:'444444'}};
  s4.getCell(r,2).font = { size:10, name:'Consolas', color:{argb:C.text}};
  s4.getCell(r,3).font = { size:10.5, bold:true, color:{argb:C.text}, name:'Pretendard'};
  const catCell = s4.getCell(r,4);
  if (C[catCell.value]) {
    const catKey = catCell.value;
    catCell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:C[catKey]}};
    catCell.font = { size:9.5, bold:true, color:{argb:C.white}, name:'Pretendard'};
    catCell.alignment = { horizontal:'center', vertical:'middle'};
    catCell.value = CAT_LABEL[catKey] || catKey;
  }
  s4.getCell(r,7).font = { size:10, italic:true, color:{argb:'555555'}, name:'Pretendard'};
  s4.getCell(r,8).fill = { type:'pattern', pattern:'solid', fgColor:{argb:C.noteCol}};
}
s4.views = [{state:'frozen', ySplit:1, showGridLines:false}];

/* ═════════════════════════════════════════════════════════════════
   시트 5: 🔐 권한 매트릭스 (4계층 + 화면별 접근)
   ═════════════════════════════════════════════════════════════════ */
const PERMISSION_LEVELS = [
  // [내부 명명, v1.1 회의 명명, 페르소나, 인증 수단, 접근 화면 요약, 제약]
  ['① 누구나',       '사용자 (게스트)',         '매장 손님/관람',     '없음',                     'S2.1 메인 / S2.2 5구 모니터링 / S2.3 종료 / S6.1 레시피 조회 / S8.1 정보 / 하드웨어 1·5·10초 제스처', '조회 + 종료만. 편집·실행 불가.'],
  ['② 운용자',       '사용자 (매장 운용자)',    '바리스타·점주',      '머신 AP WiFi 비밀번호',     'S1.* 기기등록 / S3.1 일반설정 / S3.2 USB 백업(레시피만) / S6.* 레시피 CRUD / S7.1 즐겨찾기 / S5.1 펌웨어', '머신 AP에 연결됨 = 권한 보유 (별도 로그인 X)'],
  ['③ 관리자',       '디스트리뷰터',            '프랜차이즈/설치자',  'Admin + PW + AWS 매장·레벨',  '운용자 권한 + S4.3 연결 설정 (AWS) / S4.4 보안 정보(조회) / S3.2 사용자 백업 / S6.* 클라우드 배포', '매장·레벨 스코프 내 운용 / 공장 초기화 조건부'],
  ['③+ 관리자',      '개발자',                  '노블트리 내부',       'Admin + 마스터 PW',        '모든 화면 + S4.2 공장 초기화(전체) / S4.5 부품 시리얼 / 펌웨어 다운그레이드 / 시스템 로그 export', '전체 권한 / 5회 실패 → 10분 잠금 / 디스트리뷰터 계정 발급']
];

const PERMISSION_MATRIX = [
  // [화면/액션, 게스트, 운용자, 디스트리뷰터, 개발자]
  ['S1.* 기기 등록',           '—',     '전체',   '전체',           '전체'],
  ['S2.1 메인 (조회)',         '조회',  '조회+액션', '전체',         '전체'],
  ['S2.3 종료',                'OK',    'OK',     'OK',             'OK'],
  ['S3.1 일반 설정',           '—',     '전체',   '전체',           '전체'],
  ['S3.1.6 펌프 교정',         '—',     '검토중', 'OK',             'OK'],
  ['S3.2 USB 백업',            '—',     '레시피만 / 사용자 백업만', '레시피·사용자 양방향', '전체 (장비 설정 포함)'],
  ['S4.* 관리자 메뉴',         '—',     '—',      '조건부 (조회·연결)', '전체'],
  ['S4.2 공장 초기화',         '—',     '—',      '조건부 (매장·레벨 내)', '전체'],
  ['S4.3 연결 설정 (AWS)',     '—',     '—',      '전체',           '전체'],
  ['S4.4 보안 정보',           '—',     '—',      '조회 (FATAL 마스킹)', '전체'],
  ['S4.5 부품 시리얼',         '—',     '—',      '조회만',         '변경 OK'],
  ['S5.1 펌웨어 업그레이드',   '—',     '업그레이드만', '업그레이드만',   '다운그레이드 포함'],
  ['S6.1 레시피 조회',         '조회',  '조회',   '조회',           '조회'],
  ['S6.2/S6.3 추가·편집',      '—',     '전체',   '전체 + 클라우드 배포', '전체'],
  ['S6.1 클라우드 다운로드 (v1.1)', '—', '—',     '전체',           '전체'],
  ['S7.1 즐겨찾기',            '—',     '전체',   '전체',           '전체'],
  ['S8.1 정보 일반',           '조회',  '조회',   '조회',           '조회'],
  ['S8.3 사용 실적 (v1.1)',    '—',     '최근 30일', '전체 + export', '전체 + 초기화'],
  ['S9.* 팝업 (전체)',         '컨텍스트별', '컨텍스트별', '컨텍스트별', '컨텍스트별']
];

const s5 = wb.addWorksheet('🔐 권한 매트릭스', { views:[{showGridLines:false}]});

// Part A: 4계층 정의
s5.addRow(['']);
s5.mergeCells('A1:F1');
const t5 = s5.getCell('A1');
t5.value = '🔐  권한 4계층 — v1.1 신설 (이전 3계층 → 디스트리뷰터/개발자 세분화)';
t5.font = { bold:true, size:18, color:{argb:'FFFFFFFF'}, name:'Pretendard'};
t5.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FF334155'}};
t5.alignment = { horizontal:'left', vertical:'middle', indent:1};
s5.getRow(1).height = 34;

s5.columns = [
  {width:14}, {width:22}, {width:18}, {width:24}, {width:50}, {width:30}
];
const headerA = s5.addRow(['내부 명명', 'v1.1 회의 명명', '페르소나', '인증 수단', '접근 화면', '제약']);
styleHeader(s5.getRow(headerA.number));
const persoColors = [C.guest, C.user, C.distributor, C.dev];
PERMISSION_LEVELS.forEach((lvl, i) => {
  const r = s5.addRow(lvl);
  styleDataRow(r, 56);
  s5.getCell(r.number, 1).font = { size:11, bold:true, color:{argb:C.white}, name:'Pretendard'};
  s5.getCell(r.number, 1).fill = { type:'pattern', pattern:'solid', fgColor:{argb:persoColors[i]}};
  s5.getCell(r.number, 1).alignment = { horizontal:'center', vertical:'middle'};
  s5.getCell(r.number, 2).font = { size:10.5, bold:true, color:{argb:C.text}, name:'Pretendard'};
  s5.getCell(r.number, 5).font = { size:9.5, color:{argb:'444444'}, name:'Pretendard'};
});

// Part B: 화면별 접근 매트릭스
let bRow = s5.rowCount + 2;
s5.mergeCells(bRow, 1, bRow, 6);
const bt = s5.getCell(bRow, 1);
bt.value = '🔓  화면별 접근 매트릭스 (녹 전체 OK · 황 조건부/제약 · 적 차단)';
bt.font = { bold:true, size:14, color:{argb:'FFFFFFFF'}, name:'Pretendard'};
bt.fill = { type:'pattern', pattern:'solid', fgColor:{argb:C.header}};
bt.alignment = { horizontal:'left', vertical:'middle', indent:1};
s5.getRow(bRow).height = 28;
bRow++;
const headerB = s5.addRow(['화면/액션', '게스트', '운용자 (사용자)', '디스트리뷰터', '개발자', '']);
styleHeader(s5.getRow(headerB.number));
PERMISSION_MATRIX.forEach(row => {
  const r = s5.addRow([...row, '']);
  styleDataRow(r, 22);
  s5.getCell(r.number, 1).font = { size:10, bold:true, color:{argb:C.text}, name:'Pretendard'};
  for (let c=2; c<=5; c++) {
    const v = String(s5.getCell(r.number, c).value || '');
    const cell = s5.getCell(r.number, c);
    cell.alignment = { horizontal:'center', vertical:'middle'};
    if (v === '—') {
      cell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FFFEE2E2'}};
      cell.font = { size:9, color:{argb:'FF991B1B'}};
    } else if (v.includes('전체') || v === 'OK' || v === '조회') {
      cell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FFD1FAE5'}};
      cell.font = { size:9, bold:true, color:{argb:'FF065F46'}};
    } else {
      cell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FFFEF3C7'}};
      cell.font = { size:9, color:{argb:'FF92400E'}};
    }
  }
});
s5.views = [{state:'frozen', ySplit:1, showGridLines:false}];

/* ═════════════════════════════════════════════════════════════════
   시트 6: 🪟 팝업 카탈로그 (16종 v1.1 + 18행 컨텍스트)
   ═════════════════════════════════════════════════════════════════ */
const POPUPS_V11 = [
  // [ID, 제목, 본문, 트리거 화면, 톤, 액션(OK), 이후 분기, 회의 명세]
  ['P-CONN-FAIL',         '연결 실패',                  '재시도?',                                'S1.1 (15s 타임아웃)',   '황', '재시도 / 재검색',  'S1.1 / S1.3',         'v0.9 #2'],
  ['P-CONN-RETRY',        'WiFi 인증 실패',             '잘못된 PW',                              'S1.4',                  '적', '재시도 (PW 재입력)', 'S1.4 유지',           '회의 추가'],
  ['P-SERIAL-MISMATCH',   '시리얼 불일치',              '매칭 실패',                              'S1.5',                  '적', '재입력',           'S1.5 유지',           '회의 추가'],
  ['P-EXTRACT-PRESS',     '추출진행',                   '추출구의 버튼을 눌러주세요',             'S6.4 시작 직전',         '황', '(머신 버튼) / 취소','S6.4 / 취소',         'v0.9 #7'],
  ['P-SHUTDOWN-1',        '장비를 종료합니다',          '기다려 주세요',                          'S2.3 STEP 1',            '—', '(없음, 블로킹)',    '10s 자동',            'v0.9 #5'],
  ['P-SHUTDOWN-2',        '장비 종료 완료',             '전원 스위치를 꺼주세요',                 'S2.3 STEP 2',            '—', '(없음)',           '전원 OFF',            'v0.9 #6'],
  ['P-FIRMWARE',          '펌웨어를 업그레이드 합니다', '업그레이드 중 전원을 끄지 마세요',         'S5.1 [업그레이드]',      '황', '진행 / 취소',       '다운로드 / S5.1',      'v0.9 #8'],
  ['P-CONN-CHANGE',       '장치 연결 설정 변경',         '변경 적용?',                             'S4.3 [저장]',            '황', '변경 / 취소',       '적용 / 폐기',         'v0.9 #1'],
  ['P-PW-ERROR',          '암호 오류',                  '5회 실패 → 10분 잠금',                    'S4.1 / S8.2',            '적', '닫기',             '해당 화면 유지',      'v0.9 #3'],
  ['P-IRREVERSIBLE',      '복구불가',                   '진행하시겠습니까?',                       'S4.2 / S4.5 / S8.3 초기화', '적', '진행 / 취소',     '실행 / 취소',         'v0.9 #4'],
  ['P-DELETE',            '레시피 삭제',                '복구불가 / 진행하시겠습니까?',           'S6.1 [삭제]',            '황', '삭제 진행 / 취소',  '삭제 / 유지',         '회의 §14'],
  ['P-TEST-BREW',         '테스트 추출 — 추출구 선택', '비어있는 추출구 선택',                  'S6.1/S6.2/S6.3',         '황', '1~5 / 취소',      'S6.4 / 취소',         'v1.1 신규'],
  ['P-RECIPE-VALIDATE-1', 'Stage 합계 100%가 아닙니다','자동 보정 또는 수정',                    'S6.2/S6.3 [저장]',       '황', '자동 보정 / 수정',  '저장 / 유지',         'v1.1 신규'],
  ['P-RECIPE-VALIDATE-2', '유속 펌프 한계 초과',        '최대값 조정 또는 수정',                  'S6.2/S6.3 [저장]',       '적', '최대값 조정 / 수정','저장 / 유지',         'v1.1 신규'],
  ['P-RECIPE-CONFLICT',   '즐겨찾기 매핑 충돌',         '덮어쓰기 / 해제 / 취소',                 'S6.2 + S7.1 매핑',       '황', '덮어쓰기/해제/취소','매핑/부분/취소',      'v1.1 신규'],
  ['P-RECIPE-RUNTIME',    '첫 추출 결과 ±20% — 보정 권장','보정 / 기록만 / 무시',                 'S6.4 (테스트 후)',       '황', '보정/기록만/무시',  'S6.3/S6.1/S6.1',      'v1.1 신규']
];

// 18행 컨텍스트 매핑
const POPUP_CONTEXTS = [
  // [#, 팝업명, 화면, 트리거, O 결과, X 결과]
  [1,  '연결 설정 변경',     'S4.3',                      '설정 변경 진입',         '변경 진행',                'S4.3 / 취소'],
  [2,  '연결 실패',          'S1.2',                      'WiFi 타임아웃 15s',     '재시도 (S1.1)',           '재검색 (S1.3)'],
  [3,  '암호 오류',          'S4.1 / S4.4 / S8.2',        '잘못된 PW',             '— (입력 유지)',           ''],
  [4,  '복구불가',           'S4.2 / S3.2 / S4.5',        '[실행] / [변경 적용]',  '초기화 진행',             '취소'],
  [5,  '종료 진행',          'S2.3 STEP1',                '메인 [종료]',           '자동 → STEP2',            ''],
  [6,  '종료 완료',          'S2.3 STEP2',                'STEP1 자동',            '전원 OFF 대기',           ''],
  [7,  '추출 진행',          'S6.2/3 [추출]/[테스트]',    '(머신 버튼)',           '—',                       '중단'],
  [8,  '펌웨어',             'S5.1 [업그레이드]',          '버전 차이 발견',         '설치 진행',               '취소'],
  [9,  'WiFi 인증 실패',     'S1.4',                      '잘못된 PW',             '—',                        'PW 재입력'],
  [10, '시리얼 불일치',      'S1.5',                      '매칭 실패',             '—',                        '재입력'],
  [11, '레시피 삭제',        'S6.1',                      '선택 + [삭제]',         '삭제',                    '취소'],
  [12, '다중 레시피 삭제',   'S6.1 다중',                 '다중 + [삭제]',         '일괄 삭제',               '취소'],
  [13, '미저장 변경 경고',   'S3.1 / S6.2 / S7.1',        '미저장 + 뒤로',         '저장',                    '폐기/머무름'],
  [14, '큐 초과',            'S7.1',                      'ON > 큐 제한',          '—',                        '수정 요구'],
  [15, 'USB 미인식',         'S3.2',                      'USB 없음',              '—',                        '닫기'],
  [16, 'USB 용량 부족',      'S3.2',                      '용량 부족',             '—',                        '닫기'],
  [17, '저장 실패',          'S3.1 / S6.2 / S7.1',        '통신 오류',             '재시도 권장',             ''],
  [18, '오류 발생 (자동)',   'S2.2',                      '펌프/모터 이상',        '로그 → S4.4',             '']
];

const s6 = wb.addWorksheet('🪟 팝업 카탈로그', { views:[{showGridLines:false}]});
s6.addRow(['']);
s6.mergeCells('A1:H1');
const t6 = s6.getCell('A1');
t6.value = '🪟  팝업 16종 (v0.9 8종 + v1.1 신규 8종) + 18행 컨텍스트';
t6.font = { bold:true, size:18, color:{argb:'FFFFFFFF'}, name:'Pretendard'};
t6.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FF92400E'}};
t6.alignment = { horizontal:'left', vertical:'middle', indent:1};
s6.getRow(1).height = 32;
s6.columns = [{width:22},{width:24},{width:30},{width:24},{width:6},{width:22},{width:24},{width:18}];

const h6 = s6.addRow(['ID', '제목', '본문', '트리거', '톤', '액션(OK)', '이후 분기', '명세 출처']);
styleHeader(s6.getRow(h6.number));
POPUPS_V11.forEach(p => {
  const r = s6.addRow(p);
  styleDataRow(r, 36);
  s6.getCell(r.number, 1).font = { size:9, bold:true, name:'Consolas', color:{argb:'FF111827'}};
  s6.getCell(r.number, 2).font = { size:10.5, bold:true, color:{argb:C.text}, name:'Pretendard'};
  const tone = String(s6.getCell(r.number, 5).value || '');
  const toneCell = s6.getCell(r.number, 5);
  toneCell.alignment = { horizontal:'center', vertical:'middle'};
  toneCell.font = { size:10, bold:true, color:{argb:C.white}};
  if (tone === '적')      toneCell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:C.err}};
  else if (tone === '황') toneCell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:C.warn}};
  else                    toneCell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FFD1D5DB'}};
  // 명세 출처 색
  const src = String(s6.getCell(r.number, 8).value || '');
  if (src.includes('v1.1')) {
    s6.getCell(r.number, 8).font = { size:9.5, bold:true, color:{argb:'FFB45309'}, name:'Pretendard'};
  } else if (src.includes('v0.9')) {
    s6.getCell(r.number, 8).font = { size:9.5, color:{argb:'444444'}, name:'Pretendard'};
  }
});

// 18행 컨텍스트
let ctxRow = s6.rowCount + 2;
s6.mergeCells(ctxRow, 1, ctxRow, 8);
const ct = s6.getCell(ctxRow, 1);
ct.value = '📍  18행 컨텍스트 매핑 (어디서 어떤 팝업이 뜨는지)';
ct.font = { bold:true, size:14, color:{argb:'FFFFFFFF'}, name:'Pretendard'};
ct.fill = { type:'pattern', pattern:'solid', fgColor:{argb:C.header}};
ct.alignment = { horizontal:'left', vertical:'middle', indent:1};
s6.getRow(ctxRow).height = 28;
ctxRow++;
const hCtx = s6.addRow(['#', '팝업명', '화면', '트리거', 'O 결과', 'X 결과', '', '']);
styleHeader(s6.getRow(hCtx.number));
POPUP_CONTEXTS.forEach(c => {
  const r = s6.addRow([...c, '', '']);
  styleDataRow(r, 22);
  s6.getCell(r.number, 1).alignment = { horizontal:'center', vertical:'middle'};
  s6.getCell(r.number, 1).font = { size:10, bold:true, color:{argb:'888888'}};
  s6.getCell(r.number, 2).font = { size:10.5, bold:true, color:{argb:C.text}, name:'Pretendard'};
});
s6.views = [{state:'frozen', ySplit:1, showGridLines:false}];

/* ═════════════════════════════════════════════════════════════════
   시트 7: 🔀 화면 진입 매트릭스 (44행)
   ═════════════════════════════════════════════════════════════════ */
const TRANSITIONS = [
  // [진입 화면, 트리거, 도착 화면, 비고]
  ['(앱 시작)',        '부팅 + 등록 머신 있음',         'S1.1 자동 재연결',       '—'],
  ['(앱 시작)',        '부팅 + 등록 머신 없음',         'S1.3 AP 스캔',           '최초 설치'],
  ['S1.1',              'WiFi 성공 + 시리얼 매칭',       'S2.1 메인',              '가장 일반'],
  ['S1.1',              '15s 타임아웃',                  'S1.2 실패 팝업',         '—'],
  ['S1.1',              '[수동 모드]',                   'S1.3',                   '—'],
  ['S1.2',              'O 재시도',                      'S1.1',                   '회의 결정'],
  ['S1.2',              'X 재검색',                      'S1.3',                   '회의 결정'],
  ['S1.3',              '등록된 SSID 선택',              'S1.6 (PW 없이)',         '자동 연결'],
  ['S1.3',              '신규 SSID + [다음]',            'S1.4',                   '—'],
  ['S1.4',              '성공 + 시리얼 있음',            'S1.6',                   '—'],
  ['S1.4',              '성공 + 시리얼 없음',            'S1.5',                   '조건부'],
  ['S1.4',              '실패',                          'S1.4 유지',              '"WiFi 인증 실패"'],
  ['S1.5',              '등록 성공',                     'S1.6',                   '머신에 시리얼 기록'],
  ['S1.5',              '시리얼 불일치',                  'S1.5 유지',              '"시리얼 불일치"'],
  ['S1.6',              '[저장]',                        'S2.1',                   '—'],
  ['S2.1',              '[종료]',                        'S2.3 STEP 1',            '—'],
  ['S2.3 STEP 1',       '10s 자동',                      'S2.3 STEP 2',            '버튼 없음'],
  ['S2.3 STEP 2',       '전원 OFF',                      '(END)',                  '—'],
  ['S2.1',              '[설정]',                        'S3.1 (디폴트 탭)',       '—'],
  ['S3.1',              '탭 "백업/복구"',                'S3.2',                   '—'],
  ['S3.1',              '탭 "관리자"',                   'S4.1 인증',              '—'],
  ['S3.1',              '탭 "펌웨어"',                   'S5.1',                   '—'],
  ['S4.1',              '올바른 PW',                     'S4.2 (디폴트)',          '—'],
  ['S4.1',              '잘못된 PW',                     '"암호 오류" → S4.1',     '5회 잠금'],
  ['S4.2',              '사이드 [연결 설정]',            'S4.3',                   '—'],
  ['S4.2',              '사이드 [보안 정보]',            'S4.4',                   '회의 보강'],
  ['S4.2',              '사이드 [부품 시리얼]',          'S4.5',                   '회의 보강'],
  ['S4.2',              '[실행]',                        '"복구불가" → 진행',      '—'],
  ['S4.3',              '[+ 신규 등록]',                 'S1.3',                   '—'],
  ['S4.5',              '[시리얼 변경]',                 '입력 모달 → "복구불가"', '—'],
  ['S5.1',              '[업그레이드]',                  '"펌웨어" → 다운로드',    '—'],
  ['S2.1',              '[레시피]',                      'S6.1',                   '—'],
  ['S6.1',              '[추가]',                        'S6.2',                   '—'],
  ['S6.1',              '선택 + [편집]',                 'S6.3',                   '—'],
  ['S6.1',              '선택 + [삭제]',                 '"정말 삭제" → 삭제',     '—'],
  ['S6.2/S6.3',         '[테스트 추출]',                 '"추출진행" → 머신 버튼 → S6.4', '회의 추가'],
  ['S2.1',              '[즐겨찾기]',                    'S7.1',                   '—'],
  ['S2.1',              '[정보]',                        'S8.1 (인증 후) / S8.2',  '—'],
  ['S8.1 / S8.2',       '숨은 영역 5s 롱탭',             'S4.1 → S4.4',            '—'],
  ['S8.2',              '팝업 [연결] + 올바른 PW',       'S8.1',                   '—'],
  ['S8.1 (패널 4)',     '[상세 →] / [총 추출] 클릭',     'S8.3 사용 실적',         'v1.1 신규'],
  ['S8.3',              '[← 정보]',                      'S8.1',                   'v1.1 복귀'],
  ['S8.3',              '[CSV Export] / [AWS 백업]',     'S8.3 유지 + 토스트',     'v1.1 권한(디스트리뷰터+)'],
  ['S6.1',              '[☁ 클라우드 다운로드]',         '클라우드 라이브러리 모달', 'v1.1 디스트리뷰터+'],
  ['S6.2/S6.3',         '[저장] + 검증 실패',            'P-RECIPE-VALIDATE-1/2 → 유지', 'v1.1 1차 세팅 오류'],
  ['S6.4',              '실 추출 시간 ±20% 초과',        'P-RECIPE-RUNTIME → S6.3','v1.1 런타임 검증']
];

const s7 = wb.addWorksheet('🔀 화면 진입', { views:[{showGridLines:false}]});
s7.addRow(['']);
s7.mergeCells('A1:D1');
const t7 = s7.getCell('A1');
t7.value = '🔀  화면 진입 매트릭스 — 어디서 무얼 누르면 어디로 (총 ' + TRANSITIONS.length + '행)';
t7.font = { bold:true, size:18, color:{argb:'FFFFFFFF'}, name:'Pretendard'};
t7.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FF0EA5E9'}};
t7.alignment = { horizontal:'left', vertical:'middle', indent:1};
s7.getRow(1).height = 32;
s7.columns = [{width:22},{width:36},{width:36},{width:24}];
const h7 = s7.addRow(['진입 화면', '트리거', '도착 화면', '비고']);
styleHeader(s7.getRow(h7.number));
TRANSITIONS.forEach(t => {
  const r = s7.addRow(t);
  styleDataRow(r, 22);
  s7.getCell(r.number, 1).font = { size:10, bold:true, name:'Consolas', color:{argb:'FF111827'}};
  s7.getCell(r.number, 3).font = { size:10, color:{argb:'444444'}, name:'Pretendard'};
  const note = String(s7.getCell(r.number, 4).value || '');
  if (note.includes('v1.1')) {
    s7.getCell(r.number, 4).font = { size:9.5, bold:true, color:{argb:'FFB45309'}, name:'Pretendard'};
  } else {
    s7.getCell(r.number, 4).font = { size:9.5, italic:true, color:{argb:'666666'}, name:'Pretendard'};
  }
});
s7.views = [{state:'frozen', ySplit:2, showGridLines:false}];

/* ═════════════════════════════════════════════════════════════════
   시트 8: ❓ 결정 대기 / v1.1 vs 5/24 충돌 / 미반영
   ═════════════════════════════════════════════════════════════════ */
const CONFLICTS_PENDING = [
  // [회의/명세 §, 항목, v1.1 결정, 5/24 결정, 현재 코드/Excel 상태, 우선순위, 대표님 의견]
  ['§1.1',          '추출 시작 = 물리 버튼',       '명세 v0.9·v1.1 동일',           '동일 (재확인)',                  '✅ 적용',                            'OK',     ''],
  ['§5.2 / v1.1',   '즐겨찾기 슬롯 수',              '★/☆ 2슬롯 (v1.1)',              '5슬롯 (5/24 reverse)',           '✅ 5슬롯 적용',                       'OK',     ''],
  ['§3.1.6 / v1.1', '펌프 교정 위치',                '검토중 (3안)',                  '관리자 메뉴 이관 (결정)',         '✅ 이관됨',                          'OK',     ''],
  ['v1.1 S0.1',     '권한 4계층',                    '게스트/사용자/디스트리뷰터/개발자', '5/24 언급 없음 (유지 추정)',    '🔴 3 페르소나만 (Excel)',             'P0',     ''],
  ['v1.1 S0.2',     'AWS 인증 트랙',                 '디스트리뷰터 전용 신설',        '5/24 "AWS 플로우 자료 요청"',     '🔴 미구현',                          'P0',     ''],
  ['v1.1 S2.1.7',   '매뉴얼 큐 그리드 5×6',          '즐겨찾기와 분리된 별도 영역',    '5/24 언급 없음',                  '🔴 미구현 (즐겨찾기만 있음)',         'P1',     ''],
  ['v1.1 S4.3',     '연결 설정 폼 — 등록 머신 관리', '원본 IP/AWS 폼 제거 → "등록 머신 관리" + 고급 파라미터', '5/24 언급 없음', '🔴 v0.9 폼 그대로',                  'P1',     ''],
  ['v1.1 S4.5',     '부품 시리얼 페이지',             '본체/보일러/워터펌프/솔밸브2/실리콘 6종', '5/24 언급 없음',          '🔴 미구현',                          'P1',     ''],
  ['v1.1 S4.4.0',   '보안 정보 검색·필터 바',         '기간/코드/소스/심각도/키워드',   '5/24 언급 없음',                  '🔴 미구현',                          'P1',     ''],
  ['v1.1 S4.4.0.p', '권한별 FATAL 마스킹',           '디스트리뷰터 일부 숨김',          '5/24 언급 없음',                  '🔴 미구현',                          'P1',     ''],
  ['v1.1 S5.1.4',   '펌웨어 모듈 선택',              '전체 또는 선택 업데이트',         '5/24 명시 안 됨',                 '⚠️ 보드 4개 표시만, 선택 미구현',     'P1',     ''],
  ['v1.1 S6.2.6',   '레시피 1차 세팅 오류 팝업 4종', 'P-RECIPE-VALIDATE-1/2 + CONFLICT + RUNTIME', '5/24 §10.5 validation 멘트', '⚠️ Stage validation만 부분 (스테이지 모달 안)', 'P1',     ''],
  ['v1.1 S8.3',     '사용 실적 보강',                'KPI 4개 + 일별 막대 + 검색·필터 + AWS+태블릿 듀얼 + 권한별 노출', '5/24 강조 (§6 핵심 deliverable)', '⚠️ KPI 3 / 차트 없음 / 검색 없음 / AWS 듀얼 없음', 'P0',     ''],
  ['v1.1 전체',     '"엔지니어링" → "관리자" 용어',  '일괄 통일',                       '5/24 "엔지니어링 메뉴" 그대로 사용 (현재)', '🔴 사이드바·탑·코드에 "엔지니어링" 잔존', 'P0',     ''],
  ['5/24 §10.5',    '⚠️ 설정값 직접 편집 UI',        'v1.1: 카드별 picker 모달',       '5/24: min/max validation 멘트 요구', '🔴 미구현 (표시만)',                'P0',     ''],
  ['5/24 §10.5',    'min/max validation 팝업',       '없음',                           '5/24 "최댓값은 OO 입니다" 멘트',  '⚠️ 레시피 스테이지·메인 input만 적용',  'P1',     ''],
  ['5/24 §12.3',    '펌웨어 자동 정책',              'v0.9 "항상 체크/한번만/절대안함"', '5/24 동일 (Always/Once/Never)', '🔴 "전원 켤 때마다/하루1회/주1회"로 잘못 매핑', 'P0',     ''],
  ['5/13 §1',       '추출구별 파스텔톤 배경 차별화', '5/13 결정',                       '5/24 미언급 (유지 추정)',         '🔴 단색 배경',                       'P2',     ''],
  ['5/13 §1',       '연결 상태 빨간색 → 초록색',     '5/13 결정',                       '5/24 미언급',                     '⚠️ "● 연결됨" 확인 필요',             'P2',     ''],
  ['5/13 §3',       '태블릿/장비 스피커 ON/OFF',     '5/13 결정',                       '5/24 미언급',                     '🔴 미구현',                          'P2',     ''],
  ['5/13 §3',       'LED Bar (2개) ON/OFF',          '5/13 결정',                       '5/24 미언급',                     '🔴 미구현',                          'P2',     ''],
  ['5/13 §3',       'WiFi 브라우저 내 처리',         '5/13 결정',                       '5/24 미언급',                     '🔴 미구현',                          'P2',     ''],
  ['v1.1 명세',     '수량 센서 / 수질 센서',         '명세 v0.9에 명시',                '5/24 미언급',                     '🔴 미구현',                          'P2',     ''],
  ['v1.1 명세',     '레시피 물붓기 범위 (cup)',       '명세 v0.9: 뜸들이기 cup + 추출 cup', '5/24 미언급',                  '🔴 미구현',                          'P2',     ''],
  ['v1.1 S4.2',     '공장 초기화 5 카테고리',         '로그&오류/레시피/사용자/장비설정/보안', '5/24 미언급',                 '⚠️ 보안 데이터 카테고리 확인 필요',     'P2',     ''],
  ['v1.1 메인',     '메인 헤더: 클라우드 접속/총 추출/타임존', 'v1.1 S2.1.2 보강',         '5/24 미언급',                     '🔴 미구현 (보일러/시계/연결만)',      'P2',     ''],
  ['§3 §4',         '추출 estimation "추산값" 안내',  '명세에 명시',                     '5/24 §3 강조',                    '✅ /brewing 페이지 "펌프시간×유속" 명시', 'OK', ''],
  ['§14',           '에러 모달 다양화',              'P-CONN-FAIL 외 신규',             '5/24 §14',                        '⚠️ confirm-connection-fail만',         'P1',     ''],
  ['§9',            '즐겨찾기 드래그 위치 변경',     '5/24 트렌드',                     '보류 결정',                       '🔴 미구현 (탭+picker)',               'BOR',    ''],
  ['§2.1',          '단계 표시 시각화',              '원 분할/사다리/막대',             '디자이너 결정',                   '⚠️ 큰 % + 단계 N/M 텍스트만',         'BOR',    ''],
  ['§8.6',          'WiFi 2개 (USB 허브)',           '미결',                            '미결',                            '🔴 미구현',                          'BOR',    ''],
  ['§15.4',         '로그 백업 위치',                'AWS/USB/태블릿',                  '미결',                            '🔴 미구현',                          'BOR',    '']
];

const s8 = wb.addWorksheet('❓ 결정 대기', { views:[{showGridLines:false}]});
s8.addRow(['']);
s8.mergeCells('A1:G1');
const t8 = s8.getCell('A1');
t8.value = '❓  v1.1 vs 5/24 차이 + 미반영 항목 — 5/27 마감 전 우선순위 의사결정';
t8.font = { bold:true, size:16, color:{argb:'FFFFFFFF'}, name:'Pretendard'};
t8.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FFA84300'}};
t8.alignment = { horizontal:'left', vertical:'middle', indent:1};
s8.getRow(1).height = 34;
s8.columns = [{width:10},{width:32},{width:32},{width:32},{width:36},{width:8},{width:22}];
const h8 = s8.addRow(['회의/명세 §', '항목', 'v1.1 결정', '5/24 결정', '현재 상태', '우선순위', '대표님 의견']);
styleHeader(s8.getRow(h8.number));
s8.getCell(h8.number, 7).fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FF92400E'}};
CONFLICTS_PENDING.forEach(row => {
  const r = s8.addRow(row);
  styleDataRow(r, 32);
  s8.getCell(r.number, 1).font = { size:9.5, bold:true, color:{argb:'888888'}, name:'Pretendard'};
  s8.getCell(r.number, 2).font = { size:10.5, bold:true, color:{argb:C.text}, name:'Pretendard'};
  // 현재 상태 컬러
  const state = String(s8.getCell(r.number, 5).value || '');
  if (state.includes('🔴')) {
    s8.getCell(r.number, 5).font = { size:10, bold:true, color:{argb:C.err}, name:'Pretendard'};
  } else if (state.includes('⚠️')) {
    s8.getCell(r.number, 5).font = { size:10, color:{argb:C.warn}, name:'Pretendard'};
  } else if (state.includes('✅')) {
    s8.getCell(r.number, 5).font = { size:10, color:{argb:C.ok}, name:'Pretendard'};
  }
  // 우선순위 배지
  const prio = String(s8.getCell(r.number, 6).value || '');
  const pCell = s8.getCell(r.number, 6);
  pCell.alignment = { horizontal:'center', vertical:'middle'};
  pCell.font = { size:9.5, bold:true, color:{argb:C.white}};
  if (prio === 'P0')         pCell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:C.err}};
  else if (prio === 'P1')    pCell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:C.warn}};
  else if (prio === 'P2')    pCell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FFCBD5E1'}};
  else if (prio === 'OK')    pCell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:C.ok}};
  else if (prio === 'BOR')   { pCell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FF9CA3AF'}}; pCell.value = '보류'; }
  s8.getCell(r.number, 7).fill = { type:'pattern', pattern:'solid', fgColor:{argb:C.noteCol}};
});
s8.views = [{state:'frozen', ySplit:2, showGridLines:false}];

/* ═════════════════════════════════════════════════════════════════
   시트 2/3: 기존 26 task 데이터 (간소화 — TASK 표만)
   wireframe v6.0 화면 ID(S0~S8.3)와 매핑됨
   ═════════════════════════════════════════════════════════════════ */
const TASKS = [
  // (이전 v2의 26 task — T01 정정본 유지)
  // [id, persona, cat, name, persona_label, freq, duration, goal, note, steps]
  ['T01', 'barista', 'daily', '커피 추출 모니터링 (실제 시작은 물리 버튼)', '바리스타 (게스트~)', '하루 N회', '3~5분', '장비 앞 물리 버튼으로 시작 → 태블릿 모니터링',
    '⚠ §1.1: 태블릿에서 추출 커맨드 X. /api/brew/start 호출 없음 — 모두 외부 트리거.',
    [['사이드바 [메인]','/main 5구 카드'],
     ['레시피 박스/슬롯 클릭 (선택)','confirm "OO → XX로 변경?"'],
     ['장비 앞으로','머신 추출구 앞'],
     ['물리 버튼 누름','WHP → status: extracting'],
     ['진행률·단계 N/M 확인','단계별 progress'],
     ['완료 → 30초 점멸','서빙 후 자동 idle']]],
  ['T02', 'barista', 'daily', '추출 중단', '바리스타', '예외 상황', '5초', '진행 중 추출 즉시 멈춤',
    '회의 보강 — /brewing 페이지 [중단] 또는 물리 리셋',
    [['/brewing [중단] 클릭','confirm "추출 중단?" · 중단/계속'],
     ['중단 확인','clearInterval / 백엔드 API'],
     ['메인 복귀','/main']]],
  ['T03', 'barista', 'daily', '메인에서 레시피 매뉴얼 변경', '바리스타', '추출 전', '15초', '즐겨찾기 외 레시피로 변경 (§2.2 핵심)',
    '실수 방지 — "OO 들어가있는데 XX로 진짜 바꿀래?" confirm 필수',
    [['메인 카드 레시피 박스 클릭','recipe-picker 전체 리스트'],
     ['레시피 선택','confirm "현재 OO → XX?"'],
     ['ok: 변경','Toast + 카드 즉시 반영']]],
  ['T04', 'barista', 'daily', '즐겨찾기 슬롯으로 빠른 변경', '바리스타', '추출 전', '8초', '슬롯 1~5 클릭 즉시 변경', null,
    [['즐겨찾기 슬롯 N 클릭','confirm "OO → XX?"'],
     ['ok: 변경','카드 즉시 반영 + Toast']]],
  ['T05', 'barista', 'system', '언어 변경 (KO ↔ EN)', '바리스타', '간헐', '2초', 'UI 언어 토글 (노트 → Description)', null,
    [['탑바 [KO ▼] 클릭','IRI18n.set("en")'],
     ['Toast 확인','"English로 변경"']]],
  ['T06', 'barista', 'system', '장비 종료', '바리스타 (마감)', '일 1회', '5초', '소프트 → 물리 스위치 2단계',
    '2단계 모달 (블로킹 2.5초 → 전원 스위치 OFF 안내)',
    [['탑바 [전원] 클릭','confirm "종료?" · 종료/취소'],
     ['종료 확인','Modal "⏳ 종료 중" (블로킹)'],
     ['2.5초 자동','STEP2 자동'],
     ['Modal "전원 스위치 OFF 안내"','버튼 없음'],
     ['물리 스위치 OFF','머신 종료']]],
  ['T07', 'manager', 'recipe', '새 레시피 추가', '관리자', '주 1-2회', '약 2분', '메인 정보 + 스테이지 (필수: 레시피명·원두명)',
    '§8.3: 스테이지 편집 — 양/휴지/유속(1-3)/물붓기. 마지막 단계 자동 채우기.',
    [['사이드바 [레시피]','/recipes'],
     ['[+ 추가]','폼 모달'],
     ['메인 정보 + 스테이지 입력','추출량 자동 계산'],
     ['[추가]','Toast 완료']]],
  ['T08', 'manager', 'recipe', '레시피 편집', '관리자', '필요 시', '1-2분', '기존 레시피 + 스테이지 수정', null,
    [['/recipes → 레시피 선택','상세 패널'],
     ['[편집]','모달 (prefill)'],
     ['수정 + [저장]','Toast 완료']]],
  ['T09', 'manager', 'recipe', '레시피 삭제 (단일/다중)', '관리자', '간헐', '20초', '불필요 레시피 제거',
    '다중 선택 시 편집/추가는 막힘',
    [['/recipes','/recipes'],
     ['[다중 선택] 토글','Toast'],
     ['[삭제]','confirm "복구불가" [is-error]'],
     ['[삭제 진행]','Toast (error)']]],
  ['T10', 'manager', 'recipe', '클라우드 다운로드 (디스트리뷰터+ · v1.1)', '디스트리뷰터+', '주기적', '약 1-2초', '클라우드 라이브러리 → 로컬',
    'v1.1 신규 — 디스트리뷰터 권한 필요',
    [['/recipes → [클라우드 받기]','권한 체크 후 모달'],
     ['[다운로드]','Toast → 1.2초'],
     ['완료 Toast','"다운로드 완료 · N개"']]],
  ['T11', 'manager', 'recipe', '클라우드 업로드 (디스트리뷰터+)', '디스트리뷰터+', '주기적', '약 1-2초', '로컬 → 클라우드 (같은 ID 덮어씀)', null,
    [['/recipes → 선택 → [클라우드 올리기]','confirm "업로드?"'],
     ['[업로드]','Toast → 1.2초'],
     ['완료','"업로드 완료 · N개"']]],
  ['T12', 'manager', 'fav', '즐겨찾기 슬롯 편집', '관리자', '간헐', '1-2분', '5×5 = 25 슬롯 매핑',
    'v1.1: 2슬롯 → 5/24: 5슬롯 (현재 적용). 드래그 보류.',
    [['사이드바 [즐겨찾기]','/favorites'],
     ['슬롯 N 클릭','picker + 비우기 옵션'],
     ['레시피 선택','Toast'],
     ['반복 후 [저장]','confirm · 저장']]],
  ['T13', 'manager', 'fav', '즐겨찾기 전체 해제', '관리자', '드물게', '10초', '모든 매핑 초기화', null,
    [['/favorites → [↺ 전체 해제]','confirm [is-error] · 해제'],
     ['[해제]','Toast']]],
  ['T14', 'manager', 'info', '추출 실적 조회 (S8.3 v1.1)', '관리자', '주기적', '1-3분', '레시피별·요일별·시간대별 + 인사이트',
    '⚠ v1.1 보강 필요: KPI 4 / 일별 차트 / 검색 / AWS 듀얼 저장 / 권한별 노출',
    [['사이드바 [추출 실적]','/history'],
     ['기간 필터','전체/이번달/주/오늘'],
     ['레시피별 막대 클릭','드릴다운'],
     ['인사이트 확인','"가장 인기" 등'],
     ['[CSV Export] (디스트리뷰터+)','권한별']]],
  ['T15', 'manager', 'settings', '⚠ 일반 설정 변경 (직접 편집 UI 미구현)', '관리자', '필요 시', '1-3분', '보일러/워터린스/물붓기/레시피 기본값 변경',
    '🔴 P0 미구현 — 카드 표시만, 직접 편집 picker 없음. 5/27 전 picker 추가 필요. §10.5 validation 멘트 적용 불가.',
    [['사이드바 [설정]','/settings/general'],
     ['카드 항목 클릭','⚠ 드립퍼만 picker (나머지 미구현)'],
     ['값 입력 (min/max 자동)','⚠ "최댓값은 OO" 미구현'],
     ['[저장]','confirm · 저장'],
     ['확인','Modal "저장됨"']]],
  ['T16', 'manager', 'maintenance', 'USB 백업 (3 카드 — v1.1)', '관리자', '주기적', '1-2분', '레시피/사용자/장비 설정 데이터',
    'v1.1: 단일 모달 → 3 카드 분리. 권한별 가능 항목.',
    [['설정 → [백업/복구]','/settings/backup'],
     ['USB 인식 확인','자동 표시'],
     ['항목 체크 (다중)','3 카드'],
     ['[실행]','progress 0→100%'],
     ['Modal "백업 완료"','확인']]],
  ['T17', 'manager', 'maintenance', 'USB 복구', '관리자', '예외 상황', '1-2분', 'USB 백업본 → 머신', null,
    [['설정 → [백업/복구]','/settings/backup'],
     ['[USB → 머신] 토글','dir=restore'],
     ['항목 체크','동일'],
     ['[실행]','progress'],
     ['Modal "복구 완료"','확인']]],
  ['T18', 'manager', 'maintenance', '펌웨어 업그레이드 (4 보드)', '관리자', '릴리스 시', '5-10분', 'WHP/MCP/5천원/백 프론트 순차',
    '설치 방식(수동/자동) → 자동일 때만 정책. 정책: 항상 체크/한번만/절대 안함 (⚠ 현재 코드와 다름).',
    [['설정 → [펌웨어]','/settings/firmware'],
     ['설치 방식 (수동/자동)','자동→정책 노출'],
     ['소스 (USB/AWS)','—'],
     ['[버전 체크]','현재/최신'],
     ['[업그레이드]','confirm · 진행'],
     ['4 보드 순차','WHP→MCP→5천원→백프론트']]],
  ['T19', 'engineer', 'install', '머신 처음 설치', '설치 기사', '최초 1회', '약 3분', '신규 머신 → 사용 가능', null,
    [['전원 ON','/setup 자동'],
     ['시리얼/모델/설치일','/setup'],
     ['[설정 저장]','/connect 이동'],
     ['[연결]','~1.5초'],
     ['연결 성공','/main']]],
  ['T20', 'engineer', 'install', 'WiFi 수동 설정 (AP 스캔)', '설치 기사', '실패 시', '약 1분', '자동 실패 시 AP 직접 선택',
    '⚠ §8.6: WiFi 2개 사용 (USB 허브) 미결',
    [['/connect [수동 설정]','/connect/ap-scan'],
     ['AP 목록 선택','SSID + 신호'],
     ['[다음]','WiFi PW 입력']]],
  ['T21', 'engineer', 'admin', '관리자/엔지니어 인증', '디스트리뷰터/개발자', '관리 작업', '20초', '관리자 메뉴 진입 (모든 하위 선결)',
    'v1.1: 5회 실패 → 10분 잠금. AWS 인증 트랙은 디스트리뷰터 전용.',
    [['설정 → [🔒 관리자 메뉴]','로그인 모달'],
     ['ID + PW','입력'],
     ['[연결]','POST /api/admin/login'],
     ['성공','sessionStorage 저장'],
     ['실패','"암호 오류" + 재시도']]],
  ['T22', 'engineer', 'admin', '공장 초기화 (5 카테고리)', '디스트리뷰터+', '드물게', '약 1분', '카테고리별 초기화 (이중 게이트)',
    'v1.1: 5종 — 로그&오류/레시피/사용자/장비설정/보안. ⚠ "보안 데이터" 카테고리 확인 필요.',
    [['관리자 메뉴 → [공장 초기화]','/settings/engineering/factory-reset'],
     ['카테고리 선택','5 라디오'],
     ['[실행]','confirm [is-error]'],
     ['ok: 진행','POST + Toast']]],
  ['T23', 'engineer', 'admin', '펌프 교정 (관리자 이관)', '디스트리뷰터+', '출고/점검 시', '2-5분', '실 추출량 vs 목표 편차 보정',
    '§10.2: 사용자 설정 → 관리자 이관 (5/24 결정)',
    [['관리자 메뉴 → [펌프 교정]','/settings/engineering/pump-calibration'],
     ['편차 확인','+0.10 g/s 등'],
     ['[재교정 시작]','confirm · 시작'],
     ['추출구별 자동','일정 시간']]],
  ['T24', 'engineer', 'admin', '장비 연결 설정 (v1.1 등록 머신 관리)', '디스트리뷰터+', '드물게', '약 2분', '등록 머신 관리 + 고급 파라미터',
    '🔴 v1.1: 원본 IP/AWS 폼 → "등록 머신 관리" 대체. 현재는 v0.9 폼.',
    [['관리자 메뉴 → [장비 연결 설정]','/settings/engineering/connection'],
     ['v1.1: 등록 머신 카드','● 연결됨 / 오프라인'],
     ['[신규 등록] / [별칭 수정]','—'],
     ['고급 파라미터 (선택)','—'],
     ['[저장]','confirm · 변경']]],
  ['T25', 'engineer', 'admin', '부품 시리얼 초기화 (S4.5 v1.1 신규)', '개발자', '교체·수리 시', '1-2분', '부품 6종 시리얼 변경/실적 초기화',
    '🔴 v1.1 신규 — 미구현. 본체/보일러/워터펌프/솔밸브×2/실리콘 가스켓.',
    [['관리자 메뉴 → [부품 시리얼]','/settings/engineering/parts (TBD)'],
     ['부품 표 확인','한계 + 상태'],
     ['[시리얼 변경]','입력 모달'],
     ['"복구불가" → 진행','—']]],
  ['T26', 'engineer', 'info', '시스템 정보 + 보안 로그', '디스트리뷰터+', '필요 시', '1-2분', '시리얼·펌프 실적 / 보안 로그 (마스킹)',
    'v1.1 S4.4: 검색 바 (기간/코드/소스/심각도/키워드) + FATAL 마스킹',
    [['사이드바 [정보]','/info — 3 패널'],
     ['패널 4 [상세] 또는 5초 롱탭','S4.4 보안 정보'],
     ['검색·필터 사용','v1.1 신규'],
     ['[추출구 초기화] / [전체]','confirm [is-error]']]]
];

const PERSONAS = {
  barista: { name:'바리스타 (게스트~사용자)', color:'FFB45309', desc:'머신 AP WiFi PW로 자동 권한 — 별도 로그인 X' },
  manager: { name:'관리자 (디스트리뷰터)',     color:'FF0F766E', desc:'Admin + PW + AWS 매장·레벨 인증. 프랜차이즈/설치자.' },
  engineer:{ name:'엔지니어 (개발자)',         color:'FF334155', desc:'Admin + 마스터 PW. 5회 실패 → 10분 잠금. 전체 권한.' }
};

const s2 = wb.addWorksheet('📊 작업 플로우', { views:[{showGridLines:false}]});
const TOTAL_COLS = 31;
const COL_W = [3, 9,9,9,9, 3, 9,9,9,9, 3, 9,9,9,9, 3, 9,9,9,9, 3, 9,9,9,9, 3, 9,9,9,9, 3];
COL_W.forEach((w, i) => s2.getColumn(i+1).width = w);
const STEP_START_COLS = [2, 7, 12, 17, 22, 27];
const ARROW_COLS = [6, 11, 16, 21, 26];

let row = 1;
s2.mergeCells(row, 1, row, TOTAL_COLS);
const tt = s2.getCell(row, 1);
tt.value = '📊  iRHEA-Light · 사용자 작업 플로우 (User Task Flow)';
tt.font = { bold:true, size:20, color:{argb:C.header}, name:'Pretendard'};
tt.alignment = { horizontal:'left', vertical:'middle', indent:1};
s2.getRow(row).height = 38;
row++;
s2.mergeCells(row, 1, row, TOTAL_COLS);
const sub = s2.getCell(row, 1);
sub.value = TASKS.length + '개 작업 · v1.1 권한 4계층 매핑 · ⚠/🔴 = 미구현/충돌';
sub.font = { size:11, italic:true, color:{argb:'666666'}, name:'Pretendard'};
sub.alignment = { horizontal:'left', vertical:'middle', indent:1};
s2.getRow(row).height = 20;
row += 2;

function renderPersonaBanner(r, key) {
  const p = PERSONAS[key];
  s2.mergeCells(r, 1, r, TOTAL_COLS);
  const cell = s2.getCell(r, 1);
  cell.value = { richText: [
    { text:' ' + p.name, font:{ bold:true, size:16, color:{argb:C.white}, name:'Pretendard'}},
    { text:'  ·  ', font:{ size:11, color:{argb:'FFD1D5DB'}}},
    { text:p.desc, font:{ italic:true, size:11, color:{argb:'FFD1D5DB'}, name:'Pretendard'}}
  ]};
  cell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:p.color}};
  cell.alignment = { horizontal:'left', vertical:'middle', indent:1, wrapText:true };
  s2.getRow(r).height = 36;
}
function renderTaskHeader(r, t) {
  const [id,persona,cat,name,personaLabel,freq,duration,goal,note,steps] = t;
  s2.mergeCells(r, 1, r, TOTAL_COLS);
  const h = s2.getCell(r, 1);
  h.value = id + '  ·  ' + name;
  h.font = { bold:true, size:13, color:{argb:C.white}, name:'Pretendard'};
  h.alignment = { horizontal:'left', vertical:'middle', indent:1};
  h.fill = { type:'pattern', pattern:'solid', fgColor:{argb:C[cat]}};
  s2.getRow(r).height = 26;
  const r2 = r+1;
  s2.mergeCells(r2, 1, r2, TOTAL_COLS);
  const m = s2.getCell(r2, 1);
  m.value = { richText: [
    { text:'👤 '+personaLabel+'   ', font:{size:10.5, bold:true, color:{argb:C.text}, name:'Pretendard'}},
    { text:'⏱ '+freq+' / '+duration+'   ', font:{size:10.5, color:{argb:'555'}}},
    { text:'🎯 '+goal, font:{size:10.5, italic:true, color:{argb:C.text}, name:'Pretendard'}}
  ]};
  m.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FFFAFAFA'}};
  m.alignment = { horizontal:'left', vertical:'middle', indent:1, wrapText:true };
  s2.getRow(r2).height = 24;
  if (note) {
    const r3 = r+2;
    s2.mergeCells(r3, 1, r3, TOTAL_COLS);
    const n = s2.getCell(r3, 1);
    n.value = '📝 ' + note;
    n.font = { size:10, italic:true, color:{argb:'FFA84300'}, name:'Pretendard'};
    n.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FFFFFAEB'}};
    n.alignment = { horizontal:'left', vertical:'middle', indent:1, wrapText:true};
    s2.getRow(r3).height = 22;
    return 3;
  }
  return 2;
}
function renderStep(r, idx, step) {
  const col = STEP_START_COLS[idx];
  if (col === undefined) return;
  s2.mergeCells(r, col, r+2, col+3);
  const cell = s2.getCell(r, col);
  cell.value = { richText:[
    { text:(idx+1)+'.  ', font:{bold:true, size:10.5, color:{argb:'FFD1D5DB'}}},
    { text:step[0], font:{bold:true, size:10.5, color:{argb:C.stepText}, name:'Pretendard'}},
    { text:'\n→ ', font:{size:9.5, color:{argb:'FF9CA3AF'}}},
    { text:step[1], font:{size:9.5, italic:true, color:{argb:'FFD1D5DB'}, name:'Pretendard'}}
  ]};
  cell.alignment = { horizontal:'left', vertical:'middle', wrapText:true, indent:1};
  cell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:C.step}};
  const b = { style:'thin', color:{argb:C.step}};
  cell.border = { top:b, left:b, bottom:b, right:b };
}
function renderArrow(r, col) {
  s2.mergeCells(r, col, r+2, col);
  const cell = s2.getCell(r, col);
  cell.value = '▶';
  cell.alignment = { horizontal:'center', vertical:'middle'};
  cell.font = { size:14, bold:true, color:{argb:C.arrow}};
}

let lastPersona = null;
TASKS.forEach(t => {
  const persona = t[1];
  if (persona !== lastPersona) {
    if (lastPersona !== null) row++;
    renderPersonaBanner(row, persona);
    row += 2;
    lastPersona = persona;
  }
  const headerRows = renderTaskHeader(row, t);
  row += headerRows;
  const stepRow = row;
  s2.getRow(stepRow).height = 20;
  s2.getRow(stepRow+1).height = 20;
  s2.getRow(stepRow+2).height = 20;
  t[9].forEach((step, i) => {
    if (i >= 6) return;
    renderStep(stepRow, i, step);
    if (i > 0) renderArrow(stepRow, ARROW_COLS[i-1]);
  });
  row += 3;
  row++;
});
s2.views = [{state:'frozen', ySplit:3, showGridLines:false}];

/* 시트 3: 📋 작업 단계 표 (간소화 — TASKS 데이터 사용) */
const s3 = wb.addWorksheet('📋 작업 단계 표', { views:[{showGridLines:false}]});
s3.columns = [
  {header:'ID', width:7}, {header:'작업명', width:32}, {header:'카테고리', width:11},
  {header:'페르소나', width:18}, {header:'#', width:4}, {header:'사용자 액션', width:38},
  {header:'화면/응답', width:38}, {header:'대표님 비고', width:24}
];
let lastP3 = null;
TASKS.forEach(t => {
  const [id,persona,cat,name,personaLabel,freq,duration,goal,note,steps] = t;
  if (persona !== lastP3) {
    const p = PERSONAS[persona];
    const hr = s3.addRow(['', '▼  '+p.name+'  —  '+p.desc, '', '', '', '', '', '']);
    hr.height = 24;
    s3.mergeCells(hr.number, 2, hr.number, 8);
    const hCell = s3.getCell(hr.number, 2);
    hCell.font = { bold:true, size:11, color:{argb:C.white}, name:'Pretendard'};
    hCell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:p.color}};
    hCell.alignment = { horizontal:'left', vertical:'middle', indent:1};
    lastP3 = persona;
  }
  if (note) {
    const nr = s3.addRow(['', '📝 '+note, '', '', '', '', '', '']);
    s3.mergeCells(nr.number, 2, nr.number, 8);
    const nc = s3.getCell(nr.number, 2);
    nc.font = { size:9.5, italic:true, color:{argb:'FFA84300'}, name:'Pretendard'};
    nc.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FFFFFAEB'}};
    nc.alignment = { horizontal:'left', vertical:'middle', indent:1, wrapText:true};
    nr.height = 22;
  }
  steps.forEach((step, i) => {
    s3.addRow([
      i===0 ? id : '',
      i===0 ? name : '',
      i===0 ? CAT_LABEL[cat] : '',
      i===0 ? personaLabel : '',
      i+1, step[0], step[1], ''
    ]);
  });
  s3.addRow([]);
});
styleHeader(s3.getRow(1));
s3.getCell(1, 8).fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FF92400E'}};
for (let r=2; r<=s3.rowCount; r++) {
  const c2 = s3.getCell(r, 2).value;
  if (typeof c2 === 'string' && (c2.startsWith('▼') || c2.startsWith('📝'))) continue;
  const idVal = s3.getCell(r, 1).value;
  if (!idVal && !s3.getCell(r, 5).value) { s3.getRow(r).height = 4; continue; }
  styleDataRow(s3.getRow(r), 20);
  s3.getCell(r, 8).fill = { type:'pattern', pattern:'solid', fgColor:{argb:C.noteCol}};
  if (idVal) {
    s3.getCell(r, 1).font = { size:10, bold:true, color:{argb:'666666'}};
    s3.getCell(r, 2).font = { size:10.5, bold:true, color:{argb:C.text}, name:'Pretendard'};
    const cc = s3.getCell(r, 3);
    const key = Object.keys(CAT_LABEL).find(k => CAT_LABEL[k] === cc.value);
    if (key) {
      cc.fill = { type:'pattern', pattern:'solid', fgColor:{argb:C[key]}};
      cc.font = { size:9.5, bold:true, color:{argb:C.white}, name:'Pretendard'};
      cc.alignment = { horizontal:'center', vertical:'middle'};
    }
  }
  s3.getCell(r, 5).alignment = { horizontal:'center', vertical:'middle'};
  s3.getCell(r, 5).font = { size:9.5, bold:true, color:{argb:'888'}};
  s3.getCell(r, 7).font = { size:9.5, italic:true, color:{argb:'555'}, name:'Pretendard'};
}
s3.views = [{state:'frozen', ySplit:1, showGridLines:false}];

/* ─── 저장 ───────────────────────────────────────────── */
wb.xlsx.writeFile(OUT).then(() => {
  console.log('✓ 생성 완료 (v3 · wireframe v6.0 기준):', OUT);
  console.log('  · 시트 1: 🎯 핵심 원칙 (' + PRINCIPLES.length + ') + 회의 변천사 (' + TIMELINE.length + ')');
  console.log('  · 시트 2: 📊 작업 플로우 도식 (' + TASKS.length + ')');
  console.log('  · 시트 3: 📋 작업 단계 표 (' + TASKS.reduce((s,t)=>s+t[9].length,0) + ' 단계)');
  console.log('  · 시트 4: 📺 화면 목록 (' + SCREENS.length + ' — 와이어프레임 v6.0)');
  console.log('  · 시트 5: 🔐 권한 매트릭스 (' + PERMISSION_LEVELS.length + ' 계층 · ' + PERMISSION_MATRIX.length + ' 행)');
  console.log('  · 시트 6: 🪟 팝업 카탈로그 (' + POPUPS_V11.length + ' 종 · ' + POPUP_CONTEXTS.length + ' 컨텍스트)');
  console.log('  · 시트 7: 🔀 화면 진입 매트릭스 (' + TRANSITIONS.length + ' 행)');
  console.log('  · 시트 8: ❓ 결정 대기 / 충돌 (' + CONFLICTS_PENDING.length + ')');
}).catch(e => { console.error('ERROR:', e); });
