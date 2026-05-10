# iRHEA-Light 수정 계획서

**근거 문서**
- `iRHEA-Light-화면명세-V.0.9-260313-1.pptx` (화면 명세 v0.9, 2026-03-15)
- `Function Diagram_iRHEA-Light V.0.9-260315.xlsx` (플로우 다이어그램 + 실제 UI 목업, 2026-03-15)

**현재 코드베이스**
- `/home/stm32mp1/irhea-light-demo/` — Express + EJS, 5-spout "Hand-Drip Cinema" 영문 컨셉

**결정 사항**
- 컨셉을 명세 기준으로 **재구성**한다 (영문 카페형 → 한국어 임베디드 키오스크)
- 시각 자산(편집기 폼, 타임라인, 게이지 SVG 등)은 재활용 가능한 부분만 살린다
- 본 문서는 계획만 기술 — 코드 작성은 별도 단계

---

## 1. 컨셉/디자인 시스템 재정의

### 1.1 시각 시스템 (현재 → 목표)

| 항목 | 현재 (Cinema) | 목표 (명세) |
|---|---|---|
| 배경 | warm cream `#FCFAF4` | 다크 네이비 `#3B5BB0` 계열 |
| 텍스트 | dark brown `#2C2317` | 흰색 `#FFFFFF` |
| 액티브 / 강조 | gold `#C5A059` | 오렌지 `#E37D3D` (선택 탭 / 실행 버튼) |
| 보조 강조 | hairline gold | 노란색 `#F2C94C` (사용 실적 헤더, 알람 헤더) |
| 카드 외곽 | hairline brown | 흰색 1px 외곽선 / 진한 네이비 fill |
| 폰트 | Playfair Display + Georgia + JetBrains Mono | 굵은 산세리프 (Pretendard / Noto Sans KR) — 한글 가독성 우선 |
| 컨테이너 | 1280×800 fit-to-viewport (유지) | 동일 유지 OK |

### 1.2 새 CSS 토큰 파일
- `public/css/theme-irhea.css` 신규 — `:root { --bg-navy, --bg-navy-2, --text-primary, --accent-orange, --accent-yellow, --hairline, --modal-overlay }` 정의
- `public/css/app.css`는 보존하되 cinema-* 클래스를 점진적으로 마이그레이션 (의존도 줄여 삭제 후보로 표시)

### 1.3 한국어화
- `views/layout.ejs`의 `lang="ko"`는 이미 OK
- 폰트 로딩: `views/partials/head.ejs`에 Pretendard CDN 또는 Noto Sans KR 추가
- 모든 사용자 노출 문자열을 한국어로 (별도 i18n 라이브러리 없이 EJS에 직접 작성 — 명세 어휘 그대로 사용)

---

## 2. 라우트 / 화면 매핑

### 2.1 신규 라우트 (server.js에 추가)

| Method | 경로 | 페이지 | 명세 §  |
|---|---|---|---|
| GET | `/setup` | first-time-setup (최초 장비 정보 설정) | (플로우상 추가) |
| GET | `/connect` | connection-status (Not Connected to Machine — 태블릿 측) | 1 |
| GET | `/main` | main (5 추출구 메인 화면) | 2 |
| GET | `/settings/general` | settings-general (환경/보일러/물붓기/펌프/워터린스) | 2.1 |
| GET | `/settings/backup` | settings-backup (USB 백업/복구) | 2.3 |
| GET | `/settings/engineering` | settings-engineering (Admin 보호) | 2.4 |
| GET | `/settings/engineering/factory-reset` | factory-reset | 2.4.1 |
| GET | `/settings/engineering/connection` | connection-config (장비 IP + 클라우드) | 2.4.2 |
| GET | `/settings/firmware` | firmware-upgrade | 2.7 |
| GET | `/info` | info (장비/보일러/물붓기/사용 실적/환경 설정 + 보안 정보 진입) | 2 정보 |
| GET | `/info/security` | info-security (로그/오류/사용 실적, Admin 보호) | (플로우) |
| POST | `/api/admin/login` | (서버측 비번 검증 mock) | 2.4 |

### 2.2 기존 라우트 처리

| 현재 라우트 | 처리 |
|---|---|
| `/` | `/main`으로 리다이렉트 (또는 `/connect`로 부팅 시 분기) |
| `/recipes` | 유지 — 단 12개 레시피 좌측 레일 + 상세 + 즐겨찾기 통합 화면으로 재설계 |
| `/recipe/:id`, `/recipe/:id/edit` | 통합 단일 화면(`/recipes`)으로 흡수, 페이지 내부 상태로 처리 |
| `/brewing`, `/brewing/complete` | 유지 — 단 SVG는 단순화하고 모달형 "추출 완료" 오버레이 추가 |
| `/favorites` | `/main` 또는 `/recipes` 화면 내 통합 (명세상 별도 화면 없음 — 메인 진입의 즐겨찾기 모드) |
| `/alarms`, `/usage`, `/calibration`, `/firmware`, `/system-info` | 삭제 또는 정보/설정 하위 항목으로 흡수. `usage`는 `/info/security`의 사용 실적 패널로, `firmware`는 `/settings/firmware`로, `calibration`은 `/settings/general`의 펌프 교정 패널로 |

---

## 3. 화면별 상세 수정안

### 3.1 `views/pages/setup.ejs` 🆕 (최초 장비 정보 설정)
- 트리거: 일련번호가 비어 있을 때 (mock 조건)
- 표시 필드: 일련 번호, 모델 번호, 펌웨어 버전, 펌웨어 업데이트 일자, 타임존
- 액션: `저장` → `/main` 진입

### 3.2 `views/pages/connect.ejs` 🆕 (태블릿 ↔ 장비 연결)
- 라이트 톤 (목업 image3 기준 — 흰 배경, 태블릿+머신 일러스트, "Not Connected to Machine")
- 하단: `연결` 버튼(파랑) + `설정 변경` FAB(오렌지)
- 연결 실패 시 알림 모달: "연결 실패 / 재시도?" `O / X`

### 3.3 `views/pages/main.ejs` 🔁 (재구성)
- **상단 헤더**: 좌측 `NT-iRHEA 1호기`, 중앙 `추출 가능` 상태 배지, 우측 `보일러: 95도`, 우상단 `종료` 버튼, 우하단 `정보` 버튼
- **추출구 5개 카드 (가로 정렬)**: 각 카드에 원형 게이지(03:45 / 08:00 + 45%), 추출횟수(150회), 상태 라벨(`추출 중` / `추출 완료` / `린스 중` / `워터 중`)
- **현재 선택된 레시피 라벨** (각 추출구 위 노란 박스): `레시피 3`, `레시피 5`...
- **하단 레시피 목록 5×4 그리드**: 즐겨찾기/매뉴얼 선택용 — 추출구별 컬럼
- **하단 액션 바**: `설정` / `레시피` / `즐겨찾기`
- 종료 클릭 → 알림 모달 "장비를 종료합니다. 기다려 주세요" → "장비 종료 완료 / 전원 스위치를 꺼주세요"

### 3.4 `views/pages/settings-general.ejs` 🔁 (settings.ejs 대체)
명세의 5-패널 그리드 그대로 구현:
1. **환경설정**: 추출단위 (% / g) · 알람 (예/아니오) · 기본 드립퍼 (Kalita / Hario / Kalita Wave / Kono / Chemax / December / Melita)
2. **보일러**: 설정온도 (도) — 95
3. **물붓기 범위**: 1~4 Cup별 반지름(mm) 테이블 — 30 / 40 / 45 / 55
4. **펌프 교정**: 기존 유속 ↔ 교정 유속 5행 테이블 (1.0–5.0 g/sec)
5. **워터/린스**: 속도 / 온도 / 온수량 (워터, 린스 2열)
- 상단 탭: `설정`(액티브, 오렌지) / `백업/복구` / `엔지니어링 메뉴` / `펌웨어 업그레이드`
- 우상단: `저장` / `복귀`

### 3.5 `views/pages/settings-backup.ejs` 🆕
- 모달형 카드 (가운데 정렬): "USB 백업/복구"
- 체크박스 3개: 레시피 데이터 / 사용자 데이터 / 장비 설정 데이터
- Machine→USB / USB→Machine 양방향 토글 (탭 또는 라디오)
- 액션: `실행` (오렌지) + 진행률 도넛(`20% PROGRESS`) + `취소`

### 3.6 `views/pages/settings-engineering.ejs` 🆕 (Admin 진입)
- 진입 시 즉시 `Admin 로그인 모달` 표시 (image2 기준)
- 모달: 제목 "관리자 보안 연결", 아이디(Admin 고정), 비밀번호 입력, `연결` / `취소`
- 비번 오류 → "암호 오류 X" 알림
- 인증 성공 후 좌측 사이드 메뉴: `공장 초기화`, `장비 연결 설정`

### 3.7 `views/pages/factory-reset.ejs` 🆕
- 모달형 카드: 5개 데이터 카테고리 라디오/체크 (로그&오류, 레시피, 사용자, 장비 설정, 보안)
- 선택 표시: 녹색 점 ●
- 액션: `실행` + 진행률 + `취소`
- 실행 직전 알림 모달: "복구불가 / 진행하시겠습니까? O X"

### 3.8 `views/pages/connection-config.ejs` 🆕
- 좌측 사이드(공장초기화/연결 설정) — 연결 설정 액티브
- 우측 본문 2-카드:
  - **장비 연결 설정**: 장비 IP address (예: `192.168.1.100`), `연결` 버튼
  - **클라우드 인증**: 매장 (예: `CafénobleT`) / 장비 (예: `1f3c5a8a`) / 권한 (`admin`/`operator`) / 아이디 / 비밀번호, `인증` 버튼
- 우상단: `저장` / `복귀`

### 3.9 `views/pages/firmware-upgrade.ejs` 🔁 (firmware.ejs 대체)
- 카드: "펌웨어 업그레이드" + 진행률 도넛
- 액션 행: `버전 체크` / `업그레이드` (오렌지)
- 정책 토글 (체크박스 또는 세그먼트): 항상 체크 / 한번만 / 절대 안함
- 모드: 수동 / 자동 (라디오)
- 업그레이드 시작 알림 모달: "펌웨어를 업그레이드 합니다. O X"
- 성공/오류 결과 표시

### 3.10 `views/pages/recipes.ejs` 🔁 (recipe-list/detail/edit 통합)
명세의 단일 화면 컨셉 (목업 image10/image20 기준):
- **좌측 레일**: 레시피 1~12, 각 항목 우측에 즐겨찾기 추출구 번호 칩(예: `1` `2` `5`)
- **중앙 카드 — 레시피 Main**: 레시피명 / 원두명 / 원두량 / 추출 비율 (1:12) / 물 붓기 범위(뜸들이기·추출 cup) / 추출 단위 (Percent %) / 온수온도(도)
- **중앙 카드 — 레시피 Description**: 드립퍼 / 분쇄도 / 배전도 / 태스팅 노트
- **우측 카드 — 레시피 Stage**: 단계(뜸들이기 + 1st/2nd/3rd/4th) × (물붓기 양 ml, 휴지시간 sec, 유속 ml/sec, 물붓기 비율 %)
- 상단: `레시피 추가` 또는 `레시피 편집` 버튼
- 하단: `추가` / `편집` / `삭제` (선택 모드 시) + 우하단 `추출` (오렌지 원형 버튼)
- 편집 모드 진입 시 home/back/즐겨찾기 버튼이 우상단에 추가됨 (image20)

### 3.11 `views/pages/brewing.ejs` ⚠️ (재활용 + 단순화)
- 핵심 추출 SVG는 보존하되 색상 토큰을 새 테마에 맞게 변경
- 추출 완료 시 화면 전체 모달 오버레이 (목업 image21/image22): 큰 도넛 게이지 100%, `BREWING COMPLETED`, 시간(MM:SS / TARGET), `STRENGTH` / `TEMP` 표시, 액션 `취소` / `저장` / `즐겨찾기`

### 3.12 `views/pages/info.ejs` 🆕 (정보 — 일반 정보)
명세의 정보 화면 (목업 image13 기준): 6-패널 카드 그리드
- 장비 정보 (일련번호, 모델, 펌웨어 버전, 업데이트 일자, 타임존, 최초 설치일)
- 보일러 정보 (일련번호, 모델, 펌웨어 버전, 업데이트 일자, 워터펌프 모델, 솔 밸브, 온도)
- 물붓기 범위 (1~4 cup 반지름)
- 사용 실적 (총 추출횟수 + 레시피별 추출횟수/원두량 + 부품 사용 실적)
- 환경 설정 (현재 설정값 요약)
- 우하단: `복귀`, `보안 정보` 진입 (오렌지 ovel 버튼)

### 3.13 `views/pages/info-security.ejs` 🆕 (보안 정보 — 4 패널)
명세 (목업 image15 기준): Admin 인증 후 진입
- 좌상: 로그 정보 (시스템 로그 + `로그 백업` 버튼)
- 우상: 오류 발생 정보 (일시 + 오류코드 표)
- 좌하: 사용 실적 정보 (펌프 사용량, 추출 실적 1st~5th + `초기화`, `전체 초기화`)
- 우하: 오류 상세 정보 -1 (선택된 오류 디테일)
- 우하단: `복귀`

---

## 4. 모달/팝업 시스템 (전체 신규)

### 4.1 공통 컴포넌트
- `views/partials/modal.ejs` 신규 — `<%- include('../partials/modal', { id, title, body, actions }) %>` 패턴
- `public/js/components/modal.js` 신규 — `openModal(id)`, `closeModal(id)`, `confirmModal({title, body, onOk, onCancel})`

### 4.2 표준 알림 모달 (목업 기준 노란 헤더 "알림" + 본문 + O/X 버튼)

| ID | 본문 | 버튼 | 트리거 |
|---|---|---|---|
| `alert-password-error` | 암호 오류 | X | Admin 로그인 실패 |
| `alert-extract-press` | 추출구의 버튼을 눌러주세요 | X | 추출 시작 후 사용자 물리 버튼 대기 |
| `alert-shutdown` | 장비를 종료합니다. 기다려 주세요 | (없음) | `종료` 버튼 |
| `alert-shutdown-done` | 장비 종료 완료 / 전원 스위치를 꺼주세요. | (없음) | 종료 완료 |
| `confirm-firmware` | 펌웨어를 업그레이드 합니다. | O / X | 업그레이드 시작 |
| `confirm-connection-change` | 장치 연결 설정을 변경 합니다. | O / X | 연결 설정 저장 |
| `confirm-connection-fail` | 연결 실패 / 재시도? | O / X | 연결 실패 |
| `confirm-irreversible` | 복구불가 / 진행하시겠습니까? | O / X | 공장초기화/포맷 직전 |

### 4.3 모달 스타일
- 노란 헤더 바 (`#F2C94C`, height ≈ 28px) + "알림" 흰 굵은 텍스트
- 본문: 큰 오렌지 텍스트(에러는 빨강) — `암호 오류` 같은 단어형
- 외곽: 진한 네이비 + 흰 1px 외곽선 + 둥근 모서리

---

## 5. Mock 데이터 추가/변경 (`mock/`)

### 5.1 신규
- `mock/system-config.json` — 일련번호, 모델번호, 펌웨어 버전/일자, 타임존, 최초 설치일
- `mock/boiler-info.json` — 보일러 일련/모델/워터펌프/솔밸브/온도
- `mock/pour-range.json` — 1~4 Cup 반지름
- `mock/pump-calibration.json` — 5단계 유속 매핑
- `mock/water-rinse.json` — 워터/린스 속도·온도·온수량
- `mock/connection.json` — 장비 IP, 매장, 장비ID, 권한, 아이디
- `mock/admin-credentials.json` — `{ "username": "Admin", "password": "irhea2026" }` (mock 검증용)
- `mock/error-log.json` — 일시 + 오류코드 (37RDF 등) + 상세
- `mock/system-log.json` — 부팅 로그 등
- `mock/usage-stats.json` — 펌프 사용량 1st~5th, 추출횟수 1st~5th, 레시피별 추출 카운트

### 5.2 변경
- `mock/recipes.json` — 명세 필드로 전환:
  - 기존 `bloom`, `stages[]` (bloom/pause/pour/spiralType...) →
  - 신규 `bloom: { volumeMl, holdSec, flowRate, ratioPct }` + `stages: [{ name: '1st'|'2nd'|'3rd'|'4th', extractRatioPct, holdSec, flowRate, ratioPct }]`
  - `description`: { dripper, grindSize: 'Compak R80 90', roastLevel: 'Agtron : 87', tastingNote }
  - `main`: { name, beanName, beanWeight, extractRatio: '1:12', pourCup: { bloom, extract }, unit, waterTemp }
  - `favoriteSpouts: number[]` (예: [1,2,5])
- `mock/spouts.json` — 추출구별 currentRecipeId, status (`idle|brewing|complete|water|rinse`), 추출횟수, 진행시간

### 5.3 삭제 후보
- `mock/alarms.json`, `mock/brew-defaults.json`, `mock/brew-sessions.json`, `mock/common-env.json`, `mock/favorites.json`, `mock/usage-info.json` — 위 신규 mock에 흡수

---

## 6. server.js 변경

- 페이지 라우트 위 표(2.1)대로 추가, 미사용 라우트 제거
- `app.post('/api/admin/login')` — `mock/admin-credentials.json` 비교 → 200 / 401
- `app.post('/api/factory-reset')` — 카테고리 array 받아서 mock 응답 (실제 동작 X)
- `app.post('/api/firmware/check')`, `app.post('/api/firmware/upgrade')` — mock 진행 응답
- 추출 시뮬레이터: `app.post('/api/spouts/:id/extract'|'water'|'rinse')` (1초/5초/10초 물리 버튼 시나리오를 키 핸들러로 트리거)

---

## 7. 부수 / 정리

- `views/partials/sidebar.ejs` 삭제 — 명세상 사이드바 없음 (탑바 4탭 + 메인 액션바)
- `views/partials/navrail.ejs` 폐기 또는 명세 탭바로 재작성
- `views/partials/screen-header.ejs` — 한국어/네이비 톤으로 재작성
- `public/js/pages/*` — 페이지별 JS는 새 화면 단위로 재작성 (단, gauge.js / progress-ring.js / timeline.js 컴포넌트는 보존)
- `docs/` 정적 export 폴더는 새 빌드 후 재생성 — 지금은 그대로 두고 마지막에 `node build.js` 재실행

---

## 8. 단계별 빌드 순서 (제안)

| 단계 | 범위 | 산출물 | 검증 |
|---|---|---|---|
| 1 | 디자인 시스템 | `theme-irhea.css`, 한글 폰트 로드 | `/` 접속 시 다크 네이비 확인 |
| 2 | 모달 시스템 | `partials/modal.ejs`, `components/modal.js`, 8개 표준 알림 모달 | 임시 페이지에서 모달 호출 |
| 3 | P0 신규 페이지 (1) | `/connect`, `/setup`, 알림 흐름 | 시리얼 비어있음 mock으로 부팅 → 연결 흐름 |
| 4 | P0 신규 페이지 (2) | `/settings/engineering`, `/settings/engineering/factory-reset`, `/settings/engineering/connection`, Admin 로그인 | 비번 오류/성공 양 케이스 |
| 5 | P0 신규 페이지 (3) | `/settings/backup`, `/settings/firmware` | 진행률 도넛 동작 |
| 6 | P1 재작성 — Settings | `/settings/general` (5 패널) | 명세 필드 일치 확인 |
| 7 | P1 재작성 — Main | `/main` (5-spout + 상태 + 추출횟수 + 종료) | 추출/워터/린스/취소 mock 동작 |
| 8 | P1 재작성 — Recipes | `/recipes` 통합 화면, 레시피 mock 스키마 전환 | 12 레시피 + Main/Stage/Description |
| 9 | P1 재작성 — Brewing | `/brewing` 색상 + 완료 모달 | 추출 시작 → 진행 → 완료 모달 |
| 10 | P2 — Info | `/info`, `/info/security` | 6-패널 + 보안 진입 |
| 11 | 정리 | 미사용 페이지/mock 삭제, navrail/sidebar 제거, `node build.js` 재생성 | 기존 미사용 라우트 404 |

---

## 9. 미해결 / 의사결정 필요

- **물리 버튼 시뮬레이션**: 1초=추출 / 5초=워터 / 10초=린스 — 키보드 누름 길이 인식으로 재현할지, 화면 내 가상 버튼 long-press로 재현할지
- **AWS 클라우드 인증**: mock에서 항상 성공/실패 토글로 가능하게 할지, fetch URL을 가짜 응답으로 줄지
- **레시피 즐겨찾기 매핑**: 명세상 한 레시피가 여러 추출구에 매핑됨 (`레시피 1` → 1, 2, 5 추출구). 데이터 모델: `recipe.favoriteSpouts: number[]` vs `spout.favoriteRecipeIds: number[]` — 후자가 메인 화면 렌더에 더 자연스러움
- **언어**: 한국어 단일 vs i18n 구조. 명세상 한국어 단일이면 EJS에 직접 작성이 가장 단순
- **추출 단위 (% vs g)** 토글이 레시피 표시에 어떻게 반영되는지 (Stage 표는 mL과 % 모두 보여야 할 수도)
- **`docs/` 정적 export** 유지 여부 (Yocto 배포 시 사용 중인지 확인 필요)

---

## 10. 영향 받는 파일 요약

**신규** (페이지 9 + 모달 1 + JS/CSS 다수)
```
views/pages/setup.ejs
views/pages/connect.ejs
views/pages/main.ejs
views/pages/settings-general.ejs
views/pages/settings-backup.ejs
views/pages/settings-engineering.ejs
views/pages/factory-reset.ejs
views/pages/connection-config.ejs
views/pages/firmware-upgrade.ejs
views/pages/recipes.ejs               (recipe-list/detail/edit 통합)
views/pages/info.ejs
views/pages/info-security.ejs
views/partials/modal.ejs
views/partials/topbar-tabs.ejs        (설정/백업/엔지니어링/펌웨어 4탭)
public/css/theme-irhea.css
public/js/components/modal.js
public/js/pages/main.js
public/js/pages/recipes.js
public/js/pages/settings-general.js
... (페이지별 JS)
mock/system-config.json
mock/boiler-info.json
mock/pour-range.json
mock/pump-calibration.json
mock/water-rinse.json
mock/connection.json
mock/admin-credentials.json
mock/error-log.json
mock/system-log.json
mock/usage-stats.json
```

**수정**
```
server.js                              (라우트 재구성)
views/layout.ejs                       (스크립트 매핑)
views/partials/head.ejs                (한글 폰트)
mock/recipes.json                      (스키마 전환)
mock/spouts.json                       (상태/현재 레시피/추출횟수)
public/css/app.css                     (cinema-* 분리/축소)
```

**삭제**
```
views/pages/dashboard.ejs              (→ main.ejs)
views/pages/recipe-list.ejs            (→ recipes.ejs)
views/pages/recipe-detail.ejs          (→ recipes.ejs)
views/pages/recipe-edit.ejs            (→ recipes.ejs)
views/pages/favorites.ejs              (→ main.ejs / recipes.ejs)
views/pages/alarms.ejs
views/pages/usage.ejs                  (→ info-security.ejs)
views/pages/calibration.ejs            (→ settings-general.ejs 펌프교정 패널)
views/pages/firmware.ejs               (→ firmware-upgrade.ejs)
views/pages/system-info.ejs            (→ info.ejs)
views/pages/brewing-complete.ejs       (→ brewing.ejs 내 모달)
views/partials/navrail.ejs
views/partials/sidebar.ejs
views/partials/bottomnav.ejs           (확인 후 — 명세에 동일 기능 없으면)
mock/alarms.json
mock/brew-defaults.json
mock/brew-sessions.json
mock/common-env.json
mock/favorites.json
mock/usage-info.json
```

---

**다음 단계 제안**: 9번(미해결 항목) 의사결정 후 1단계(디자인 시스템)부터 코드 작성 시작. 단계별 산출물이 명확해 한 단계씩 검증 가능한 구조로 잡았습니다.

---

## 11. 구현 상태 (2026-05-10 진행)

전 11단계 모두 1차 구현 완료. 서버는 `node server.js`로 실행, http://localhost:3000 에서 동작 확인.

| 단계 | 상태 | 산출물 |
|---|---|---|
| 1 디자인 시스템 | ✅ | `public/css/theme-irhea.css` (--ir-* 토큰), Pretendard 폰트 |
| 2 모달 시스템 | ✅ | `views/partials/modal.ejs` + `IRModal` 전역, 8 사전정의 알림 |
| 3 setup / connect | ✅ | 최초 장비 정보, 태블릿 ↔ 장비 연결 화면 |
| 4 엔지니어링 메뉴 | ✅ | Admin 로그인 모달, 공장초기화, 연결 설정 (sessionStorage 기반 세션) |
| 5 백업/복구 + 펌웨어 | ✅ | USB 백업/복구 양방향, 버전 체크/업그레이드 + 정책·모드 |
| 6 설정 5패널 | ✅ | 환경설정·보일러·물붓기 범위·펌프 교정·워터/린스 |
| 7 메인 5-spout | ✅ | 추출구 카드 5개, 상태 칩, 추출횟수, 즐겨찾기 그리드, 종료/정보 |
| 8 레시피 통합 | ✅ | 좌측 12 레시피 + Main/Description/Stage 3섹션, 추가/편집/삭제/추출 |
| 9 추출/완료 모달 | ✅ | `/brewing` 진행 화면 + 100% 시 BREWING COMPLETED 오버레이 |
| 10 정보 / 보안 정보 | ✅ | 6패널 + 4패널, Admin 보호된 보안 정보 |
| 11 정리 | ✅ | 레거시 page/partial/mock/JS 삭제, server.js 슬림 |

**남은 정리 사항 (P3)**
- `?dev=1` 쿼리 인증 우회는 데모용. 실제 배포 전 제거하거나 `NODE_ENV !== 'production'` 가드 추가
- `mock/system-config.json`의 `configured: false` 시퀀스를 시연하려면 mock 또는 `/api/system-config/configure`가 실제로 상태를 토글해야 함 (현재는 200만 반환, 페이지는 `/connect`로 이동)
- 물리 버튼 (1초/5초/10초) 시뮬레이션, AWS 클라우드 인증 라이브, 한글 폰트 self-host (Pretendard CDN → 로컬), `docs/` 정적 export 재생성 — 9번 미해결 의사결정 항목과 동일

**파일 구성 (최종)**
```
mock/                              13 JSON
views/
  layout.ejs
  partials/
    head.ejs                       Pretendard + theme-irhea.css
    modal.ejs                      IRModal API
    settings-shell.ejs             4탭 + 저장/복귀
    settings-shell-close.ejs
    ir-stub.ejs                    placeholder (현재 미사용)
    toast.ejs
  pages/
    setup.ejs        connect.ejs   main.ejs
    recipes.ejs      brewing.ejs   brewing-complete.ejs
    settings-general.ejs           settings-backup.ejs
    settings-engineering.ejs       factory-reset.ejs
    connection-config.ejs          firmware-upgrade.ejs
    info.ejs         info-security.ejs
public/
  css/theme-irhea.css
server.js                          전 라우트 + mock API
```

**실행**
```bash
cd irhea-light-demo
node server.js          # http://localhost:3000
```
부팅 흐름: `/` → 설정됨이면 `/main`, 미설정이면 `/setup` → `/connect` → `/main`. 엔지니어링 진입 시 Admin 로그인 (Admin / irhea2026).

